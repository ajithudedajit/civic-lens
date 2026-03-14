export type ReportCategory =
  | "Infrastructure"
  | "Safety & Security"
  | "Environment"
  | "Public Health & Sanitation"
  | "Public Services & Utilities"
  | "Community & Social Issues"
  | "Governance & Administration"
  | "Business & Regulatory Compliance"
  | "Aesthetic / Urban Design"
  | "Emergency Incidents";

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  location: string;
  coordinates?: [number, number]; // [longitude, latitude]
  imageUrl?: string;
  upvotes: number;
  downvotes: number;
  timestamp: Date;
  userVote?: "up" | "down" | null; // Current user's vote
  userVotes?: Record<string, "up" | "down">; // All user votes for this report
}

export interface CreateReportData {
  title: string;
  description: string;
  category: ReportCategory;
  location: string;
  coordinates?: [number, number];
  imageUrl?: string;
}
