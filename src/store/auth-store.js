import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth, db } from "../firebase-init";
import { v4 as uuid } from "uuid";
import { signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, getDocs, collection } from "firebase/firestore";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account", // Forces account selection screen
});

export const useAuthStore = defineStore("auth", () => {
  const user = ref({
    localId: null,
    email: null,
    displayName: null,
    photoUrl: null,
    emailVerified: null,
    lastLoginAt: null,
    lastRefreshAt: null,
  });

  const allUsers = ref([]); // Correctly declared

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

  return { user, login, logout, getAllUsers, allUsers };
});
