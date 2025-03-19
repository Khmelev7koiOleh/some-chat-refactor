<template>
  <div class="video-call bg-gray-950 p-4">
    <p class="text-white">Your Peer ID: {{ peerId }}</p>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Peer from "peerjs";

const localVideo = ref(null);
const remoteVideo = ref(null);
const peer = ref(null);
const call = ref(null);
const peerId = ref(null);

onMounted(() => {
  peer.value = new Peer(); // Create PeerJS instance

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

        incomingCall.on("error", (error) =>
          console.error("Call error:", error)
        );

        call.value = incomingCall;
      })
      .catch((error) => console.error("Error accessing media devices:", error));
  });

  peer.value.on("error", (err) => {
    console.error("Peer error:", err);
  });
});

const startCall = () => {
  const friendId = prompt("Enter your friend's Peer ID:");

  if (!friendId) {
    alert("Peer ID is required to make a call!");
    return;
  }

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localVideo.value.srcObject = stream;

      console.log("Calling:", friendId);
      const outgoingCall = peer.value.call(friendId, stream); // Initiate a call

      if (!outgoingCall) {
        console.error("Call could not be placed.");
        return;
      }

      outgoingCall.on("stream", (remoteStream) => {
        remoteVideo.value.srcObject = remoteStream;
      });

      outgoingCall.on("error", (error) => console.error("Call error:", error));

      call.value = outgoingCall;
    })
    .catch((error) => console.error("Error accessing media devices:", error));
};

const endCall = () => {
  if (call.value) {
    call.value.close();
    console.log("Call ended");
  }
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
