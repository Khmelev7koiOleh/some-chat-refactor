import { defineStore } from "pinia";
import { db } from "@/firebase"; // Import Firestore instance
import { collection, getDocs } from "firebase/firestore";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    users: [],
  }),

  actions: {
    async fetchUsers() {
      try {
        const usersCollection = collection(db, "users");
        const snapshot = await getDocs(usersCollection);

        if (!snapshot.empty) {
          this.users = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Users fetched successfully:", this.users);
        } else {
          console.log("No users found in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
  },
});
