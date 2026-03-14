import { NextResponse } from "next/server";
import { initializeCollection, bulkInsertReports } from "@/lib/qdrant";
import { Report } from "@/types/report";

const sampleReports: Report[] = [
  {
    id: "1",
    title: "Broken Streetlight on Main Street",
    description:
      "The streetlight at the corner of Main Street and 5th Avenue has been out for over a week, creating a safety hazard for pedestrians at night.",
    category: "Safety & Security",
    location: "Main Street & 5th Avenue",
    coordinates: [-74.006, 40.7128],
    upvotes: 12,
    downvotes: 1,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    imageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    userVote: null,
    userVotes: {},
  },
  {
    id: "2",
    title: "Pothole on Broadway",
    description:
      "Large pothole causing damage to vehicles. Multiple cars have reported tire damage from this hazard.",
    category: "Infrastructure",
    location: "Broadway near Central Park",
    coordinates: [-73.9857, 40.7484],
    upvotes: 8,
    downvotes: 0,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    imageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    userVote: null,
    userVotes: {},
  },
  {
    id: "3",
    title: "Graffiti on Public Building",
    description:
      "Vandalism on the side of the community center building. The graffiti covers a large area and needs professional cleaning.",
    category: "Aesthetic / Urban Design",
    location: "Community Center, Park Avenue",
    coordinates: [-73.9776, 40.7589],
    upvotes: 5,
    downvotes: 2,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    imageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    userVote: null,
    userVotes: {},
  },
  {
    id: "4",
    title: "Overflowing Trash Bins",
    description:
      "The trash bins in Central Park are overflowing, attracting pests and creating an unsanitary environment.",
    category: "Environment",
    location: "Central Park, East Side",
    coordinates: [-73.9654, 40.7829],
    upvotes: 15,
    downvotes: 0,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    imageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    userVote: null,
    userVotes: {},
  },
  {
    id: "5",
    title: "Broken Sidewalk",
    description:
      "Cracked and uneven sidewalk creating a tripping hazard for pedestrians, especially dangerous for elderly residents.",
    category: "Safety & Security",
    location: "Oak Street",
    coordinates: [-74.0059, 40.7282],
    upvotes: 9,
    downvotes: 1,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    imageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    userVote: null,
    userVotes: {},
  },
];

export async function POST() {
  try {
    // Initialize collection first
    await initializeCollection();

    // Add sample reports
    await bulkInsertReports(sampleReports);

    return NextResponse.json({
      message: "Database seeded successfully",
      reportsAdded: sampleReports.length,
      note: "Sample reports have been added to the database",
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      {
        message: "Failed to seed database - Qdrant may not be available",
        note: "Start Qdrant with 'npm run qdrant:compose' to enable persistence",
      },
      { status: 500 }
    );
  }
}
