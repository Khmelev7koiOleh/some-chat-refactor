<script setup>
import { ref, onMounted } from "vue";
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

onMounted(() => {
  console.log("Logged in user ID:", userId);

  // Initialize PeerJS
  peer.value = new Peer();

  peer.value.on("open", (id) => {
    console.log("My Peer ID:", id);
    peerId.value = id;
  });

  // Handle incoming calls
  peer.value.on("call", (incomingCallObj) => {
    console.log("Incoming call from peer:", incomingCallObj.peer);
    incomingCall.value = true;
    incomingCallerId.value = "Unknown User"; // Can be replaced with fetched data
    incomingPeerId.value = incomingCallObj.peer;

    // Store call object
    call.value = incomingCallObj;
  });

  // Listen for Firestore call requests (only needed for initiating a call)
  const q = query(
    collection(db, "messages"),
    where("receiver", "==", userId),
    where("type", "==", "call-request")
  );

  onSnapshot(q, (snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Received Firestore call request from:", data.sender);
      incomingCall.value = true;
      incomingCallerId.value = data.sender;
      incomingPeerId.value = data.peerId;
    });
  });
});

// Start Call (Caller)
const startCall = async () => {
  if (!peer.value || !peerId.value) {
    console.error("Peer not initialized");
    return;
  }

  console.log("Sending call request to:", callTo.value);

  // Send a Firestore message with the call request
  await addDoc(collection(db, "messages"), {
    sender: userId,
    receiver: callTo.value,
    type: "call-request",
    peerId: peerId.value,
    timestamp: new Date(),
  });

  console.log("Call request sent!");
};

// Accept Call (Receiver)
const acceptCall = () => {
  if (!incomingPeerId.value) return;

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localVideo.value.srcObject = stream;

      // Answer the incoming call with our media stream
      call.value.answer(stream);

      // Listen for the remote stream
      call.value.on("stream", (remoteStream) => {
        console.log("Received remote stream from caller");
        remoteVideo.value.srcObject = remoteStream;
      });

      // Hide call UI after answering
      incomingCall.value = false;
    })
    .catch((err) => {
      console.error("Error accessing media devices", err);
    });
};

// Reject call
const rejectCall = () => {
  incomingCall.value = false;
};

// End call
const endCall = () => {
  if (call.value) {
    call.value.close();
  }
  localVideo.value.srcObject = null;
  remoteVideo.value.srcObject = null;
};
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
