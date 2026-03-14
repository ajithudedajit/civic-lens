import { QdrantClient } from "@qdrant/js-client-rest";

const COLLECTION_NAME = "civic_reports";

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

let memoryReports: any[] = [];

export async function initializeCollection() {
  try {
    await client.getCollections();
    console.log("Qdrant available");
  } catch {
    console.log("Qdrant not available - using memory storage");
  }
}

export async function insertReport(report: any) {
  try {
    const vector = new Array(384).fill(0);

    await client.upsert(COLLECTION_NAME, {
      points: [
        {
          id: parseInt(report.id),
          vector,
          payload: report,
        },
      ],
    });

    console.log("Inserted report into Qdrant");
  } catch {
    console.log("Qdrant not available - storing in memory");
    memoryReports.push(report);
  }
}

export async function getAllReports() {
  try {
    const result = await client.scroll(COLLECTION_NAME, {
      limit: 50,
    });

    return result.points.map((p) => p.payload);
  } catch {
    console.log("Qdrant not available - returning memory reports");
    return memoryReports;
  }
}
export async function bulkInsertReports(reports: any[]) {
  for (const report of reports) {
    await insertReport(report);
  }
}
