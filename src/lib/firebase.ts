import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBPcyBbE6RU5jkqWq5JdrVkB6-mGgCAGIw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "le-patron-facile.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "le-patron-facile",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "le-patron-facile.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1070706377366",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1070706377366:web:6b58fe7339c372fd75b8b7",
};

export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
