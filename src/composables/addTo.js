import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStoreC } from "../store/use-auth.js";
import { auth, db } from "../firebase-init";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  collection,
  serverTimestamp,
  where,
  updateDoc,
  arrayUnion,
  onSnapshot,
  query,
  Timestamp,
} from "firebase/firestore";

export function addToFirestore() {
  const authStoreC = useAuthStoreC();
  const { user } = storeToRefs(authStoreC);
  const loading = ref(false);
  const error = ref(null);
  let message = ref("");
  console.log;
  const addToCollection = async (collectionName, data) => {
    if (!data.value.trim()) return;

    try {
      await addDoc(collection(db, collectionName), {
        text: data.value,
        createdAt: Timestamp.now(), // Store as Firestore Timestamp
        sender: user.value.displayName,
        senderId: user.value.localId,
        img: user.value.photoUrl,
      });
      message.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  return { message, error, loading, addToCollection };
}
