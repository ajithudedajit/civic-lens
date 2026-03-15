// lib/firebase.ts
let app: ReturnType<typeof import("firebase/app").initializeApp> | null = null;
let db: ReturnType<typeof import("firebase/firestore").getFirestore> | null = null;

export const getFirebase = () => {
  // Only run in browser
  if (typeof window === "undefined") return { app: null, db: null };

  if (!app) {
    const { initializeApp } = require("firebase/app");
    const { getFirestore } = require("firebase/firestore");

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
