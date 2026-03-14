"use client";

import { useCallback } from "react";
import { Marker } from "react-map-gl";
import { Report } from "@/types/report";
import { categoryConfig } from "@/lib/config";

interface ReportMarkerProps {
  report: Report;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (report: Report) => void;
  onHover: (report: Report | null) => void;
}

export default function ReportMarker({
  report,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: ReportMarkerProps) {
  const config = categoryConfig[report.category];
  const IconComponent = config.icon;

  const handleMouseEnter = useCallback(() => {
    if (!isSelected) {
      onHover(report);
    }
  }, [isSelected, onHover, report]);

  const handleMouseLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      onSelect(report);
      onHover(null);
    },
    [onSelect, onHover, report]
  );

  if (!report.coordinates) return null;

  return (
    <Marker
      longitude={report.coordinates[0]}
      latitude={report.coordinates[1]}
      anchor="bottom"
    >
      <div
        className={`relative cursor-pointer transition-all duration-200 ${
          isSelected || isHovered ? "scale-125" : "hover:scale-110"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Pulse animation for high priority issues */}
        {report.upvotes > 40 && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: config.color }}
          />
        )}

        {/* Main marker */}
        <div
          className={`w-10 h-10 rounded-full border-3 border-white shadow-xl flex items-center justify-center relative ${
            isSelected ? "ring-4 ring-white ring-opacity-50" : ""
          }`}
          style={{ backgroundColor: config.color }}
        >
          <IconComponent className="h-5 w-5 text-white" />

          {/* Upvote count badge */}
          {report.upvotes > 0 && (
            <div className="absolute -top-2 -right-2 bg-white text-gray-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
              {report.upvotes > 99 ? "99+" : report.upvotes}
            </div>
          )}
        </div>
      </div>
    </Marker>
  );
}
