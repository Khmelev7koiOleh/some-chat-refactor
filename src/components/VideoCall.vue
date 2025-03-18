<template>
  <div class="video-call bg-gray-950 p-4">
    <div class="text-white">My peerId: {{ peerId }}</div>
    <video ref="localVideo" autoplay playsinline></video>
    <video ref="remoteVideo" autoplay playsinline></video>

    <div class="flex flex-col gap-2">
      <button
        @click="startCall"
        class="bg-black py-1 px-2 rounded-md text-white"
      >
        Start Call
      </button>
      <button @click="endCall" class="bg-black py-1 px-2 rounded-md text-white">
        End Call
      </button>
    </div>

    <!-- Incoming Call Notification -->
    <div v-if="incomingCall" class="incoming-call">
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

<script setup>
import { ref, onMounted, watch } from "vue";
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

// Firebase setup
const db = getFirestore();
const auth = getAuth();
const userId = auth.currentUser?.uid || "unknown_user"; // Get logged-in user ID

const localVideo = ref(null);
const remoteVideo = ref(null);
const peer = ref(null);
const call = ref(null);
const peerId = ref(null);
const incomingCall = ref(false);
const incomingCallerId = ref(null);
const incomingPeerId = ref(null);

onMounted(() => {
  // Initialize PeerJS
  peer.value = new Peer();

  peer.value.on("open", (id) => {
    console.log("My Peer ID:", id);
    peerId.value = id;
  });

  peer.value.on("call", (incomingCallObj) => {
    console.log("Incoming call...");
    incomingCall.value = true;
    incomingCallerId.value = "Unknown User"; // You can improve this by fetching sender's name
    incomingPeerId.value = incomingCallObj.peer; // Store peer ID for answering
  });

  // Listen for call requests in Firestore
  const q = query(
    collection(db, "messages"),
    where("receiver", "==", userId),
    where("type", "==", "call-request")
  );

  onSnapshot(q, (snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      incomingCall.value = true;
      incomingCallerId.value = data.sender;
      incomingPeerId.value = data.peerId;
    });
  });
});

// Send call request
const startCall = async () => {
  const receiverId = prompt("Enter recipient's user ID"); // Replace with your chat logic

  if (!peer.value || !peerId.value) {
    console.error("Peer not initialized");
    return;
  }

  // Send a Firestore message with the call request
  await addDoc(collection(db, "messages"), {
    sender: userId,
    receiver: receiverId,
    type: "call-request",
    peerId: peerId.value,
    timestamp: new Date(),
  });

  console.log("Call request sent!");
};

// Accept call
const acceptCall = () => {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localVideo.value.srcObject = stream;
      const answeredCall = peer.value.call(incomingPeerId.value, stream);

      answeredCall.on("stream", (remoteStream) => {
        remoteVideo.value.srcObject = remoteStream;
      });

      call.value = answeredCall;
      incomingCall.value = false; // Hide call UI after answering
    });
};

// Reject call
const rejectCall = () => {
  incomingCall.value = false;
};

// End call
const endCall = () => {
  call.value?.close();
  localVideo.value.srcObject = null;
  remoteVideo.value.srcObject = null;
};
</script>

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
