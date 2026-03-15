"use client";

import { db } from "./firebase";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import type { Report } from "@/types/report";

// Add a new issue
export const addIssue = async (report: Report) => {
  if (!db) return;
  const issuesRef = collection(db, "issues");
  await addDoc(issuesRef, { ...report, timestamp: new Date() });
};

// Listen to issues in real-time
export const listenIssues = (callback: (reports: Report[]) => void) => {
  if (!db) return () => {};
  const issuesRef = collection(db, "issues");
  const q = query(issuesRef, orderBy("timestamp", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const reports: Report[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: new Date(doc.data().timestamp.seconds * 1000),
    })) as Report[];
    callback(reports);
  });

  return unsubscribe;
};
