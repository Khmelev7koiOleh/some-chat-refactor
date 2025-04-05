// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYdywUT1jSbP7B39Tozm3aB2HfUQYZhS8",
  authDomain: "web-chat-d4048.firebaseapp.com",
  projectId: "web-chat-d4048",
  storageBucket: "web-chat-d4048.firebasestorage.app",
  messagingSenderId: "133240910232",
  appId: "1:133240910232:web:7b239ac132524ba258fbed",
  measurementId: "G-1JEXPXB4GC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const analytics = getAnalytics(app);
export const storage = getStorage(app);

export { db, auth, provider, signInWithPopup };
