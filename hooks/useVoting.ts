import { useState } from "react";
import { getAnonymousUserId, saveUserVote } from "@/lib/anonymousUser";

interface VoteResponse {
  success: boolean;
  upvotes: number;
  downvotes: number;
  userVote: "up" | "down" | null;
}

export function useVoting() {
  const [isVoting, setIsVoting] = useState(false);

  const vote = async (
    reportId: string,
    voteType: "up" | "down"
  ): Promise<VoteResponse | null> => {
    if (isVoting) return null;

    setIsVoting(true);
    try {
      const userId = getAnonymousUserId();

      const response = await fetch(`/api/reports/${reportId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vote: voteType,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to vote");
      }

      const result: VoteResponse = await response.json();

      // Update local storage
      saveUserVote(reportId, result.userVote);

      return result;
    } catch (error) {
      console.error("Error voting:", error);
      return null;
    } finally {
      setIsVoting(false);
    }
  };

  const removeVote = async (reportId: string): Promise<VoteResponse | null> => {
    if (isVoting) return null;

    setIsVoting(true);
    try {
      const userId = getAnonymousUserId();

      const response = await fetch(`/api/reports/${reportId}/vote`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove vote");
      }

      const result: VoteResponse = await response.json();

      // Update local storage
      saveUserVote(reportId, null);

      return result;
    } catch (error) {
      console.error("Error removing vote:", error);
      return null;
    } finally {
      setIsVoting(false);
    }
  };

  return {
    vote,
    removeVote,
    isVoting,
  };
}
