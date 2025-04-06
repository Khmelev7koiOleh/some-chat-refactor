// src/composables/useAuth.js
import { defineStore } from "pinia";
import { onMounted, ref, watchEffect } from "vue";

import { useRouter } from "vue-router";
import { nextTick } from "vue";
import moment from "moment";
import { storeToRefs } from "pinia";
import { db } from "../firebase-init";
import { v4 as uuid } from "uuid";
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
} from "firebase/auth";
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
    const auth = getAuth();
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
      console.log("User in setUser", userInfo);
      if (!userInfo) router.push("/login"); // Prevents errors if userInfo is undefined

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
          photoURL:
            result.user.photoURL ||
            "https://www.w3schools.com/howto/img_avatar.png",
          providerId: result.user.providerData[0].providerId,
          createdAt: new Date(),
        };

        const q = userSnap.data();
        // –––––––––
        const userDataExist = {
          uid: q.uid,
          displayName: q.displayName,
          email: q.email,
          photoURL:
            q.photoURL ||
            "https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png",

          createdAt: new Date(),
        };

        if (!userSnap.exists()) {
          await setDoc(userRef, userDataExist);
          console.log("New user added to Firestore.");
        } else {
          console.log("User already exists in Firestore:", userSnap.data());
        }

        setUser(q);

        router.push("/");
      } catch (error) {
        console.error("Login failed:", error);
        router.push("/login");
      }
    };

    // ✅ Login function with user existence check
    const signUp = async (name, email, password) => {
      try {
        // ✅ Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        console.log("UID:", user.uid);
        console.log("Email:", user.email);

        // 📄 Reference to Firestore document
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        // 🧠 Firestore user data to save
        const userData = {
          uid: user.uid,
          displayName: name,
          email: user.email,
          photoURL:
            user.photoURL ||
            "https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png",

          // providerId: user.providerData?.[0]?.providerId || "",
          createdAt: new Date(),
        };

        // 🔍 Check if Firestore user already exists
        if (!userSnap.exists()) {
          await setDoc(userRef, userData);
          console.log("✅ New user added to Firestore:", userData);
        } else {
          console.log("ℹ️ User already exists in Firestore:", userSnap.data());
        }

        // ✅ Set user in your app state and navigate
        setUser(userData);
        router.push("/");
        return user;
      } catch (error) {
        console.error("❌ Sign up failed:", error.message);
        router.push("/login");
      }
    };

    const signIn = async (name, email, password) => {
      console.log("email:", email);
      console.log("password:", password);
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const user = userCredential.user;

        console.log("UID:", user.uid);
        console.log("Email:", user);

        // 📄 Reference to Firestore document
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const q = userSnap.data();
        // –––––––––
        const userData = {
          uid: q.uid,
          displayName: q.displayName,
          email: q.email,
          photoURL:
            q.photoURL ||
            "https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png",

          createdAt: new Date(),
        };

        setUser(userData);
        router.push("/");
        return userCredential.user;
      } catch (error) {
        throw error;
      }
    };
    const updateName = async (q) => {
      console.log(q);
      console.log(user.value.localId);
      const userRef = doc(db, "users", user.value.localId);
      const newData = {
        displayName: q,
      };
      await updateDoc(userRef, newData);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          q = doc.data(); // Update reactively
          user.value.displayName = q.displayName;
        }
        console.log(doc.data());
      });

      currentChatId.value = chatId;
      return chatId;
    };

    const updatePhoto = async (q) => {
      console.log(q);
      console.log(user.value.localId);
      const userRef = doc(db, "users", user.value.localId);
      const newData = {
        photoURL: q,
      };
      await updateDoc(userRef, newData);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          q = doc.data(); // Update reactively
          user.value.photoUrl =
            q.photoURL ||
            "https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png";
        }
        console.log(doc.data());
      });

      return newData;
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

    return {
      user,
      loginCo,
      signUp,
      signIn,
      logout,
      updatePhoto,
      updateName,
      logoutPopUpOpen,
    };
  },
  { persist: true }
);
