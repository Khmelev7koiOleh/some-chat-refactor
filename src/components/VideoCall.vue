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

// PROPS
const props = defineProps({
  callTo: { type: String, required: true },
});
const { callTo } = toRefs(props);

// Firebase setup
const db = getFirestore();
const auth = getAuth();
const userId = auth.currentUser?.uid || "unknown_user";

// Refs
const localVideo = ref(null);
const remoteVideo = ref(null);
const peer = ref(null);
const call = ref(null);
const peerId = ref(null);
const incomingCall = ref(false);
const incomingCallerId = ref(null);
const incomingCallerPeerId = ref(null);
const incomingCallDocId = ref(null);

// Cleanup function
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

// Initialize PeerJS with TURN server
const initializePeer = () => {
  peer.value = new Peer({
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, // Free STUN server
        {
          urls: "turn:your-turn-server.com",
          username: "your-username",
          credential: "your-credential",
        }, // TURN server
      ],
    },
  });

  peer.value.on("open", (id) => {
    console.log("My Peer ID:", id);
    peerId.value = id;
  });

  peer.value.on("call", (incomingCall) => {
    console.log("🚀 Incoming PeerJS call received!", incomingCall);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideo.value) {
          localVideo.value.srcObject = stream;
        }

        incomingCall.answer(stream);

        incomingCall.on("stream", (remoteStream) => {
          console.log("✅ Received remote stream from caller");
          if (remoteVideo.value) {
            remoteVideo.value.srcObject = remoteStream;
          }
        });
      })
      .catch((err) => {
        console.error("🎥 Error accessing media devices", err);
        alert("Please allow access to your camera and microphone.");
      });
  });

  peer.value.on("error", (err) => {
    console.error("PeerJS Error:", err);
    initializePeer(); // Reinitialize on error
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
      incomingCallerId.value = data.sender;
      incomingCallerPeerId.value = data.callerPeerId;
      incomingCallDocId.value = doc.id;
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

  try {
    await addDoc(collection(db, "calls"), {
      sender: userId,
      receiver: callTo.value,
      callerPeerId: peerId.value,
      status: "pending",
      timestamp: new Date(),
    });
    console.log("Call request sent!");
  } catch (err) {
    console.error("Error sending call request:", err);
  }
};

// Accept Call (Callee)
const acceptCall = async () => {
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

    call.value = peer.value.call(incomingCallerPeerId.value, stream);

    call.value.on("stream", (remoteStream) => {
      console.log("✅ Received remote stream from caller");
      if (remoteVideo.value) {
        remoteVideo.value.srcObject = remoteStream;
      }
    });

    if (incomingCallDocId.value) {
      await deleteDoc(doc(db, "calls", incomingCallDocId.value));
    }

    incomingCall.value = false;
    incomingCallerId.value = null;
    incomingCallerPeerId.value = null;
    incomingCallDocId.value = null;
  } catch (err) {
    console.error("🎥 Error accessing media devices", err);
    alert("Please allow access to your camera and microphone.");
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
};

// Lifecycle hooks
onMounted(() => {
  console.log("Logged in user ID:", userId);
  initializePeer();
  const unsubscribe = setupFirestoreListener();

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
    <div class="text-white z-[50] bg-black">callTo: {{ callTo }}</div>

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
