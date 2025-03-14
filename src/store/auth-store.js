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

import { useMessageViewStore } from "../store/messageView-store";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account", // Forces account selection screen
});

export const useAuthStore = defineStore(
  "auth",
  () => {
    const user = ref({
      localId: null,
      email: null,
      displayName: null,
      photoUrl: null,
      emailVerified: null,
      lastLoginAt: null,
      lastRefreshAt: null,
    });
    const logoutPopUpOpen = ref(false);
    const allUsers = ref([]);
    const userDataForChat = ref([]);
    const chats = ref([]);
    const showFindFriends = ref(false);
    const currentChat = ref([]);
    const currentChatId = ref(null);
    const commonChat = ref([]);
    const messageViewStore = useMessageViewStore();
    const { messageViewOpen } = storeToRefs(messageViewStore);
    const router = useRouter();

    const setUser = (userInfo) => {
      user.value = {
        localId: userInfo.uid,
        email: userInfo.email,
        displayName: userInfo.displayName,
        photoUrl: userInfo.photoURL,
        emailVerified: userInfo.emailVerified,
        lastLoginAt: userInfo.metadata.lastSignInTime,
        lastRefreshAt: userInfo.metadata.creationTime,
      };
    };

    // ✅ Login function with user existence check
    const login = async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        if (!result.user) throw new Error("User not found");

        console.log("User logged in:", result.user);

        // Firestore user check
        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: result.user.uid,
            displayName: result.user.displayName,
            email: result.user.email,
            photoURL: result.user.photoURL,
            providerId: result.user.providerData[0].providerId,
            createdAt: new Date(),
          });

          console.log("New user added to Firestore.");
        } else {
          console.log("User already exists in Firestore:", userSnap.data());
        }

        setUser(result.user);
        router.push("/");
      } catch (error) {
        console.error("Login failed:", error);
        router.push("/login");
      }
    };

    // ✅ Logout function

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
      try {
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

        chats.value = chatArray; // Update `chats` ref

        // ✅ Check if the number of chats is more than 5
        messageViewOpen.value = chatArray.length > 0;

        console.log(`Chats count: ${chatArray.length}`, chats.value);
      });
    };

    const getCommonChatsByUser = () => {
      // Query to fetch all the messages without ordering by 'createdAt' in Firestore
      const q = query(collection(db, "chat"));

      onSnapshot(
        q,
        (querySnapshot) => {
          const chatArray = []; // Temporary array to hold chat data

          querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Handle 'createdAt' and ensure it is a Date object
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
    const logout = async () => {
      try {
        await signOut(auth);
        user.value = {
          localId: null,
          email: null,
          displayName: null,
          photoUrl: null,
          emailVerified: null,
          lastLoginAt: null,
          lastRefreshAt: null,
        };
        logoutPopUpOpen.value = false;
        router.push("/login");
        console.log("User logged out successfully.");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };
    // const getChatById = (id) => {
    //     onSnapshot(doc(db, `chat/${id}`), (doc) => {
    //       currentChatId.value = doc.data(); // Directly store the document data
    //     });
    //   };

    //   const reset = () => {
    //     localId.value = "";
    //     email.value = "";
    //     displayName.value = "";
    //     photoUrl.value = "";
    //     allUsers.value = [];
    //     userDataForChat.value = [];
    //     showFindFriends.value = false;
    //   };

    //   watchEffect(() => {
    //     if (user.value.localId) {
    //       const userRef = doc(db, "users", user.value.localId);
    //       const unsubscribe = onSnapshot(userRef, (doc) => {
    //         if (doc.exists()) {
    //           setUser(doc.data());
    //         } else {
    //           console.log("User not found in Firestore.");
    //         }
    //       });
    //       return unsubscribe;
    //     }
    //   });
    return {
      user,
      login,
      logout,
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
      getAllChatsByUser,
      getChatById,
      sendToCommonChat,
      chats,
    };
  },
  { persist: true }
);
