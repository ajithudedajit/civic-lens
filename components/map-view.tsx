"use client";

import { useState, useCallback } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import { MapPin, Heart, Clock } from "lucide-react";
import { Report, ReportCategory } from "@/types/report";
import { Button } from "@/components/ui/button";

interface MapViewProps {
  reports: Report[];
  onUpvote: (reportId: string) => void;
}

const categoryColors: Record<ReportCategory, string> = {
  Infrastructure: "#3b82f6",
  "Safety & Security": "#ef4444",
  Environment: "#22c55e",
  "Public Health & Sanitation": "#f59e0b",
  "Public Services & Utilities": "#8b5cf6",
  "Community & Social Issues": "#06b6d4",
  "Governance & Administration": "#84cc16",
  "Business & Regulatory Compliance": "#f97316",
  "Aesthetic / Urban Design": "#a855f7",
  "Emergency Incidents": "#dc2626",
};

export function MapView({ reports, onUpvote }: MapViewProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -74.006,
    latitude: 40.7128,
    zoom: 12,
  });

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

  const onMarkerClick = useCallback((report: Report) => {
    setSelectedReport(report);
  }, []);

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Issue Map</h1>
        <div className="text-sm text-muted-foreground">
          {reports.filter((r) => r.coordinates).length} mapped reports
        </div>
      </div>

      <div className="h-[500px] rounded-lg overflow-hidden border border-border">
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapboxAccessToken="pk.eyJ1IjoiYW1lZW51IiwiYSI6ImNrOTFwcHdlYjAwOGczbmt5Mzk1eHBoNDYifQ.BwOWHvAtshdRUF--Y4kimQ"
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
       / >
          {reports
            .filter((report) => report.coordinates)
            .map((report) => (
              <Marker
                key={report.id}
                longitude={report.coordinates![0]}
                latitude={report.coordinates![1]}
                anchor="bottom"
                onClick={() => onMarkerClick(report)}
              >
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: categoryColors[report.category] }}
                >
                  <MapPin className="h-4 w-4 text-white" />
                </div>
              </Marker>
            ))}

          {selectedReport && selectedReport.coordinates && (
            <Popup
              longitude={selectedReport.coordinates[0]}
              latitude={selectedReport.coordinates[1]}
              anchor="top"
              onClose={() => setSelectedReport(null)}
              className="max-w-sm"
            >
              <div className="p-3 space-y-3 bg-card text-card-foreground rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm leading-tight flex-1">
                    {selectedReport.title}
                  </h3>
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium text-white shrink-0"
                    style={{
                      backgroundColor: categoryColors[selectedReport.category],
                    }}
                  >
                    {selectedReport.category}
                  </span>
                </div>

                <p className="text-muted-foreground text-xs leading-relaxed">
                  {selectedReport.description.length > 100
                    ? `${selectedReport.description.substring(0, 100)}...`
                    : selectedReport.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{selectedReport.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(selectedReport.timestamp)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpvote(selectedReport.id)}
                    className="flex items-center gap-2 h-7 px-2 text-xs"
                  >
                    <Heart
                      className={`h-3 w-3 ${
                        selectedReport.userVote === "up"
                          ? "fill-red-400 text-red-400"
                          : ""
                      }`}
                    />
                    <span>{selectedReport.upvotes}</span>
                  </Button>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Legend */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="font-medium mb-3">Category Legend</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-white"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-muted-foreground">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
