"use client";

import { Popup } from "react-map-gl";
import { MapPin, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { Report } from "@/types/report";
import { categoryConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { useVoting } from "@/hooks/useVoting";
import { useState } from "react";

interface ReportPopupProps {
  report: Report;
  type: "hover" | "detailed";
  onClose?: () => void;
  onVoteUpdate?: (
    reportId: string,
    upvotes: number,
    downvotes: number,
    userVote: "up" | "down" | null
  ) => void;
}

export default function ReportPopup({
  report,
  type,
  onClose,
  onVoteUpdate,
}: ReportPopupProps) {
  const { vote, removeVote, isVoting } = useVoting();
  const [localReport, setLocalReport] = useState(report);

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

  if (!report.coordinates) return null;

  if (type === "hover") {
    return (
      <Popup
        longitude={report.coordinates[0]}
        latitude={report.coordinates[1]}
        anchor="top"
        closeButton={false}
        closeOnClick={false}
        className="pointer-events-none"
      >
        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl border border-gray-700 max-w-xs">
          <div className="font-semibold text-sm mb-1">{report.title}</div>
          <div className="text-xs text-gray-300 mb-2">{report.location}</div>
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{
                backgroundColor: categoryConfig[report.category].color,
              }}
            >
              {report.category}
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{localReport.upvotes} ↑</span>
              <span>{localReport.downvotes} ↓</span>
            </div>
          </div>
        </div>
      </Popup>
    );
  }

  return (
    <Popup
      longitude={report.coordinates[0]}
      latitude={report.coordinates[1]}
      anchor="top"
      onClose={onClose}
      className="max-w-sm"
    >
      <div className="p-4 space-y-4 bg-white text-gray-900 rounded-lg shadow-xl">
        {report.imageUrl && (
          <div className="w-full h-32 rounded-lg overflow-hidden">
            <img
              src={report.imageUrl}
              alt={report.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg leading-tight flex-1">
            {localReport.title}
          </h3>
          <span
            className="px-3 py-1 rounded-full text-xs font-medium text-white shrink-0"
            style={{
              backgroundColor: categoryConfig[localReport.category].color,
            }}
          >
            {localReport.category}
          </span>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed">
          {localReport.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{localReport.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(localReport.timestamp)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("up")}
              disabled={isVoting}
              className={`flex items-center gap-1 h-8 px-2 transition-colors ${
                localReport.userVote === "up"
                  ? "text-green-600 hover:text-green-700 bg-green-50"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
              }`}
            >
              <ThumbsUp className="h-3 w-3" />
              <span className="text-xs font-medium">{localReport.upvotes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("down")}
              disabled={isVoting}
              className={`flex items-center gap-1 h-8 px-2 transition-colors ${
                localReport.userVote === "down"
                  ? "text-red-600 hover:text-red-700 bg-red-50"
                  : "text-gray-600 hover:text-red-600 hover:bg-red-50"
              }`}
            >
              <ThumbsDown className="h-3 w-3" />
              <span className="text-xs font-medium">
                {localReport.downvotes}
              </span>
            </Button>
          </div>

          <div className="text-xs text-gray-400">
            Score: {localReport.upvotes - localReport.downvotes}
          </div>
        </div>
      </div>
    </Popup>
  );
}
