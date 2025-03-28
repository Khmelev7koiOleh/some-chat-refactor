// stores/video-call-store.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
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

export const useVideoCallStore = defineStore("videoCall", () => {
  // State
  const expand = ref(false);
  const peer = ref(null);
  const call = ref(null);
  const peerId = ref(null);
  const incomingCall = ref(false);
  const incomingCallerId = ref(null);
  const incomingCallerPeerId = ref(null);
  const incomingCallDocId = ref(null);
  const position = ref({ x: 100, y: 100 });
  const dragging = ref(false);

  // Firebase setup
  const db = getFirestore();
  const auth = getAuth();
  const userId = computed(() => auth.currentUser?.uid || "unknown_user");
  const userName = computed(() => auth.currentUser?.displayName);

  // Actions
  const cleanup = () => {
    if (call.value) {
      call.value.close();
      call.value = null;
    }
    incomingCall.value = false;
    incomingCallerId.value = null;
    incomingCallerPeerId.value = null;
    incomingCallDocId.value = null;
  };

  const isPeerInitialized = ref(false);

  // Methods
  const initializePeer = () => {
    try {
      peer.value = new Peer();

      peer.value.on("open", (id) => {
        peerId.value = id;
        isPeerInitialized.value = true;
        console.log("PeerJS initialized with ID:", id);
      });

      peer.value.on("error", (err) => {
        console.error("PeerJS error:", err);
        isPeerInitialized.value = false;
      });

      return true;
    } catch (error) {
      console.error("Peer initialization failed:", error);
      return false;
    }
  };

  const setupFirestoreListener = (callback) => {
    try {
      const q = query(
        collection(db, "calls"),
        where("receiver", "==", userId),
        where("status", "==", "pending")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          incomingCall.value = true;
          incomingCallerId.value = data.senderName;
          incomingCallerPeerId.value = data.callerPeerId;
          incomingCallDocId.value = doc.id;
          callback?.(data);
        });
      });

      return unsubscribe;
    } catch (error) {
      console.error("Firestore listener setup failed:", error);
      return () => {}; // Return empty function if setup fails
    }
  };
  const startCall = async (receiverId) => {
    if (!peer.value || !peerId.value) return;

    try {
      await addDoc(collection(db, "calls"), {
        sender: userId.value,
        senderName: userName.value,
        receiver: receiverId,
        callerPeerId: peerId.value,
        status: "pending",
        timestamp: new Date(),
      });
    } catch (err) {
      console.error("Error sending call request:", err);
      throw err;
    }
  };

  const acceptCall = async () => {
    if (!incomingCallerPeerId.value) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      call.value = peer.value.call(incomingCallerPeerId.value, stream);

      if (incomingCallDocId.value) {
        await deleteDoc(doc(db, "calls", incomingCallDocId.value));
      }

      cleanup();
      return stream;
    } catch (err) {
      console.error("Error accessing media devices", err);
      throw err;
    }
  };

  const rejectCall = async () => {
    if (incomingCallDocId.value) {
      await deleteDoc(doc(db, "calls", incomingCallDocId.value));
    }
    cleanup();
  };

  const endCall = () => {
    cleanup();
    expand.value = false;
  };

  // Dragging functionality
  const startDrag = (event) => {
    dragging.value = true;
    const moveEvent = event.type === "touchstart" ? "touchmove" : "mousemove";
    const endEvent = event.type === "touchstart" ? "touchend" : "mouseup";
    document.addEventListener(moveEvent, drag);
    document.addEventListener(endEvent, stopDrag);
  };

  const drag = (event) => {
    if (!dragging.value) return;

    const clientX =
      event.type === "touchmove" ? event.touches[0].clientX : event.clientX;
    const clientY =
      event.type === "touchmove" ? event.touches[0].clientY : event.clientY;

    position.value = {
      x: clientX - 150,
      y: clientY - 100,
    };
  };

  const stopDrag = (event) => {
    dragging.value = false;
    const moveEvent = event.type === "touchend" ? "touchmove" : "mousemove";
    const endEvent = event.type === "touchend" ? "touchend" : "mouseup";
    document.removeEventListener(moveEvent, drag);
    document.removeEventListener(endEvent, stopDrag);
  };

  return {
    // State
    expand,
    peerId,
    incomingCall,
    incomingCallerId,
    position,
    isPeerInitialized,
    // Actions
    initializePeer,
    setupFirestoreListener,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    cleanup,
    startDrag,
    drag,
    stopDrag,
  };
});
