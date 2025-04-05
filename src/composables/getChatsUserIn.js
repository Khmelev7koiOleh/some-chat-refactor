import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase-init";
import { storeToRefs } from "pinia";
import { useFirestore } from "../store/fireStore";

export function useGetChatsUserIn() {
  const fireStore = useFirestore();

  const { userInChats } = storeToRefs(fireStore);

  const getChatsUserIn = async (userId) => {
    try {
      // 1. Create reference to chats collection
      const chatsRef = collection(db, "chats");

      // 2. Create query to find chats where user is a participant
      const q = query(
        chatsRef,
        where("participants", "array-contains", userId)
      );

      // 3. Execute the query
      const querySnapshot = await getDocs(q);

      // 4. Process the results
      userInChats.value = [];
      querySnapshot.forEach((doc) => {
        userInChats.value.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`Found ${userInChats.length} chats for user ${userId}`);
      console.log(userInChats.value);

      return userInChats;

      //   const unsubscribe = onSnapshot(newChatRef, (doc) => {
      //     if (doc.exists()) {
      //       currentChat.value = doc.data(); // Update reactively
      //     }
      //   });
    } catch (error) {
      console.error("Error fetching user chats:", error);
      throw error;
    }
  };

  return { getChatsUserIn };
}
