<script setup>
import { ref, onMounted, watch, toRefs } from "vue";
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
const props = defineProps({ callTo: { type: String } });
const { callTo } = toRefs(props);
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

onMounted(() => {
  console.log("Logged in user ID:", userId);

  // Initialize PeerJS
  peer.value = new Peer();

  peer.value.on("open", (id) => {
    console.log("✅ My Peer ID:", id);
    peerId.value = id;
  });

  // Handle incoming calls
  peer.value.on("call", (receivedCall) => {
    console.log("🚀 Incoming PeerJS call received!", receivedCall);
    incomingCall.value = true;
    incomingCallerId.value = "Unknown User"; // Replace with real user data if available
    incomingPeerId.value = receivedCall.peer;
    incomingCallObj.value = receivedCall; // Store the incoming call object
  });

  // Listen for Firestore call requests (for receiving calls)
  const q = query(
    collection(db, "messages"),
    where("receiver", "==", userId),
    where("type", "==", "call-request")
  );

  onSnapshot(q, (snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log("📞 Firestore Call Request:", data);
      incomingCall.value = true;
      incomingCallerId.value = data.sender;
      incomingPeerId.value = data.peerId;
    });
  });
});

// Start Call (Caller)
const startCall = async () => {
  if (!peer.value || !peerId.value) {
    console.error("❌ Peer not initialized.");
    return;
  }

  console.log("📞 Sending call request to:", callTo.value);

  // Send call request to Firestore
  await addDoc(collection(db, "messages"), {
    sender: userId,
    receiver: callTo.value,
    type: "call-request",
    peerId: peerId.value,
    timestamp: new Date(),
  });

  console.log("✅ Call request sent!");
};

// Accept Call (Receiver)
const acceptCall = async () => {
  if (!incomingCallObj.value) {
    console.error("❌ No incoming call object found.");
    return;
  }

  console.log("📞 Answering call from:", incomingPeerId.value);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (localVideo.value) {
      localVideo.value.srcObject = stream;
    }

    incomingCallObj.value.answer(stream);
    console.log("✅ Answered call, waiting for remote stream...");

    // Listen for remote stream
    incomingCallObj.value.on("stream", (remoteStream) => {
      console.log("✅ Received remote stream from caller.");
      if (remoteVideo.value) {
        remoteVideo.value.srcObject = remoteStream;
      }
    });

    incomingCall.value = false; // Hide incoming call UI
    incomingCallObj.value = null;
  } catch (error) {
    console.error("🎥 Error accessing media devices:", error);
  }
};

// Reject call
const rejectCall = () => {
  console.log("❌ Call rejected.");
  incomingCall.value = false;
  incomingCallObj.value = null;
};

// End call
const endCall = () => {
  if (call.value) {
    console.log("📴 Ending call...");
    call.value.close();
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
