"use client";

import { useState, useEffect } from "react";
import { Database, AlertCircle, CheckCircle } from "lucide-react";

interface StatusBannerProps {
  show: boolean;
}

export default function StatusBanner({ show }: StatusBannerProps) {
  const [qdrantStatus, setQdrantStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

  useEffect(() => {
    const checkQdrantStatus = async () => {
      try {
        const response = await fetch("/api/reports");
        const data = await response.json();

        // Check if we have any data - if empty, Qdrant might not be connected or no data exists
        if (data.length === 0) {
          setQdrantStatus("disconnected");
        } else {
          setQdrantStatus("connected");
        }
      } catch (error) {
        setQdrantStatus("disconnected");
      }
    };

    if (show) {
      checkQdrantStatus();
    }
  }, [show]);

  if (!show || qdrantStatus === "checking") return null;

  return (
    <div className="absolute top-4 right-4 z-50 max-w-sm">
      {qdrantStatus === "disconnected" ? (
        <div className="bg-yellow-900 bg-opacity-90 text-yellow-200 px-4 py-2 rounded-lg shadow-xl border border-yellow-600">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <div className="text-sm">
              <div className="font-medium">No Data Available</div>
              <div className="text-xs mt-1">
                Start Qdrant with{" "}
                <code className="bg-yellow-800 px-1 rounded text-xs">
                  npm run qdrant:compose
                </code>{" "}
                and add some reports
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-900 bg-opacity-90 text-green-200 px-4 py-2 rounded-lg shadow-xl border border-green-600">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <div className="text-sm">
              <div className="font-medium">Qdrant Connected</div>
              <div className="text-xs mt-1">Vector database active</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
