<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import { toRefs } from "vue";
import Peer from "peerjs";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// PROPS
const props = defineProps({
  callTo: { type: String },
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
const incomingCallObj = ref(null);
const unsubscribe = ref(null); // Firestore listener cleanup

// Media stream ref
const localStream = ref(null);

onMounted(() => {
  console.log("🔹 Logged in user ID:", userId);
  initializePeer();

  // Firestore listener for incoming call requests
  setupFirestoreListener();
});

onBeforeUnmount(() => {
  cleanupCall();
  if (unsubscribe.value) {
    unsubscribe.value();
  }
  if (peer.value) {
    peer.value.destroy();
  }
});

// ✅ **Initialize PeerJS**
const initializePeer = () => {
  peer.value = new Peer();

  peer.value.on("open", (id) => {
    console.log("🎯 My Peer ID:", id);
    peerId.value = id;
  });

  peer.value.on("call", (incoming) => {
    console.log("🚀 Incoming PeerJS call received!", incoming);
    incomingCall.value = true;
    incomingPeerId.value = incoming.peer;
    incomingCallObj.value = incoming;
  });

  peer.value.on("error", (err) => {
    console.error("⚠️ PeerJS Error:", err);
  });

  peer.value.on("disconnected", () => {
    console.warn("🔄 PeerJS Disconnected. Reconnecting...");
    peer.value.reconnect();
  });

  peer.value.on("close", () => {
    console.warn("❌ PeerJS Closed");
  });
};

// ✅ **Firestore listener setup**
const setupFirestoreListener = () => {
  const q = query(
    collection(db, "messages"),
    where("receiver", "==", userId),
    where("type", "==", "call-request")
  );

  unsubscribe.value = onSnapshot(q, (snapshot) => {
    snapshot.forEach(async (doc) => {
      const data = doc.data();
      console.log("📞 Firestore Call Request:", data);

      incomingCall.value = true;
      incomingCallerId.value = data.sender;
      incomingPeerId.value = data.peerId;

      // Auto-clean Firestore call request after processing
      await deleteDoc(doc.ref);
    });
  });
};

// ✅ **Start Call**
const startCall = async () => {
  if (!peer.value || !peerId.value) {
    console.error("⚠️ Peer not initialized");
    return;
  }

  console.log("📤 Sending call request to:", callTo.value);

  await addDoc(collection(db, "messages"), {
    sender: userId,
    receiver: callTo.value,
    type: "call-request",
    peerId: peerId.value,
    timestamp: new Date(),
  });

  console.log("✅ Call request sent!");
};

// ✅ **Accept Call**
const acceptCall = async () => {
  if (!incomingCallObj.value && !incomingPeerId.value) {
    console.error("⚠️ No incoming call to accept");
    return;
  }

  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (localVideo.value) {
      localVideo.value.srcObject = localStream.value;
    }

    console.log("📞 Answering call from:", incomingPeerId.value);

    const answeredCall = peer.value.call(
      incomingPeerId.value,
      localStream.value
    );

    answeredCall.on("stream", (remoteStream) => {
      console.log("✅ Remote stream received");
      if (remoteVideo.value) {
        remoteVideo.value.srcObject = remoteStream;
      }
    });

    answeredCall.on("close", () => {
      console.log("❌ Call ended");
      cleanupCall();
    });

    call.value = answeredCall;
    incomingCall.value = false;
    incomingCallObj.value = null;
  } catch (error) {
    console.error("🎥 Error accessing media devices", error);
  }
};

// ✅ **Reject Call**
const rejectCall = () => {
  console.log("❌ Call Rejected");
  incomingCall.value = false;
  incomingCallObj.value = null;
};

// ✅ **End Call**
const endCall = () => {
  if (call.value) {
    call.value.close();
  }
  cleanupCall();
};

// ✅ **Cleanup Function**
const cleanupCall = () => {
  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => track.stop());
    localStream.value = null;
  }
  if (localVideo.value) {
    localVideo.value.srcObject = null;
  }
  if (remoteVideo.value) {
    remoteVideo.value.srcObject = null;
  }
  call.value = null;
  incomingCall.value = false;
};
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <div class="text-white bg-blue-800 p-2 rounded-md">
      My Peer ID: {{ peerId }}
    </div>
    <div class="text-white bg-black p-2 rounded-md">Call To: {{ callTo }}</div>

    <div class="video-container">
      <video ref="localVideo" autoplay playsinline></video>
      <video ref="remoteVideo" autoplay playsinline></video>
    </div>

    <div class="flex flex-col gap-2 mt-4">
      <button @click="startCall" class="btn bg-blue-500">Start Call</button>
      <button @click="endCall" class="btn bg-red-500">End Call</button>
    </div>

    <!-- Incoming Call Notification -->
    <div v-if="incomingCall" class="incoming-call">
      <p>📞 Incoming call from {{ incomingCallerId }}</p>
      <button @click="acceptCall" class="btn bg-green-500">Accept</button>
      <button @click="rejectCall" class="btn bg-gray-500">Reject</button>
    </div>
  </div>
</template>

<style scoped>
.video-container {
  display: flex;
  gap: 10px;
}
video {
  width: 300px;
  height: 200px;
  border-radius: 10px;
  border: 2px solid white;
}
.btn {
  padding: 8px 12px;
  color: white;
  font-weight: bold;
  border-radius: 6px;
}
.incoming-call {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px;
  border-radius: 6px;
  margin-top: 10px;
  text-align: center;
}
</style>
