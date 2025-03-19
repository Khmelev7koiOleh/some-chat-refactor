<script setup>
import { ref, onMounted, onBeforeUnmount, toRefs } from "vue";
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

const props = defineProps({ callTo: { type: String } });
const { callTo } = toRefs(props);

const db = getFirestore();
const auth = getAuth();
const userId = auth.currentUser?.uid || "unknown_user";

const localVideo = ref(null);
const remoteVideo = ref(null);
const peer = ref(null);
const peerId = ref(null);
const incomingCall = ref(false);
const incomingPeerId = ref(null);
const incomingCallObj = ref(null);

onMounted(() => {
  initPeer();
  listenForCalls();
});

onBeforeUnmount(() => {
  if (peer.value) {
    peer.value.destroy();
  }
});

const initPeer = () => {
  peer.value = new Peer();

  peer.value.on("open", (id) => {
    peerId.value = id;
    console.log("✅ My Peer ID:", id);
  });

  peer.value.on("call", (call) => {
    console.log("🚀 Incoming PeerJS call received!");
    incomingCall.value = true;
    incomingPeerId.value = call.peer;
    incomingCallObj.value = call;
  });
};

const listenForCalls = () => {
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
      incomingPeerId.value = data.peerId;
    });
  });
};

const startCall = async () => {
  if (!peer.value || !peerId.value) {
    console.error("Peer not initialized");
    return;
  }

  await addDoc(collection(db, "messages"), {
    sender: userId,
    receiver: callTo.value,
    type: "call-request",
    peerId: peerId.value,
    timestamp: new Date(),
  });

  console.log("📞 Call request sent to:", callTo.value);
};

const acceptCall = () => {
  if (!incomingCallObj.value) {
    console.error("❌ No incoming call object found.");
    return;
  }

  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localVideo.value.srcObject = stream;
      incomingCallObj.value.answer(stream);
      incomingCallObj.value.on("stream", (remoteStream) => {
        remoteVideo.value.srcObject = remoteStream;
      });
      incomingCall.value = false;
      incomingCallObj.value = null;
    })
    .catch((err) => console.error("🎥 Media access error", err));
};

const rejectCall = () => {
  incomingCall.value = false;
  incomingCallObj.value = null;
};

const endCall = () => {
  if (localVideo.value) localVideo.value.srcObject = null;
  if (remoteVideo.value) remoteVideo.value.srcObject = null;
};
</script>

<template>
  <div class="video-container">
    <div class="peer-info">My Peer ID: {{ peerId }}</div>
    <video ref="localVideo" autoplay playsinline></video>
    <video ref="remoteVideo" autoplay playsinline></video>
    <button @click="startCall">Start Call</button>
    <button @click="endCall">End Call</button>

    <div v-if="incomingCall" class="incoming-call">
      <p>Incoming call from {{ incomingPeerId }}</p>
      <button @click="acceptCall">Accept</button>
      <button @click="rejectCall">Reject</button>
    </div>
  </div>
</template>

<style scoped>
.video-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
video {
  width: 300px;
  height: 200px;
  margin-bottom: 10px;
  border: 1px solid white;
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
