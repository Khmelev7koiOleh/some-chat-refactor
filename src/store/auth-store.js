import { defineStore } from "pinia";
import { onMounted, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { nextTick } from "vue";
import moment from "moment";
import { auth, db } from "../firebase-init";
import { v4 as uuid } from "uuid";
import { signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  updateDoc,
  arrayUnion,
  onSnapshot,
  query,
} from "firebase/firestore";

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

    const allUsers = ref([]);
    const userDataForChat = ref([]);
    const chats = ref([]);
    const showFindFriends = ref(false);
    const currentChat = ref(null);
    const currentChatId = ref(null);

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
        if (data.chatId) {
          await updateDoc(doc(db, `chat/${data.chatId}`), {
            messages: arrayUnion({
              id: localId.value, // Unique ID for each message
              senderId: user.value?.localId, // Identify the sender
              messages: data.message, // Store the message content
              createdAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
            }),
          });
        } else {
          let id = uuid();
          // let subid = uid();
          await setDoc(doc(db, `chat/${id}`), {
            mesagges: [
              {
                id: uuid(),
                senderId: user.value?.localId,
                messages: data.message,
                createdAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
              },
            ],
          });

          userDataForChat[0].id = id;
          showFindFriends.value = false;
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getChatById = (id) => {
      console.log(id);
      onSnapshot(doc(db, `chat/${id}`), (doc) => {
        let res = [];
        res.push(doc.data());
        console.log(res);
        currentChat.value = res;
        console.log(id);
      });
    };

    // const getChatById = (chatId) => {
    //   console.log("Fetching chat for ID:", chatId);

    //   const chatRef = collection(db, "chats", chatId, "messages");

    //   const q = query(chatRef, orderBy("createdAt", "asc"));

    //   onSnapshot(q, (snapshot) => {
    //     let messages = [];
    //     snapshot.forEach((doc) => {
    //       messages.push(doc.data());
    //     });
    //     currentChat.value = messages;
    //     console.log("Chat messages:", messages);
    //   });
    // };

    const getAllChatsByUser = () => {
      const q = query(collection(db, "chat"));

      onSnapshot(q, (querySnapshot) => {
        const chatArray = []; // Temporary array to hold chats

        querySnapshot.forEach((doc) => {
          chatArray.push(doc.data());
        });

        chats.value = chatArray; // Update `chats` ref
        console.log(chats.value); // Now logs an array
      });
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
      sendMessage,
      currentChatId,
      currentChat,
      getAllChatsByUser,
      getChatById,
      chats,
    };
  },
  { persist: true }
);
