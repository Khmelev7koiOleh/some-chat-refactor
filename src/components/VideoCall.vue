<template>
  <div class="video-call bg-gray-950 p-4">
    <video ref="localVideo" autoplay playsinline></video>
    <video ref="remoteVideo" autoplay playsinline></video>
    <div class="flex flex-col gap-2">
      <button
        @click="combinedFunc(userDataForChat[0].id)"
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
import { toRefs, ref, computed, watch, onMounted, onBeforeMount } from "vue";
import { storeToRefs } from "pinia";
import Peer from "peerjs";
import { useAuthStore } from "../store/auth-store";
import { useVideoCallOpen } from "../store/video-call-store";

const videoCall = useVideoCallOpen();
const { videoCallOpen } = storeToRefs(videoCall);
const authStore = useAuthStore();
const {
  userDataForChat,
  user,
  currentChatId,
  currentChat,
  showFindFriends,
  peerUsers,
  chats,
} = storeToRefs(authStore);

const props = defineProps({
  callTo: { type: String },
});
const { callTo } = toRefs(props);
const localVideo = ref(null);
const remoteVideo = ref(null);
const peer = ref(null);
const call = ref(null);
const peerId = ref(null);
const peerRef = ref("");
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

        call.value = incomingCall;
      });
  });
});

const callToUser = (id) => {
  // Find the user in the list whose id matches currentChat.participants[0].id
  const targetUser = peerUsers.value.find(
    (user) => id === currentChat.value.participants[0]
  );

  // If targetUser is found, initiate the call
  if (targetUser) {
    // authStore.callUser(targetUser.peerId); // Assuming callUser is in your store and accepts peerId

    peerRef.value = targetUser.peerId;
    console.log(peerRef.value);
  } else {
    console.error("No matching user found to call");
  }
};
const startCall = () => {
  //   const friendId = peerRef.value;
  const friendId = prompt("Enter your friend's Peer ID:");
  console.log(peerRef.value);
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localVideo.value.srcObject = stream;

      const outgoingCall = peer.value.call(friendId, stream); // Initiate a call

      outgoingCall.on("stream", (remoteStream) => {
        remoteVideo.value.srcObject = remoteStream;
      });

      call.value = outgoingCall;
    });
};

const endCall = () => {
  call.value?.close();
  localVideo.value.srcObject = null;
  remoteVideo.value.srcObject = null;
};

const combinedFunc = (id) => {
  callToUser(id);
  startCall();
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
</style>
