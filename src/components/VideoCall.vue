<template>
  <div class="flex flex-col items-center justify-center">
    <div class="text-white z-[50] bg-black">My peerId: {{ peerId }}</div>

    <!-- Video Call Component -->
    <div class="video-call bg-gray-950 p-4 z-[50]">
      <video ref="localVideo" autoplay playsinline></video>
      <video ref="remoteVideo" autoplay playsinline></video>

      <div class="flex flex-col gap-2">
        <!-- Start Call Button -->
        <button
          @click="startCall"
          class="bg-black py-1 px-2 rounded-md text-white"
        >
          Start Call
        </button>

        <!-- End Call Button -->
        <button
          @click="endCall"
          class="bg-black py-1 px-2 rounded-md text-white"
        >
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
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

// Firebase Setup
const db = getFirestore();
const auth = getAuth();
const userId = auth.currentUser?.uid; // Get logged-in user ID

// PeerJS setup
const localVideo = ref(null);
const remoteVideo = ref(null);
const peer = ref(null);
const call = ref(null);
const peerId = ref(null);
const incomingCall = ref(false);
const incomingCallerId = ref(null);
const incomingPeerId = ref(null);

// Initialize PeerJS
onMounted(() => {
  peer.value = new Peer(); // Initialize PeerJS with a random peerId

  peer.value.on("open", (id) => {
    console.log("Peer ID:", id);
    peerId.value = id; // Store the peerId of the logged-in user
  });

  // Handle incoming call logic
  peer.value.on("call", (incomingCallObj) => {
    incomingCall.value = true;
    incomingCallerId.value = "Unknown User"; // Fetch sender's details (expand if needed)
    incomingPeerId.value = incomingCallObj.peer; // Store peerId to answer the call
  });

  // Listen for call requests in Firestore
  listenForIncomingCalls();
});

// Firestore listener to capture incoming call requests
const listenForIncomingCalls = () => {
  if (!userId || !peerId.value) return;

  const q = query(
    collection(db, "messages"),
    where("receiver", "==", peerId.value), // Receiver is the peerId
    where("type", "==", "call-request") // Call request type
  );

  onSnapshot(q, (snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      incomingCall.value = true;
      incomingCallerId.value = data.sender; // The userId of the caller
      incomingPeerId.value = data.peerId; // The peerId of the caller
    });
  });
};

// Start a Call by sending a call request
const startCall = async () => {
  if (!peer.value || !peerId.value) {
    console.error("Peer not initialized.");
    return;
  }

  const receiverPeerId = prompt("Enter recipient's Peer ID"); // In a real app, you will fetch this dynamically.

  if (!receiverPeerId) {
    console.error("Receiver Peer ID is required.");
    return;
  }

  // Send a call request to Firestore
  await addDoc(collection(db, "messages"), {
    sender: userId, // The caller's userId
    receiver: receiverPeerId, // The receiver's dynamic peerId
    type: "call-request", // Call request type
    peerId: peerId.value, // The caller's peerId
    timestamp: new Date(),
  });

  console.log("Call request sent to:", receiverPeerId);
};

// Accept incoming call
const acceptCall = () => {
  if (!peer.value || !incomingPeerId.value) return;

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localVideo.value.srcObject = stream;
      const answeredCall = peer.value.call(incomingPeerId.value, stream);

      answeredCall.on("stream", (remoteStream) => {
        remoteVideo.value.srcObject = remoteStream;
      });

      call.value = answeredCall;
      incomingCall.value = false; // Hide call UI after accepting
    });
};

// Reject incoming call
const rejectCall = () => {
  incomingCall.value = false;
};

// End the ongoing call
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
  border: 1px solid #fff;
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
