"use client";

import { useState, useCallback, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import { MapPin } from "lucide-react";
import { Report } from "@/types/report";
import { categoryConfig } from "@/lib/config";
import ReportMarker from "./ReportMarker";
import ReportPopup from "./ReportPopup";

interface MapContainerProps {
  reports: Report[];
  selectedReport: Report | null;
  hoveredReport: Report | null;
  onReportSelect: (report: Report | null) => void;
  onReportHover: (report: Report | null) => void;
  onVoteUpdate?: (
    reportId: string,
    upvotes: number,
    downvotes: number,
    userVote: "up" | "down" | null
  ) => void;
  onMapClick?: (event: any) => void;
  isSelectingLocation?: boolean;
  selectedLocation?: { coordinates: [number, number]; address: string } | null;
  cursor?: string;
  center?: [number, number] | null;
}

export default function MapContainer({
  reports,
  selectedReport,
  hoveredReport,
  onReportSelect,
  onReportHover,
  onVoteUpdate,
  onMapClick,
  isSelectingLocation = false,
  selectedLocation,
  cursor = "default",
  center,
}: MapContainerProps) {
  const [viewState, setViewState] = useState({
    longitude: -74.006,
    latitude: 40.7128,
    zoom: 11,
  });

  // Update map center when center prop changes
  useEffect(() => {
    if (center) {
      setViewState((prev) => ({
        ...prev,
        longitude: center[0],
        latitude: center[1],
        zoom: 15, // Zoom in when centering on user location
      }));
    }
  }, [center]);

  const handleMapClick = (e: any) => {
    if (onMapClick) {
      onMapClick(e);
    } else if (!isSelectingLocation) {
      onReportSelect(null);
    }
  };

  return (
    <Map
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      mapboxAccessToken="pk.eyJ1IjoiYW1lZW51IiwiYSI6ImNrOTFwcHdlYjAwOGczbmt5Mzk1eHBoNDYifQ.BwOWHvAtshdRUF--Y4kimQ"
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      onClick={handleMapClick}
      cursor={cursor}
    >
      {/* Report Markers */}
      {reports
        .filter((report) => report.coordinates)
        .map((report) => (
          <ReportMarker
            key={report.id}
            report={report}
            isSelected={selectedReport?.id === report.id}
            isHovered={hoveredReport?.id === report.id}
            onSelect={onReportSelect}
            onHover={onReportHover}
          />
        ))}

      {/* Selected location marker for new reports */}
      {selectedLocation && (
        <Marker
          longitude={selectedLocation.coordinates[0]}
          latitude={selectedLocation.coordinates[1]}
          anchor="bottom"
        >
          <div className="relative">
            <div className="w-8 h-8 bg-green-500 border-3 border-white rounded-full shadow-xl flex items-center justify-center animate-pulse">
              <MapPin className="h-4 w-4 text-white" />
            </div>
          </div>
        </Marker>
      )}

      {/* Hover tooltip */}
      {hoveredReport && hoveredReport.coordinates && !selectedReport && (
        <ReportPopup report={hoveredReport} type="hover" />
      )}

      {/* Detailed popup on click */}
      {selectedReport && selectedReport.coordinates && (
        <ReportPopup
          report={selectedReport}
          type="detailed"
          onClose={() => onReportSelect(null)}
          onVoteUpdate={onVoteUpdate}
        />
      )}
    </Map>
  );
}
