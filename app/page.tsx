"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, X, Info, Plus, MapPin } from "lucide-react";
import { Report, ReportCategory, CreateReportData } from "@/types/report";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MapContainer from "@/components/map/MapContainer";
import TimelineControls from "@/components/timeline/TimelineControls";
import EmptyState from "@/components/ui/EmptyState";
import { ReportForm } from "@/components/report-form";
import { categoryConfig } from "@/lib/config";
import { getAnonymousUserId } from "@/lib/anonymousUser";

export default function Home() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [hoveredReport, setHoveredReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    ReportCategory[]
  >([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  // Time Travel States
  const [isTimeTraveling, setIsTimeTraveling] = useState(false);
  const [timeTravelRange, setTimeTravelRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  });
  const [currentTimeTravelDate, setCurrentTimeTravelDate] = useState<Date>(
    new Date()
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per day
  const [visibleReportsAtTime, setVisibleReportsAtTime] = useState<Report[]>(
    []
  );
  const [playbackInterval, setPlaybackInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Report Form State
  const [showReportForm, setShowReportForm] = useState(false);

  // Anonymous User ID
  const [userId, setUserId] = useState<string>("");

  // Map state for location centering
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  // Clear map center after it's been used
  useEffect(() => {
    if (mapCenter) {
      const timer = setTimeout(() => {
        setMapCenter(null);
      }, 1000); // Clear after 1 second to allow map to center
      return () => clearTimeout(timer);
    }
  }, [mapCenter]);

  // Initialize anonymous user ID
  useEffect(() => {
    setUserId(getAnonymousUserId());
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playbackInterval) {
        clearInterval(playbackInterval);
      }
    };
  }, [playbackInterval]);

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const url = userId ? `/api/reports?userId=${userId}` : "/api/reports";
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          // Convert timestamp strings to Date objects
          const reportsWithDates = data.map((report: any) => ({
            ...report,
            timestamp: new Date(report.timestamp),
          }));
          setReports(reportsWithDates);

          // Update time travel range based on actual report dates
          if (reportsWithDates.length > 0) {
            const timestamps = reportsWithDates.map((r: Report) =>
              r.timestamp.getTime()
            );
            const earliestDate = new Date(Math.min(...timestamps));
            const latestDate = new Date(Math.max(...timestamps));

            // Add some padding to the range
            const paddedStart = new Date(
              earliestDate.getTime() - 7 * 24 * 60 * 60 * 1000
            ); // 7 days before earliest
            const paddedEnd = new Date(
              latestDate.getTime() + 1 * 24 * 60 * 60 * 1000
            ); // 1 day after latest

            setTimeTravelRange({
              start: paddedStart,
              end: paddedEnd,
            });

            console.log("Updated time travel range:", {
              start: paddedStart,
              end: paddedEnd,
            });
            console.log("Report date range:", {
              earliest: earliestDate,
              latest: latestDate,
            });
          }
        } else {
          console.error("Failed to fetch reports");
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchReports();
    }
  }, [userId]);

  // Initialize database collection
  const initializeDatabase = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reports/seed", { method: "POST" });
      if (response.ok) {
        // Refetch reports after initialization
        const url = userId ? `/api/reports?userId=${userId}` : "/api/reports";
        const reportsResponse = await fetch(url);
        if (reportsResponse.ok) {
          const data = await reportsResponse.json();
          // Convert timestamp strings to Date objects
          const reportsWithDates = data.map((report: any) => ({
            ...report,
            timestamp: new Date(report.timestamp),
          }));
          setReports(reportsWithDates);

          // Update time travel range based on actual report dates
          if (reportsWithDates.length > 0) {
            const timestamps = reportsWithDates.map((r: Report) =>
              r.timestamp.getTime()
            );
            const earliestDate = new Date(Math.min(...timestamps));
            const latestDate = new Date(Math.max(...timestamps));

            // Add some padding to the range
            const paddedStart = new Date(
              earliestDate.getTime() - 7 * 24 * 60 * 60 * 1000
            ); // 7 days before earliest
            const paddedEnd = new Date(
              latestDate.getTime() + 1 * 24 * 60 * 60 * 1000
            ); // 1 day after latest

            setTimeTravelRange({
              start: paddedStart,
              end: paddedEnd,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: ReportCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
  };

  // Time Travel Functions
  const getReportsUpToDate = (targetDate: Date) => {
    const filtered = reports.filter((report) => {
      const reportDate =
        typeof report.timestamp === "string"
          ? new Date(report.timestamp)
          : report.timestamp;
      return reportDate <= targetDate;
    });
    console.log(
      `Time travel: ${
        filtered.length
      } reports up to ${targetDate.toLocaleDateString()}`
    );
    return filtered;
  };

  const toggleTimeTravel = () => {
    if (isTimeTraveling) {
      // Stop time travel
      setIsTimeTraveling(false);
      setIsPlaying(false);
      if (playbackInterval) {
        clearInterval(playbackInterval);
        setPlaybackInterval(null);
      }
      setCurrentTimeTravelDate(new Date());
      setVisibleReportsAtTime([]);
      console.log("Time travel stopped");
    } else {
      // Start time travel
      console.log("Starting time travel...");
      console.log("Time travel range:", timeTravelRange);
      setIsTimeTraveling(true);
      setCurrentTimeTravelDate(timeTravelRange.start);
      const initialReports = getReportsUpToDate(timeTravelRange.start);
      console.log("Initial reports for time travel:", initialReports.length);
      setVisibleReportsAtTime(initialReports);
    }
  };

  const playTimeTravel = () => {
    if (playbackInterval) {
      clearInterval(playbackInterval);
    }

    setIsPlaying(true);
    const interval = setInterval(() => {
      setCurrentTimeTravelDate((prevDate) => {
        const nextDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000); // Add 1 day

        if (nextDate > timeTravelRange.end) {
          setIsPlaying(false);
          clearInterval(interval);
          setPlaybackInterval(null);
          return prevDate;
        }

        // Update visible reports for the new date
        const reportsAtDate = getReportsUpToDate(nextDate);
        setVisibleReportsAtTime(reportsAtDate);
        return nextDate;
      });
    }, playbackSpeed);

    setPlaybackInterval(interval);
  };

  const pauseTimeTravel = () => {
    setIsPlaying(false);
    if (playbackInterval) {
      clearInterval(playbackInterval);
      setPlaybackInterval(null);
    }
  };

  const jumpToDate = (date: Date) => {
    // Stop any playing animation
    if (playbackInterval) {
      clearInterval(playbackInterval);
      setPlaybackInterval(null);
      setIsPlaying(false);
    }

    setCurrentTimeTravelDate(date);
    const reportsAtDate = getReportsUpToDate(date);
    setVisibleReportsAtTime(reportsAtDate);
    console.log(
      `Jumped to ${date.toLocaleDateString()}, showing ${
        reportsAtDate.length
      } reports`
    );
  };

  const setTimeTravelStart = (date: Date) => {
    setTimeTravelRange((prev) => ({ ...prev, start: date }));
    if (isTimeTraveling && currentTimeTravelDate < date) {
      jumpToDate(date);
    }
  };

  const setTimeTravelEnd = (date: Date) => {
    setTimeTravelRange((prev) => ({ ...prev, end: date }));
    if (isTimeTraveling && currentTimeTravelDate > date) {
      jumpToDate(date);
    }
  };

  const setTimeTravelSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    // If currently playing, restart with new speed
    if (isPlaying) {
      pauseTimeTravel();
      setTimeout(() => playTimeTravel(), 100);
    }
  };

  // Vote Update Handler
  const handleVoteUpdate = (
    reportId: string,
    upvotes: number,
    downvotes: number,
    userVote: "up" | "down" | null
  ) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              upvotes,
              downvotes,
              userVote,
            }
          : report
      )
    );

    // Also update the selected report if it's the same one
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({
        ...selectedReport,
        upvotes,
        downvotes,
        userVote,
      });
    }

    // Update visible reports for time travel if active
    if (isTimeTraveling) {
      setVisibleReportsAtTime((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId
            ? {
                ...report,
                upvotes,
                downvotes,
                userVote,
              }
            : report
        )
      );
    }
  };

  // Go to user's location
  const handleGoToMyLocation = async () => {
    try {
      if (!navigator.geolocation) {
        alert("Location services are not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          setMapCenter(coords);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert(
                "Location access denied. Please enable location access in your browser settings."
              );
              break;
            case error.POSITION_UNAVAILABLE:
              alert("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              alert("Location request timed out. Please try again.");
              break;
            default:
              alert("An unknown error occurred while retrieving location.");
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } catch (error) {
      console.error("Error getting location:", error);
      alert("Unable to get your location");
    }
  };

  // Create Report Function
  const handleCreateReport = async (
    reportData: CreateReportData & { coordinates?: [number, number] }
  ) => {
    try {
      setLoading(true);
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...reportData,
          coordinates: reportData.coordinates || [-74.006, 40.7128], // Use selected coordinates or default
        }),
      });

      if (response.ok) {
        const newReport = await response.json();
        // Convert timestamp to Date object
        const reportWithDate = {
          ...newReport,
          timestamp: new Date(newReport.timestamp),
        };
        setReports((prev) => [reportWithDate, ...prev]);
        setShowReportForm(false);
      } else {
        console.error("Failed to create report");
      }
    } catch (error) {
      console.error("Error creating report:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter reports based on search and categories
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        searchQuery === "" ||
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(report.category);

      return matchesSearch && matchesCategory;
    });
  }, [reports, searchQuery, selectedCategories]);

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-gray-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading reports...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no reports exist
  if (reports.length === 0) {
    return <EmptyState onInitializeDatabase={initializeDatabase} />;
  }

  return (
    <div
      className={`fixed inset-0 w-full h-full ${
        isTimeTraveling ? "pb-20" : ""
      }`}
    >
      {/* Map Container */}
      <MapContainer
        reports={isTimeTraveling ? visibleReportsAtTime : filteredReports}
        selectedReport={selectedReport}
        hoveredReport={hoveredReport}
        onReportSelect={setSelectedReport}
        onReportHover={setHoveredReport}
        onVoteUpdate={handleVoteUpdate}
        center={mapCenter}
      />

      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search issues by title, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-12 py-3 border-0 focus:ring-2 focus:ring-blue-500 rounded-lg"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Filter by Category
                </h4>
                {(selectedCategories.length > 0 || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.entries(categoryConfig).map(([category, config]) => {
                  const IconComponent = config.icon;
                  const isSelected = selectedCategories.includes(
                    category as ReportCategory
                  );
                  const count = reports.filter(
                    (r: Report) => r.category === category
                  ).length;

                  return (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category as ReportCategory)}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: config.color }}
                      >
                        <IconComponent className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="text-xs font-medium flex-1 text-left">
                        {config.label}
                      </span>
                      <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                Showing {filteredReports.length} of {reports.length} issues
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Right Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
        {/* Add Report Button */}
        <Button
          onClick={() => setShowReportForm(true)}
          className="h-12 w-12 p-0 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-5 w-5" />
        </Button>

        {/* Go to My Location Button */}
        <Button
          onClick={handleGoToMyLocation}
          className="h-12 w-12 p-0 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 shadow-xl border border-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
          variant="ghost"
          title="Go to my location"
        >
          <MapPin className="h-5 w-5" />
        </Button>

        {/* Legend Toggle */}
        {!showLegend ? (
          <Button
            onClick={() => setShowLegend(true)}
            className="h-12 w-12 p-0 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 shadow-xl border border-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
            variant="ghost"
          >
            <Info className="h-5 w-5" />
          </Button>
        ) : (
          <div className="bg-white rounded-lg shadow-xl max-w-xs mb-2">
            <div className="flex items-center justify-between p-4 pb-2">
              <h3 className="font-bold text-gray-900">Legend</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLegend(false)}
                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-4 pb-4">
              <div className="space-y-2">
                {Object.entries(categoryConfig).map(([category, config]) => {
                  const IconComponent = config.icon;
                  const totalCount = reports.filter(
                    (r: Report) => r.category === category
                  ).length;

                  return (
                    <div key={category} className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: config.color }}
                      >
                        <IconComponent className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700 flex-1">
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {totalCount}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Controls */}
      <TimelineControls
        isActive={isTimeTraveling}
        isPlaying={isPlaying}
        currentDate={currentTimeTravelDate}
        startDate={timeTravelRange.start}
        endDate={timeTravelRange.end}
        playbackSpeed={playbackSpeed}
        onToggleActive={toggleTimeTravel}
        onPlay={playTimeTravel}
        onPause={pauseTimeTravel}
        onJumpToDate={jumpToDate}
        onSetStartDate={setTimeTravelStart}
        onSetEndDate={setTimeTravelEnd}
        onSetPlaybackSpeed={setTimeTravelSpeed}
      />

      {/* Report Form Modal */}
      {showReportForm && (
        <ReportForm
          onSubmit={handleCreateReport}
          onClose={() => setShowReportForm(false)}
        />
      )}
    </div>
  );
}
