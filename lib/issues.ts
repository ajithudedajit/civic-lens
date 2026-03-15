import { db } from "./firebase";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

export type Issue = {
  title: string;
  description: string;
  timestamp: number;
};

// Add new issue
export const addIssue = async (issue: Issue) => {
  await addDoc(collection(db, "issues"), issue);
};

// Listen for real-time updates
export const listenIssues = (callback: (issues: Issue[]) => void) => {
  const q = query(collection(db, "issues"), orderBy("timestamp", "desc"));
  return onSnapshot(q, (snapshot) => {
    const issues: Issue[] = snapshot.docs.map((doc) => doc.data() as Issue);
    callback(issues);
  });
};
