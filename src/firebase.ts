import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";
import {
  getFirestore
} from "firebase/firestore";

// Config matches the generated firebase-applet-config.json file
const firebaseConfig = {
  projectId: "project-34827ae3-34d1-4d2c-a7d",
  appId: "1:979007666870:web:5355368ed0e6da29020417",
  apiKey: "AIzaSyDbhJW82HLr2xxCsaMcWT7NicKW3RkXpYo",
  authDomain: "project-34827ae3-34d1-4d2c-a7d.firebaseapp.com",
  storageBucket: "project-34827ae3-34d1-4d2c-a7d.firebasestorage.app",
  messagingSenderId: "979007666870",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Google login popup helper
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Firebase Google Authentication Failure:", error);
    throw error;
  }
};

// Sign out helper
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Firebase Sign Out Failure:", error);
    throw error;
  }
};
