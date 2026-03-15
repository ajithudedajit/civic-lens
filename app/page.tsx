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
import ReportCard from "@/components/report-card";
import { categoryConfig } from "@/lib/config";
import { getAnonymousUserId } from "@/lib/anonymousUser";
import { listenIssues } from "@/lib/issues";

export default function Home() {
  // --- Firebase real-time issues state ---
  const [issues, setIssues] = useState<Report[]>([]);

  // --- Existing states ---
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [hoveredReport, setHoveredReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<ReportCategory[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [isTimeTraveling, setIsTimeTraveling] = useState(false);
  const [timeTravelRange, setTimeTravelRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [currentTimeTravelDate, setCurrentTimeTravelDate] = useState<Date>(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [visibleReportsAtTime, setVisibleReportsAtTime] = useState<Report[]>([]);
  const [playbackInterval, setPlaybackInterval] = useState<NodeJS.Timeout | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  // --- Map center reset ---
  useEffect(() => {
    if (mapCenter) {
      const timer = setTimeout(() => setMapCenter(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [mapCenter]);

  // --- Anonymous user ---
  useEffect(() => {
    setUserId(getAnonymousUserId());
  }, []);

  // --- Cleanup interval ---
  useEffect(() => {
    return () => {
      if (playbackInterval) clearInterval(playbackInterval);
    };
  }, [playbackInterval]);

  // --- Firestore real-time listener ---
  useEffect(() => {
    const unsubscribe = listenIssues(setIssues);
    return () => unsubscribe();
  }, []);

  // --- Fetch reports from API ---
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const url = userId ? `/api/reports?userId=${userId}` : "/api/reports";
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const reportsWithDates = data.map((report: any) => ({
            ...report,
            timestamp: new Date(report.timestamp),
          }));
          setReports(reportsWithDates);

          if (reportsWithDates.length > 0) {
            const timestamps = reportsWithDates.map((r: Report) => r.timestamp.getTime());
            const earliestDate = new Date(Math.min(...timestamps));
            const latestDate = new Date(Math.max(...timestamps));
            setTimeTravelRange({
              start: new Date(earliestDate.getTime() - 7 * 24 * 60 * 60 * 1000),
              end: new Date(latestDate.getTime() + 24 * 60 * 60 * 1000),
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
    if (userId) fetchReports();
  }, [userId]);

  // --- Initialize Database ---
  const initializeDatabase = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reports/seed", { method: "POST" });
      if (response.ok) {
        const url = userId ? `/api/reports?userId=${userId}` : "/api/reports";
        const reportsResponse = await fetch(url);
        if (reportsResponse.ok) {
          const data = await reportsResponse.json();
          const reportsWithDates = data.map((report: any) => ({
            ...report,
            timestamp: new Date(report.timestamp),
          }));
          setReports(reportsWithDates);
          if (reportsWithDates.length > 0) {
            const timestamps = reportsWithDates.map((r: Report) => r.timestamp.getTime());
            const earliestDate = new Date(Math.min(...timestamps));
            const latestDate = new Date(Math.max(...timestamps));
            setTimeTravelRange({
              start: new Date(earliestDate.getTime() - 7 * 24 * 60 * 60 * 1000),
              end: new Date(latestDate.getTime() + 24 * 60 * 60 * 1000),
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

  // --- Filter functions ---
  const toggleCategory = (category: ReportCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
  };

  // --- Time Travel Functions ---
  const getReportsUpToDate = (targetDate: Date) =>
    reports.filter((report) =>
      (report.timestamp instanceof Date ? report.timestamp : new Date(report.timestamp)) <= targetDate
    );

  const toggleTimeTravel = () => {
    if (isTimeTraveling) {
      setIsTimeTraveling(false);
      setIsPlaying(false);
      if (playbackInterval) {
        clearInterval(playbackInterval);
        setPlaybackInterval(null);
      }
      setCurrentTimeTravelDate(new Date());
      setVisibleReportsAtTime([]);
    } else {
      setIsTimeTraveling(true);
      setCurrentTimeTravelDate(timeTravelRange.start);
      setVisibleReportsAtTime(getReportsUpToDate(timeTravelRange.start));
    }
  };

  const playTimeTravel = () => {
    if (playbackInterval) clearInterval(playbackInterval);
    setIsPlaying(true);
    const interval = setInterval(() => {
      setCurrentTimeTravelDate((prevDate) => {
        const nextDate = new Date(prevDate.getTime() + 24 * 60 * 60 * 1000);
        if (nextDate > timeTravelRange.end) {
          setIsPlaying(false);
          clearInterval(interval);
          setPlaybackInterval(null);
          return prevDate;
        }
        setVisibleReportsAtTime(getReportsUpToDate(nextDate));
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
    if (playbackInterval) {
      clearInterval(playbackInterval);
      setPlaybackInterval(null);
      setIsPlaying(false);
    }
    setCurrentTimeTravelDate(date);
    setVisibleReportsAtTime(getReportsUpToDate(date));
  };

  const setTimeTravelStart = (date: Date) => {
    setTimeTravelRange((prev) => ({ ...prev, start: date }));
    if (isTimeTraveling && currentTimeTravelDate < date) jumpToDate(date);
  };

  const setTimeTravelEnd = (date: Date) => {
    setTimeTravelRange((prev) => ({ ...prev, end: date }));
    if (isTimeTraveling && currentTimeTravelDate > date) jumpToDate(date);
  };

  const setTimeTravelSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      pauseTimeTravel();
      setTimeout(() => playTimeTravel(), 100);
    }
  };

  // --- Vote handler ---
  const handleVoteUpdate = (
    reportId: string,
    upvotes: number,
    downvotes: number,
    userVote: "up" | "down" | null
  ) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === reportId ? { ...report, upvotes, downvotes, userVote } : report
      )
    );
    if (selectedReport?.id === reportId) setSelectedReport({ ...selectedReport, upvotes, downvotes, userVote });
    if (isTimeTraveling)
      setVisibleReportsAtTime((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, upvotes, downvotes, userVote } : report
        )
      );
  };

  // --- Go to My Location ---
  const handleGoToMyLocation = async () => {
    if (!navigator.geolocation) return alert("Location not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => setMapCenter([pos.coords.longitude, pos.coords.latitude]),
      (err) => alert("Unable to get location: " + err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // --- Create report ---
  const handleCreateReport = async (reportData: CreateReportData & { coordinates?: [number, number] }) => {
    try {
      setLoading(true);
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reportData, coordinates: reportData.coordinates || [-74.006, 40.7128] }),
      });
      if (response.ok) {
        const newReport = await response.json();
        setReports((prev) => [{ ...newReport, timestamp: new Date(newReport.timestamp) }, ...prev]);
        setShowReportForm(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Filtered reports ---
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        searchQuery === "" ||
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(report.category);
      return matchesSearch && matchesCategory;
    });
  }, [reports, searchQuery, selectedCategories]);

  if (loading)
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">Loading reports...</p>
      </div>
    );

  if (reports.length === 0) return <EmptyState onInitializeDatabase={initializeDatabase} />;

  return (
    <div className={`fixed inset-0 w-full h-full ${isTimeTraveling ? "pb-20" : ""}`}>
      {/* Map */}
      <MapContainer
        reports={isTimeTraveling ? visibleReportsAtTime : filteredReports}
        selectedReport={selectedReport}
        hoveredReport={hoveredReport}
        onReportSelect={setSelectedReport}
        onReportHover={setHoveredReport}
        onVoteUpdate={handleVoteUpdate}
        center={mapCenter}
      />

      {/* Search & Filters */}
      {/* ... existing JSX unchanged ... */}

      {/* --- Real-Time Issues Feed --- */}
      <div className="issues-feed absolute top-24 left-4 right-4 max-h-[80%] overflow-y-auto z-10">
        {issues.length === 0 ? (
          <EmptyState message="No reports yet." />
        ) : (
          issues.map((report, i) => <ReportCard key={i} report={report} />)
        )}
      </div>

      {/* Bottom Controls */}
      {/* ... Add Report, Location, Legend buttons unchanged ... */}

      {/* TimelineControls */}
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
      {showReportForm && <ReportForm onSubmit={handleCreateReport} onClose={() => setShowReportForm(false)} />}
    </div>
  );
}
