"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Calendar,
  Clock,
  StepBack,
  StepForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimelineControlsProps {
  isActive: boolean;
  isPlaying: boolean;
  currentDate: Date;
  startDate: Date;
  endDate: Date;
  playbackSpeed: number;
  onToggleActive: () => void;
  onPlay: () => void;
  onPause: () => void;
  onJumpToDate: (date: Date) => void;
  onSetStartDate: (date: Date) => void;
  onSetEndDate: (date: Date) => void;
  onSetPlaybackSpeed: (speed: number) => void;
}

export default function TimelineControls({
  isActive,
  isPlaying,
  currentDate,
  startDate,
  endDate,
  playbackSpeed,
  onToggleActive,
  onPlay,
  onPause,
  onJumpToDate,
  onSetStartDate,
  onSetEndDate,
  onSetPlaybackSpeed,
}: TimelineControlsProps) {
  const [sliderValue, setSliderValue] = useState(0);
  const [showDatePickers, setShowDatePickers] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate slider position based on current date
  useEffect(() => {
    if (isActive) {
      const totalDuration = endDate.getTime() - startDate.getTime();
      const currentProgress = currentDate.getTime() - startDate.getTime();
      const percentage = Math.max(
        0,
        Math.min(100, (currentProgress / totalDuration) * 100)
      );
      setSliderValue(percentage);
    }
  }, [currentDate, startDate, endDate, isActive]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = parseFloat(e.target.value);
    setSliderValue(percentage);

    const totalDuration = endDate.getTime() - startDate.getTime();
    const targetTime = startDate.getTime() + (totalDuration * percentage) / 100;
    const targetDate = new Date(targetTime);

    onJumpToDate(targetDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onSetStartDate(newDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onSetEndDate(newDate);
  };

  const adjustSpeed = (factor: number) => {
    const newSpeed = Math.max(100, Math.min(5000, playbackSpeed * factor));
    onSetPlaybackSpeed(newSpeed);
  };

  const getSpeedLabel = () => {
    if (playbackSpeed <= 200) return "4x";
    if (playbackSpeed <= 500) return "2x";
    if (playbackSpeed <= 1000) return "1x";
    if (playbackSpeed <= 2000) return "0.5x";
    return "0.25x";
  };

  if (!isActive) {
    return (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          onClick={onToggleActive}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25"
        >
          <Clock className="h-5 w-5 mr-3" />
          <span className="font-semibold">Time Travel</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2">
        {/* Main Player Interface */}
        <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10 bg-gradient-to-t from-black/90 via-gray-900/90 to-gray-900/90">
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${sliderValue}%, rgba(255,255,255,0.2) ${sliderValue}%, rgba(255,255,255,0.2) 100%)`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{formatDate(startDate)}</span>
              <span>{formatDate(currentDate)}</span>
              <span>{formatDate(endDate)}</span>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Date Range Controls */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowDatePickers(!showDatePickers)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Range
              </Button>
            </div>

            {/* Main Playback Controls */}
            <div className="flex items-center gap-4">
              <div className="flex gap-1 items-center">
                <Button
                  onClick={() => adjustSpeed(2)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white w-6 h-6 p-0"
                >
                  <StepBack className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => onJumpToDate(startDate)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-white/10 w-10 h-10 rounded-full"
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
              </div>

              <Button
                onClick={isPlaying ? onPause : onPlay}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-9 h-9 rounded-full shadow-lg transition-all duration-200 hover:scale-105 p-2"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <div className="flex gap-1 items-center">
                <Button
                  onClick={() => onJumpToDate(endDate)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-white/10 w-10 h-10 rounded-full"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>

                <Button
                  onClick={() => adjustSpeed(0.5)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white w-6 h-6 p-0"
                >
                  <StepForward className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Speed and Exit Controls */}
            <div className="flex items-center gap-1 -ml-6">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-1 py-1">
                <span className="text-xs text-white font-medium min-w-[2.5rem] text-center">
                  {getSpeedLabel()}
                </span>
              </div>

              <Button
                onClick={onToggleActive}
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                Exit
              </Button>
            </div>
          </div>

          {/* Date Pickers (Collapsible) */}
          {showDatePickers && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center">
                  <label className="text-xs text-gray-400 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formatDateForInput(startDate)}
                    onChange={handleStartDateChange}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <label className="text-xs text-gray-400 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formatDateForInput(endDate)}
                    onChange={handleEndDateChange}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.6);
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
      `}</style>
    </div>
  );
}
