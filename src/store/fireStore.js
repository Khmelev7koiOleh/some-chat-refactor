import { defineStore } from "pinia";
import { onMounted, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { nextTick } from "vue";
import moment from "moment";
import { storeToRefs } from "pinia";
import { auth, db } from "../firebase-init";
import { v4 as uuid } from "uuid";
import { signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  collection,
  where,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  onSnapshot,
  query,
  Timestamp,
} from "firebase/firestore";
import { Peer } from "peerjs"; // Install PeerJS: npm install peerjs
import { useMessageViewStore } from "./messageView-store";

import { useAuthStoreC } from "./use-auth";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account", // Forces account selection screen
});

export const useFirestore = defineStore(
  "firestore",
  () => {
    const authStoreC = useAuthStoreC();
    const { user, logoutPopUpOpen, login } = storeToRefs(authStoreC);

    const allUsers = ref([]);
    const userDataForChat = ref([]);
    const peerId = ref("");
    const chats = ref([]);
    const peerUsers = ref([]);
    const showFindFriends = ref(false);

    const currentChat = ref([]);
    const currentChatId = ref(null);
    const commonChat = ref([]);
    const messageViewStore = useMessageViewStore();
    const { messageViewOpen } = storeToRefs(messageViewStore);
    const router = useRouter();

    onMounted(() => {
      console.log(userDataForChat);
    });
    // ✅ Fetch all users from Firestore
    const getAllUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        allUsers.value = querySnapshot.docs.map((doc) => doc.data());

        if (allUsers.value.length > 0) {
          console.log("Users fetched successfully:", allUsers.value);
        } else {
          console.log("No users found in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    watchEffect(() => {
      console.log("WatchEffect localId:", user.value?.localId);
    });
    const sendMessage = async (data) => {
      console.log(data.chatId);
      try {
        // there is something with chatId
        const chatRef = doc(db, "chats", data.chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists()) {
          // If chat exists, update it with the new message
          await updateDoc(chatRef, {
            messages: arrayUnion({
              id: uuid(),
              senderId: user.value?.localId,
              message: data.message,
              createdAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
            }),
          });
          console.log(user.value?.localId);
        } else {
          // If chat doesn't exist, create it with participants and the first message
          const newChatId = currentChatId.value;
          const newChatRef = doc(db, "chats", newChatId);

          await setDoc(newChatRef, {
            participants: [user.value?.localId, data.recipientId], // Include participants
            messages: [
              {
                id: uuid(),
                senderId: user.value?.localId,
                message: data.message,
                createdAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
              },
            ],
          });

          // Update UI with the new chat ID
          userDataForChat[0].id = newChatId;
          showFindFriends.value = false;
          console.log(userDataForChat[0].id);

          // Set up a real-time listener for the new chat
          const unsubscribe = onSnapshot(newChatRef, (doc) => {
            if (doc.exists()) {
              currentChat.value = doc.data(); // Update reactively
            }
          });

          // Store the unsubscribe function for cleanup (if needed)
          // unsubscribeChatListener = unsubscribe;
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    };
    const sendToCommonChat = async (userId) => {
      if (!message.value.trim()) return;

      try {
        await addDoc(collection(db, "chat"), {
          text: message.value,
          userId: userId, // Sender's ID
        });

        message.value = ""; // Clear input after sending
      } catch (error) {
        console.error("Error sending message:", error);
      }
    };

    const getChatById = async (userId1, userId2) => {
      console.log(userId1, userId2);
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", userId1)
      );

      const querySnapshot = await getDocs(q);

      let chatId = null;
      querySnapshot.forEach((doc) => {
        const participants = doc.data().participants;
        if (participants.includes(userId2)) {
          chatId = doc.id;
        }
      });

      if (!chatId) {
        chatId = `${userId1}-${userId2}`;
        await setDoc(doc(db, "chats", chatId), {
          participants: [userId1, userId2],
          messages: [],
        });
      }

      // Set up real-time listener for the chat
      const chatRef = doc(db, "chats", chatId);
      const unsubscribe = onSnapshot(chatRef, (doc) => {
        if (doc.exists()) {
          currentChat.value = doc.data(); // Update reactively
        }
      });

      currentChatId.value = chatId;
      return chatId;
    };
    const getAllChatsByUser = () => {
      const q = query(collection(db, "chats"));

      onSnapshot(q, (querySnapshot) => {
        const chatArray = []; // Temporary array to hold chats

        querySnapshot.forEach((doc) => {
          chatArray.push(doc.data());
        });

        chats.value = chatArray;

        // ✅ Check if the number of chats is more than 5
        messageViewOpen.value = chatArray.length > 0;

        console.log(`Chats count: ${chatArray.length}`, chats.value);
      });
    };

    const getCommonChatsByUser = () => {
      // Query to fetch all the messages
      const q = query(collection(db, "chat"));

      onSnapshot(
        q,
        (querySnapshot) => {
          const chatArray = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();

            const createdAt =
              data.createdAt instanceof Date
                ? data.createdAt // If it's already a Date, keep it
                : data.createdAt && data.createdAt.toDate
                ? data.createdAt.toDate()
                : new Date(); // Convert Timestamp or use current date

            chatArray.push({
              id: doc.id, // Include document ID
              ...data, // Spread the data from Firestore
              createdAt: createdAt, // Use the processed 'createdAt'
            });
          });

          // Sort the messages by 'createdAt' manually
          chatArray.sort((a, b) => a.createdAt - b.createdAt);

          commonChat.value = chatArray; // Update reactive reference with sorted chat
          console.log(commonChat.value); // Logs the updated sorted array
        },
        (error) => {
          console.error("Error fetching chats:", error); // Error handling
        }
      );
    };

    const fetchPeerIDs = () => {
      onSnapshot(collection(db, "users"), (snapshot) => {
        peerUsers.value = snapshot.docs.map((doc) => ({
          id: doc.peerId,
          ...doc.data(),
        }));
        console.log("Available Users:", peerUsers.value);
      });
    };

    return {
      user,
      // login,

      // logout,
      getAllUsers,
      allUsers,
      userDataForChat,
      showFindFriends,

      logoutPopUpOpen,
      sendMessage,
      currentChatId,
      currentChat,
      getCommonChatsByUser,
      commonChat,

      peerUsers,
      getAllChatsByUser,
      getChatById,
      sendToCommonChat,
      chats,
    };
  },
  { persist: true }
);
