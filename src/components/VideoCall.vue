<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { toRefs } from "vue";
import Peer from "peerjs";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Close from "vue-material-design-icons/Close.vue";
import ArrowExpandIcon from "vue-material-design-icons/ArrowExpand.vue";
import ArrowCollapseIcon from "vue-material-design-icons/ArrowCollapse.vue";

import { storeToRefs } from "pinia";
import { useVideoCallOpen } from "../store/video-call-store";

const videoCall = useVideoCallOpen();
const { expand, videoCallOpen } = storeToRefs(videoCall);
// PROPS
const props = defineProps({
  callTo: { type: String, required: true }, // ID of the user to call
});
const { callTo } = toRefs(props);

// let expand = ref(false);
// Firebase setup
const db = getFirestore();
const auth = getAuth();
const userId = auth.currentUser?.uid || "unknown_user"; // Get logged-in user ID
const userName = auth.currentUser?.displayName;

// Refs
const localVideo = ref(null);
const remoteVideo = ref(null);
const peer = ref(null);
const call = ref(null);
const peerId = ref(null);
const incomingCall = ref(false);
const incomingCallerId = ref(null);
const incomingCallerPeerId = ref(null); // Peer ID of the caller
const incomingCallDocId = ref(null); // Firestore document ID for the call request

// Cleanup function to close streams and connections
const cleanup = () => {
  if (call.value) {
    call.value.close();
    call.value = null;
  }
  if (localVideo.value?.srcObject) {
    localVideo.value.srcObject.getTracks().forEach((track) => track.stop());
    localVideo.value.srcObject = null;
  }
  if (remoteVideo.value?.srcObject) {
    remoteVideo.value.srcObject.getTracks().forEach((track) => track.stop());
    remoteVideo.value.srcObject = null;
  }
  incomingCall.value = false;
  incomingCallerId.value = null;
  incomingCallerPeerId.value = null;
  incomingCallDocId.value = null;
};

// Initialize PeerJS
const initializePeer = () => {
  peer.value = new Peer();

  peer.value.on("open", (id) => {
    console.log("My Peer ID:", id);
    peerId.value = id;
  });

  peer.value.on("call", (incomingCall) => {
    console.log("🚀 Incoming PeerJS call received!", incomingCall);

    // Answer the call automatically (no need for callee to click "Accept" again)
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideo.value) {
          localVideo.value.srcObject = stream;
        }

        // Answer the call with the local stream
        incomingCall.answer(stream);

        // Listen for the remote stream
        incomingCall.on("stream", (remoteStream) => {
          console.log("✅ Received remote stream from caller");
          if (remoteVideo.value) {
            remoteVideo.value.srcObject = remoteStream;
          }
        });
      })
      .catch((err) => {
        console.error("🎥 Error accessing media devices", err);
      });
  });

  peer.value.on("error", (err) => {
    console.error("PeerJS Error:", err);
    // Reinitialize PeerJS on error
    initializePeer();
  });
};

// Listen for Firestore call requests
const setupFirestoreListener = () => {
  const q = query(
    collection(db, "calls"),
    where("receiver", "==", userId),
    where("status", "==", "pending")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log("📞 New call request received:", data);

      incomingCall.value = true;
      incomingCallerId.value = data.senderName;

      incomingCallerPeerId.value = data.callerPeerId;
      incomingCallDocId.value = doc.id; // Store the Firestore document ID
    });
  });

  return unsubscribe;
};

// Start Call (Caller)
const startCall = async () => {
  if (!peer.value || !peerId.value) {
    console.error("Peer not initialized");
    return;
  }

  console.log("Sending call request to:", callTo.value);

  // Send a Firestore message with the call request
  try {
    await addDoc(collection(db, "calls"), {
      sender: userId,
      senderName: userName,
      receiver: callTo.value,
      callerPeerId: peerId.value, // Send the caller's peerId
      status: "pending", // Call status
      timestamp: new Date(),
    });
    console.log("Call request sent!");
  } catch (err) {
    console.error("Error sending call request:", err);
  }
};

// Accept Call (Callee)
const acceptCall = async () => {
  videoCallOpen.value = true;
  if (!incomingCallerPeerId.value) {
    console.error("No incoming call to accept");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (localVideo.value) {
      localVideo.value.srcObject = stream;
    }

    // Call the caller using their peerId
    call.value = peer.value.call(incomingCallerPeerId.value, stream);

    // Listen for the remote stream
    call.value.on("stream", (remoteStream) => {
      console.log("✅ Received remote stream from caller");
      if (remoteVideo.value) {
        remoteVideo.value.srcObject = remoteStream;
      }
    });

    // Update the call status in Firestore to "accepted"
    if (incomingCallDocId.value) {
      await deleteDoc(doc(db, "calls", incomingCallDocId.value));
    }

    incomingCall.value = false;
    incomingCallerId.value = null;
    incomingCallerPeerId.value = null;
    incomingCallDocId.value = null;
  } catch (err) {
    console.error("🎥 Error accessing media devices", err);
  }
};

