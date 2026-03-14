"use client";

import { User, Award, TrendingUp, Calendar } from "lucide-react";
import { Report } from "@/types/report";

interface ProfileProps {
  reports: Report[];
}

export function Profile({ reports }: ProfileProps) {
  const userReports = reports.filter((report) => report.userVote === "up"); // Mock user reports
  const totalUpvotes = reports.reduce(
    (sum, report) => sum + (report.userVote === "up" ? report.upvotes : 0),
    0
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
          <User className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Community Member</h1>
          <p className="text-muted-foreground">
            Making our city better, one report at a time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {userReports.length}
          </div>
          <div className="text-xs text-muted-foreground">Reports</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-bold text-primary">{totalUpvotes}</div>
          <div className="text-xs text-muted-foreground">Upvotes</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-bold text-primary">12</div>
          <div className="text-xs text-muted-foreground">Impact Score</div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Achievements</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Award className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium">First Reporter</div>
              <div className="text-sm text-muted-foreground">
                Submitted your first civic issue report
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Community Helper</div>
              <div className="text-sm text-muted-foreground">
                Received 10+ upvotes on your reports
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <div className="space-y-3">
          {userReports.slice(0, 3).map((report) => (
            <div
              key={report.id}
              className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border"
            >
              <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1">
                <div className="font-medium text-sm">{report.title}</div>
                <div className="text-xs text-muted-foreground">
                  {report.location}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {report.upvotes} upvotes •{" "}
                  {report.timestamp.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
