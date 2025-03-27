// src/composables/useAuth.js
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
const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account", // Forces account selection screen
});

export const useAuthStoreC = defineStore(
  "authc",
  () => {
    //_____________

    const logoutPopUpOpen = ref(false);
    const router = useRouter();
    //_____________
    //user
    const user = ref({
      localId: null,
      email: null,
      displayName: null,
      photoUrl: null,
      emailVerified: null,
      lastLoginAt: null,
      lastRefreshAt: null,
    });

    const setUser = (userInfo) => {
      if (!userInfo) return; // Prevents errors if userInfo is undefined

      user.value = {
        localId: userInfo.uid,
        email: userInfo.email,
        displayName: userInfo.displayName,
        photoUrl: userInfo.photoURL,
        emailVerified: userInfo.emailVerified,
        lastLoginAt: userInfo.metadata?.lastSignInTime || null,
        lastRefreshAt: userInfo.metadata?.creationTime || null,
      };
      console.log("User set:", user.value);
    };

    // ✅ Login function with user existence check
    const loginCo = async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        if (!result.user) throw new Error("User not found");

        console.log("User logged in:", result.user);

        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);

        const userData = {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          providerId: result.user.providerData[0].providerId,
          createdAt: new Date(),
        };

        if (!userSnap.exists()) {
          await setDoc(userRef, userData);
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

    return { user, loginCo, logout, logoutPopUpOpen };
  },
  { persist: true }
);
