import { NextRequest, NextResponse } from "next/server";
import {
  getAllReports,
  insertReport,
  initializeCollection,
} from "@/lib/qdrant";
import { Report } from "@/types/report";

// Initialize collection on startup
initializeCollection();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const reports = await getAllReports();

    // Add user vote information if userId is provided
    const reportsWithUserVotes = reports.map((report: any) => {
      const userVotes = report.userVotes || {};
      const userVote = userId ? userVotes[userId] || null : null;

      return {
        ...report,
        downvotes: report.downvotes || 0, // Ensure downvotes exists
        userVote,
        // Remove internal userVotes object from response
        userVotes: undefined,
      };
    });

    return NextResponse.json(reportsWithUserVotes);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const reportData = await request.json();

    const report: Report = {
      id: Date.now().toString(),
      title: reportData.title,
      description: reportData.description,
      category: reportData.category,
      location: reportData.location,
      coordinates: reportData.coordinates,
      upvotes: 0,
      downvotes: 0,
      timestamp: new Date(),
      imageUrl: reportData.imageUrl || "",
      userVote: null,
    };

    await insertReport(report);
    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
