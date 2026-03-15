// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

let app: ReturnType<typeof initializeApp> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

export const getFirebase = () => {
  if (!app) {
    app = initializeApp({
      apiKey: "AIzaSyA-yVIzT-UIB1BmKuOicCM-r8BHARMvrF4",
      authDomain: "civic-lens-new.firebaseapp.com",
      projectId: "civic-lens-new",
      storageBucket: "civic-lens-new.firebasestorage.app",
      messagingSenderId: "108599998082",
      appId: "1:108599998082:web:abf189e184b634ff66a69b",
      measurementId: "G-451GXGCNCG",
    });
    db = getFirestore(app);
  }
  return { app, db };
};