// Reject call
const rejectCall = async () => {
  if (incomingCallDocId.value) {
    await deleteDoc(doc(db, "calls", incomingCallDocId.value));
  }
  cleanup();
};

// End call
const endCall = () => {
  cleanup();
  expand.value = false;
};
const position = ref({ x: 100, y: 100 });
const dragging = ref(false);

const startDrag = (event) => {
  dragging.value = true;

  if (event.type === "touchstart") {
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("touchend", stopDrag);
  } else {
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
  }
};

const drag = (event) => {
  if (!dragging.value) return;

  let clientX, clientY;

  if (event.type === "touchmove") {
    event.preventDefault(); // Prevents unwanted scrolling
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  position.value.x = clientX - 150; // Adjust for center
  position.value.y = clientY - 100;
};

const stopDrag = (event) => {
  dragging.value = false;

  if (event.type === "touchend") {
    document.removeEventListener("touchmove", drag);
    document.removeEventListener("touchend", stopDrag);
  } else {
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);
  }
};
// Lifecycle hooks
onMounted(() => {
  console.log("Logged in user ID:", userId);
  initializePeer();
  const unsubscribe = setupFirestoreListener();

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup();
    if (peer.value) {
      peer.value.destroy();
    }
    unsubscribe();
  });
});
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <div
      v-if="videoCallOpen"
      :class="
        expand
          ? 'video-call w-[100vw] h-[100vh] bg-gray-950 py-2 flex flex-col fixed justify-center items-center'
          : 'video-call w-[300px] h-auto px-10 bg-gray-950 py-5 flex flex-col absolute justify-center items-center '
      "
      :style="
        expand
          ? 'top: 50%; left: 50%; transform: translate(-50%, -50%)'
          : `left: ${position.x}px; top: ${position.y}px`
      "
      @mousedown="startDrag"
      @touchstart="startDrag"
      @mouseup="stopDrag"
      @touchend="stopDrag"
    >
      <div
        @click="expand = !expand"
        :class="
          expand
            ? 'absolute top-10 left-6 z-40 cursor-pointer '
            : 'absolute top-2 left-2 z-40 cursor-pointer'
        "
      >
        <ArrowCollapseIcon v-if="expand" fillColor="#ffffff" :size="30" />
        <ArrowExpandIcon v-if="!expand" fillColor="#ffffff" :size="25" />
      </div>

      <video
        :class="
          expand
            ? 'transition-all w-[70vw] h-[30vh] mb-[10px] border border-white'
            : 'transition-all w-[300px] h-[15vh] mb-[10px] border border-white'
        "
        ref="localVideo"
        autoplay
        playsinline
      ></video>
      <video
        :class="
          expand
            ? 'transition-all w-[70vw] h-[30vh] mb-[10px] border border-white'
            : 'transition-all w-[300px] h-[15vh] mb-[10px] border border-white'
        "
        ref="remoteVideo"
        autoplay
        playsinline
      ></video>

      <div :class="expand ? 'flex  gap-2 py-4' : 'flex flex-col gap-2'">
        <button
          @click="startCall"
          class="bg-blue-900 py-1 px-2 rounded-md text-white"
        >
          Start Call
        </button>
        <button
          @click="endCall"
          class="bg-red-700 py-1 px-2 rounded-md text-white"
        >
          End Call
        </button>
      </div>
    </div>
    <!-- Incoming Call Notification -->
    <div
      v-if="incomingCall"
      class="incoming-call z-[50] w-auto px-4 py-3 bg-gray-900 text-white rounded-lg shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
    >
      <p>Incoming call from {{ incomingCallerId }}</p>
      <button
        @click="acceptCall"
        class="bg-green-500 py-1 px-2 rounded-md text-white"
      >
        Accept
      </button>
      <button
        @click="rejectCall"
        class="bg-red-500 py-1 px-2 rounded-md text-white"
      >
        Reject
      </button>
    </div>
  </div>
</template>

<style scoped>
.video-call {
  cursor: grab;
  user-select: none;
}

.incoming-call {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
}
</style>
