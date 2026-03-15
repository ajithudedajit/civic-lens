// lib/firebase.ts
let app: any = null;
let db: any = null;

export const getFirebase = () => {
  if (typeof window === "undefined") return { app: null, db: null }; // server safety
  if (!app) {
    const { initializeApp } = require("firebase/app");
    const { getFirestore } = require("firebase/firestore");

    app = initializeApp({
      apiKey: "...",
      authDomain: "...",
      projectId: "...",
      storageBucket: "...",
      messagingSenderId: "...",
      appId: "...",
      measurementId: "...",
    });

    db = getFirestore(app);
  }
  return { app, db };
};
