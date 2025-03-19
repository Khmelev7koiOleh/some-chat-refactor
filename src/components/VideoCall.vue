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
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// PROPS
const props = defineProps({
  callTo: { type: String, required: true }, // Ensure callTo is required
});
const { callTo } = toRefs(props);

// Firebase setup
const db = getFirestore();
const auth = getAuth();
const userId = auth.currentUser?.uid || "unknown_user"; // Get logged-in user ID

// Refs
const localVideo = ref(null);
const remoteVideo = ref(null);
const peer = ref(null);
const call = ref(null);
const peerId = ref(null);
const incomingCall = ref(false);
const incomingCallerId = ref(null);
const incomingPeerId = ref(null);
const incomingCallObj = ref(null); // Store the incoming call object

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
  incomingCallObj.value = null;
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
    incomingCall.value = true;
    incomingCallerId.value = "Unknown User"; // Replace with real user data if available
    incomingPeerId.value = incomingCall.peer;
    incomingCallObj.value = incomingCall; // Store the incoming call object
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
    collection(db, "messages"),
    where("receiver", "==", userId),
    where("type", "==", "call-request")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log("📞 New call request received:", data);

      incomingCall.value = true;
      incomingCallerId.value = data.sender;
      incomingPeerId.value = data.peerId;

      // If `peer.on("call")` didn't trigger, manually store the call details
      if (!call.value) {
        console.log(
          "🔄 Manually handling call for peer:",
          incomingPeerId.value
        );
        incomingCallObj.value = {
          peer: incomingPeerId.value,
          answer: (stream) => {
            const manualCall = peer.value.call(incomingPeerId.value, stream);
            manualCall.on("stream", (remoteStream) => {
              console.log("✅ Received remote stream from manual call");
              if (remoteVideo.value) {
                remoteVideo.value.srcObject = remoteStream;
              }
            });
            call.value = manualCall;
          },
        };
      }
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
    await addDoc(collection(db, "messages"), {
      sender: userId,
      receiver: callTo.value,
      type: "call-request",
      peerId: peerId.value,
      timestamp: new Date(),
    });
    console.log("Call request sent!");
  } catch (err) {
    console.error("Error sending call request:", err);
  }
};

// Accept Call (Receiver)
const acceptCall = async () => {
  if (!incomingCallObj.value) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (localVideo.value) {
      localVideo.value.srcObject = stream;
    }

    // Answer the incoming call with our media stream
    incomingCallObj.value.answer(stream);

    // Listen for the remote stream
    incomingCallObj.value.on("stream", (remoteStream) => {
      console.log("✅ Received remote stream from caller");
      if (remoteVideo.value) {
        remoteVideo.value.srcObject = remoteStream;
      }
    });

    incomingCall.value = false;
    incomingCallObj.value = null; // Reset the incoming call object
  } catch (err) {
    console.error("🎥 Error accessing media devices", err);
  }
};

// Reject call
const rejectCall = () => {
  incomingCall.value = false;
  incomingCallObj.value = null; // Reset the incoming call object
};

// End call
const endCall = () => {
  cleanup();
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
    <div class="text-white z-[50] bg-black">My peerId: {{ peerId }}</div>
    <div class="text-white z-[50] bg-black">callTo: {{ userId }}</div>

    <div class="video-call bg-gray-950 p-4 z-[50]">
      <video ref="localVideo" autoplay playsinline></video>
      <video ref="remoteVideo" autoplay playsinline></video>

      <div class="flex flex-col gap-2">
        <button
          @click="startCall"
          class="bg-black py-1 px-2 rounded-md text-white"
        >
          Start Call
        </button>
        <button
          @click="endCall"
          class="bg-black py-1 px-2 rounded-md text-white"
        >
          End Call
        </button>
      </div>

      <!-- Incoming Call Notification -->
      <div v-if="incomingCall" class="incoming-call z-[50]">
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
  </div>
</template>

<style scoped>
.video-call {
  display: flex;
  flex-direction: column;
  align-items: center;
}
video {
  width: 300px;
  height: 200px;
  margin-bottom: 10px;
  border: 1px solid #ffff;
}
.incoming-call {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  position: absolute;
  top: 20px;
  right: 20px;
  border-radius: 5px;
}
</style>
