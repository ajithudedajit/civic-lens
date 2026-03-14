import { NextRequest, NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = "reports";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { vote, userId } = await request.json();
    const resolvedParams = await params;
    const reportId = resolvedParams.id;

    if (!vote || !userId || !["up", "down"].includes(vote)) {
      return NextResponse.json(
        { error: "Invalid vote or userId" },
        { status: 400 }
      );
    }

    // Get the current report
    const searchResult = await client.retrieve(COLLECTION_NAME, {
      ids: [parseInt(reportId)],
      with_payload: true,
    });

    if (searchResult.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const report = searchResult[0].payload;

    // Get current votes data with proper typing
    const userVotes: Record<string, "up" | "down"> =
      (report?.userVotes as Record<string, "up" | "down">) || {};

    // Calculate new vote counts
    let newUpvotes = Number(report?.upvotes) || 0;
    let newDownvotes = Number(report?.downvotes) || 0;

    // Remove previous vote if exists
    const previousVote = userVotes[userId];
    if (previousVote === "up") {
      newUpvotes = Math.max(0, newUpvotes - 1);
    } else if (previousVote === "down") {
      newDownvotes = Math.max(0, newDownvotes - 1);
    }

    // Add new vote
    if (vote === "up") {
      newUpvotes += 1;
      userVotes[userId] = "up";
    } else if (vote === "down") {
      newDownvotes += 1;
      userVotes[userId] = "down";
    }

    // Update the report
    await client.setPayload(COLLECTION_NAME, {
      points: [searchResult[0].id],
      payload: {
        ...report,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        userVotes: userVotes,
      },
    });

    return NextResponse.json({
      success: true,
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      userVote: vote,
    });
  } catch (error) {
    console.error("Error updating vote:", error);
    return NextResponse.json(
      { error: "Failed to update vote" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await request.json();
    const resolvedParams = await params;
    const reportId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Get the current report
    const searchResult = await client.retrieve(COLLECTION_NAME, {
      ids: [parseInt(reportId)],
      with_payload: true,
    });

    if (searchResult.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const report = searchResult[0].payload;
    const userVotes: Record<string, "up" | "down"> =
      (report?.userVotes as Record<string, "up" | "down">) || {};

    // Calculate new vote counts
    let newUpvotes = Number(report?.upvotes) || 0;
    let newDownvotes = Number(report?.downvotes) || 0;

    // Remove user's vote
    const previousVote = userVotes[userId];
    if (previousVote === "up") {
      newUpvotes = Math.max(0, newUpvotes - 1);
    } else if (previousVote === "down") {
      newDownvotes = Math.max(0, newDownvotes - 1);
    }

    delete userVotes[userId];

    // Update the report
    await client.setPayload(COLLECTION_NAME, {
      points: [searchResult[0].id],
      payload: {
        ...report,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        userVotes: userVotes,
      },
    });

    return NextResponse.json({
      success: true,
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      userVote: null,
    });
  } catch (error) {
    console.error("Error removing vote:", error);
    return NextResponse.json(
      { error: "Failed to remove vote" },
      { status: 500 }
    );
  }
}
