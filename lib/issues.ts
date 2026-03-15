// lib/issues.ts
import type { Report } from "@/types/report";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { getFirebase } from "./firebase";

export const addIssue = async (report: Report) => {
  if (typeof window === "undefined") return; // server safety
  const { db } = getFirebase();
  await addDoc(collection(db!, "issues"), { ...report, timestamp: Date.now() });
};

export const listenIssues = (callback: (issues: Report[]) => void) => {
  if (typeof window === "undefined") return () => {}; // server safety
  const { db } = getFirebase();
  const q = query(collection(db!, "issues"), orderBy("timestamp", "desc"));
  return onSnapshot(q, (snapshot) => {
    const issues = snapshot.docs.map((doc) => doc.data() as Report);
    callback(issues);
  });
};
