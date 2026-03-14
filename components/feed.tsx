"use client";

import { ReportCard } from "@/components/report-card";
import { Report } from "@/types/report";

interface FeedProps {
  reports: Report[];
  onVoteUpdate?: (
    reportId: string,
    upvotes: number,
    downvotes: number,
    userVote: "up" | "down" | null
  ) => void;
}

export function Feed({ reports, onVoteUpdate }: FeedProps) {
  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Community Reports</h1>
        <div className="text-sm text-muted-foreground">
          {reports.length} active reports
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No reports yet. Be the first to report an issue!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onVoteUpdate={onVoteUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
