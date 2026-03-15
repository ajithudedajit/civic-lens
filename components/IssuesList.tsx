import { useEffect, useState } from "react";
import { addIssue, listenIssues, Issue } from "../lib/issues";

export default function IssuesList() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const unsubscribe = listenIssues(setIssues);
    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    if (title && description) {
      addIssue({ title, description, timestamp: Date.now() });
      setTitle("");
      setDescription("");
    }
  };

  return (
    <div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <button onClick={handleAdd}>Add Issue</button>

      <ul>
        {issues.map((issue, i) => (
          <li key={i}>
            {issue.title}: {issue.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
