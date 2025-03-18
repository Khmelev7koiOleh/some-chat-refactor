<template>
  <div class="video-call bg-gray-950 p-4">
    <p class="text-white">Your Peer ID: {{ peerId }}</p>

    <video ref="localVideo" autoplay playsinline></video>
    <video ref="remoteVideo" autoplay playsinline></video>

    <div class="flex flex-col gap-2">
      <button
        @click="startCall"
        class="bg-green-600 py-1 px-2 rounded-md text-white"
      >
        Call User
      </button>

      <button
        @click="endCall"
        class="bg-red-600 py-1 px-2 rounded-md text-white"
      >
        End Call
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getDatabase, ref as dbRef, get } from "firebase/database";
import Peer from "peerjs";

const localVideo = ref(null);
const remoteVideo = ref(null);
const peer = ref(null);
const call = ref(null);
const peerId = ref(null);

const db = getDatabase();
const userId = "user123"; // Current user ID (replace with real auth user)
const otherUserId = "user456"; // The person you're chatting with

onMounted(() => {
  peer.value = new Peer();

  peer.value.on("open", (id) => {
    console.log("My Peer ID:", id);
    peerId.value = id;
  });

  peer.value.on("call", (incomingCall) => {
    console.log("Incoming call...");
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideo.value.srcObject = stream;
        incomingCall.answer(stream); // Answer the call with local stream

        incomingCall.on("stream", (remoteStream) => {
          remoteVideo.value.srcObject = remoteStream;
        });

        call.value = incomingCall;
      });
  });
});

const startCall = async () => {
  // Fetch the other user's Peer ID from Firebase
  const snapshot = await get(dbRef(db, `users/${otherUserId}/peerId`));

  if (snapshot.exists()) {
    const friendPeerId = snapshot.val();
    console.log("Calling user with Peer ID:", friendPeerId);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideo.value.srcObject = stream;

        const outgoingCall = peer.value.call(friendPeerId, stream); // Call dynamically retrieved Peer ID

        outgoingCall.on("stream", (remoteStream) => {
          remoteVideo.value.srcObject = remoteStream;
        });

        call.value = outgoingCall;
      });
  } else {
    console.error("No Peer ID found for user");
  }
};

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
</style>
