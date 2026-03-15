// lib/firebase.ts
"use client"; // important! ensures this runs only on the client

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

let app: FirebaseApp;
let db: Firestore;
let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== "undefined") {
  // Only initialize Firebase in the browser
  if (!getApps().length) {
    app = initializeApp({
      apiKey: "AIzaSyA-yVIzT-UIB1BmKuOicCM-r8BHARMvrF4",
      authDomain: "civic-lens-new.firebaseapp.com",
      projectId: "civic-lens-new",
      storageBucket: "civic-lens-new.firebasestorage.app",
      messagingSenderId: "108599998082",
      appId: "1:108599998082:web:abf189e184b634ff66a69b",
      measurementId: "G-451GXGCNCG"
    });

    analytics = getAnalytics(app); // safe because we are in the browser
  } else {
    app = getApps()[0];
    try {
      analytics = getAnalytics(app);
    } catch {
      analytics = null;
    }
  }

  db = getFirestore(app);
}

export { app, db, analytics };
