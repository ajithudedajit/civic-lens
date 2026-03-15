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
import { ReportCard } from "@/components/report-card";
import { categoryConfig } from "@/lib/config";
import { getAnonymousUserId } from "@/lib/anonymousUser";
import { listenIssues } from "@/lib/issues";

export default function Home() {
  const [issues, setIssues] = useState<Report[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [hoveredReport, setHoveredReport] = useState<Report | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  // Time travel states
  const [isTimeTraveling, setIsTimeTraveling] = useState(false);
  const [visibleReportsAtTime, setVisibleReportsAtTime] = useState<Report[]>([]);
  const [currentTimeTravelDate, setCurrentTimeTravelDate] = useState(new Date());
  const [timeTravelRange, setTimeTravelRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [playbackInterval, setPlaybackInterval] = useState<NodeJS.Timeout | null>(null);

  // --- Initialize user ---
  useEffect(() => {
    setUserId(getAnonymousUserId());
  }, []);

  // --- Firestore real-time listener ---
  useEffect(() => {
    const unsubscribe = listenIssues(setIssues);
    return () => unsubscribe();
  }, []);

  // --- Fetch reports ---
  useEffect(() => {
    const fetchReports = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const url = `/api/reports?userId=${userId}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        const reportsWithDates = data.map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) }));
        setReports(reportsWithDates);
        if (reportsWithDates.length) {
          const coords = reportsWithDates[0].coordinates || [-74.006, 40.7128];
          setMapCenter(coords as [number, number]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [userId]);

  // --- Initialize database ---
  const initializeDatabase = async () => {
    try {
      setLoading(true);
      await fetch("/api/reports/seed", { method: "POST" });
      const res = await fetch(userId ? `/api/reports?userId=${userId}` : "/api/reports");
      const data = await res.json();
      const reportsWithDates = data.map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) }));
      setReports(reportsWithDates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        setReports(prev => [{ ...newReport, timestamp: new Date(newReport.timestamp) }, ...prev]);
        setShowReportForm(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Filtered reports ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<ReportCategory[]>([]);
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch =
        searchQuery === "" ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(r.category);
      return matchesSearch && matchesCategory;
    });
  }, [reports, searchQuery, selectedCategories]);

  // --- Voting ---
  const handleVoteUpdate = (reportId: string, upvotes: number, downvotes: number, userVote: "up" | "down" | null) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, upvotes, downvotes, userVote } : r));
  };

  // --- Map center reset ---
  useEffect(() => {
    if (mapCenter) {
      const timer = setTimeout(() => setMapCenter(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [mapCenter]);

  // --- Loading / Empty states ---
  if (loading)
    return (
      <div className="text-center mt-10 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        Loading reports...
      </div>
    );

  if (reports.length === 0) return <EmptyState onInitializeDatabase={initializeDatabase} />;

  return (
    <div className="fixed inset-0 w-full h-full">
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

      {/* Real-Time Issues Feed */}
      <div className="absolute top-24 left-4 right-4 max-h-[80%] overflow-y-auto z-10">
        {issues.length === 0 ? (
          <EmptyState message="No reports yet." />
        ) : (
          issues.map((r, i) => <ReportCard key={i} report={r} />)
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
        onToggleActive={() => setIsTimeTraveling(prev => !prev)}
        onPlay={() => {}}
        onPause={() => {}}
        onJumpToDate={() => {}}
        onSetStartDate={() => {}}
        onSetEndDate={() => {}}
        onSetPlaybackSpeed={() => {}}
      />

      {/* Floating Buttons */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
        <Button
          onClick={() => setShowReportForm(true)}
          className="h-12 w-12 p-0 shadow-xl bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center"
        >
          <Plus className="h-5 w-5" />
        </Button>

        <Button
          onClick={() => navigator.geolocation.getCurrentPosition(pos => setMapCenter([pos.coords.longitude, pos.coords.latitude]))}
          className="h-12 w-12 p-0 bg-white hover:bg-gray-50 text-gray-600 shadow-xl border border-gray-200 rounded-full flex items-center justify-center"
        >
          <MapPin className="h-5 w-5" />
        </Button>
      </div>

      {/* Report Form Modal */}
      {showReportForm && <ReportForm onSubmit={handleCreateReport} onClose={() => setShowReportForm(false)} />}
    </div>
  );
}
