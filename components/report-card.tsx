"use client";

import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Report, ReportCategory } from "@/types/report";
import { cn } from "@/lib/utils";
import { useVoting } from "@/hooks/useVoting";
import { useState, useEffect } from "react";

interface ReportCardProps {
  report: Report;
  onVoteUpdate?: (
    reportId: string,
    upvotes: number,
    downvotes: number,
    userVote: "up" | "down" | null
  ) => void;
}

const categoryColors: Record<ReportCategory, string> = {
  Infrastructure: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Safety & Security": "bg-red-500/20 text-red-400 border-red-500/30",
  Environment: "bg-green-500/20 text-green-400 border-green-500/30",
  "Public Health & Sanitation":
    "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Public Services & Utilities":
    "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "Community & Social Issues":
    "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Governance & Administration":
    "bg-lime-500/20 text-lime-400 border-lime-500/30",
  "Business & Regulatory Compliance":
    "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Aesthetic / Urban Design":
    "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Emergency Incidents": "bg-red-600/20 text-red-300 border-red-600/30",
};

export function ReportCard({ report, onVoteUpdate }: ReportCardProps) {
  const { vote, removeVote, isVoting } = useVoting();
  const [localReport, setLocalReport] = useState(report);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalReport(report);
  }, [report]);

  const handleVote = async (voteType: "up" | "down") => {
    // If user already voted the same way, remove the vote
    if (localReport.userVote === voteType) {
      const result = await removeVote(localReport.id);
      if (result) {
        const updatedReport = {
          ...localReport,
          upvotes: result.upvotes,
          downvotes: result.downvotes,
          userVote: result.userVote,
        };
        setLocalReport(updatedReport);
        onVoteUpdate?.(
          localReport.id,
          result.upvotes,
          result.downvotes,
          result.userVote
        );
      }
    } else {
      // Cast a new vote
      const result = await vote(localReport.id, voteType);
      if (result) {
        const updatedReport = {
          ...localReport,
          upvotes: result.upvotes,
          downvotes: result.downvotes,
          userVote: result.userVote,
        };
        setLocalReport(updatedReport);
        onVoteUpdate?.(
          localReport.id,
          result.upvotes,
          result.downvotes,
          result.userVote
        );
      }
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {report.imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={report.imageUrl}
            alt={report.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-foreground leading-tight flex-1">
            {report.title}
          </h3>
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium border shrink-0",
              categoryColors[report.category]
            )}
          >
            {report.category}
          </span>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">
          {report.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{localReport.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(localReport.timestamp)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("up")}
              disabled={isVoting}
              className={cn(
                "flex items-center gap-1 h-8 px-2",
                localReport.userVote === "up"
                  ? "text-green-600 hover:text-green-700 bg-green-50"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
              )}
            >
              <ThumbsUp className="h-3 w-3" />
              <span className="text-xs font-medium">{localReport.upvotes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("down")}
              disabled={isVoting}
              className={cn(
                "flex items-center gap-1 h-8 px-2",
                localReport.userVote === "down"
                  ? "text-red-600 hover:text-red-700 bg-red-50"
                  : "text-gray-600 hover:text-red-600 hover:bg-red-50"
              )}
            >
              <ThumbsDown className="h-3 w-3" />
              <span className="text-xs font-medium">
                {localReport.downvotes || 0}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 h-8 px-3 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">Comment</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-muted-foreground hover:text-foreground"
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
