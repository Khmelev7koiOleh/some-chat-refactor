import { defineStore } from "pinia";
import { ref } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-init";

export const useUserStore = defineStore("user", () => {
  const allUsers = ref([]);

  const getAllUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      allUsers.value = querySnapshot.docs.map((doc) => doc.data());
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return { allUsers, getAllUsers };
});
