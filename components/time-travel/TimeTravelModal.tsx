"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimeTravelModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTimeTraveling: boolean;
  timeTravelRange: { start: Date; end: Date };
  currentTimeTravelDate: Date;
  visibleReportsCount: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onStartTimeTravel: () => void;
  onStopTimeTravel: () => void;
  onPlayTimeTravel: () => void;
  onPauseTimeTravel: () => void;
  onJumpToDate: (date: Date) => void;
  onSetTimeTravelRange: (range: { start: Date; end: Date }) => void;
  onSetPlaybackSpeed: (speed: number) => void;
}

export default function TimeTravelModal({
  isOpen,
  onClose,
  isTimeTraveling,
  timeTravelRange,
  currentTimeTravelDate,
  visibleReportsCount,
  isPlaying,
  playbackSpeed,
  onStartTimeTravel,
  onStopTimeTravel,
  onPlayTimeTravel,
  onPauseTimeTravel,
  onJumpToDate,
  onSetTimeTravelRange,
  onSetPlaybackSpeed,
}: TimeTravelModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    if (isTimeTraveling) onStopTimeTravel();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-300 border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Time Travel</h2>
            {isTimeTraveling && (
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-600 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm text-white">Active</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Date Range Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                value={timeTravelRange.start.toISOString().split("T")[0]}
                onChange={(e) =>
                  onSetTimeTravelRange({
                    ...timeTravelRange,
                    start: new Date(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                End Date
              </label>
              <input
                type="date"
                value={timeTravelRange.end.toISOString().split("T")[0]}
                onChange={(e) =>
                  onSetTimeTravelRange({
                    ...timeTravelRange,
                    end: new Date(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Current Date Display */}
          {isTimeTraveling && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Currently viewing</div>
                  <div className="text-lg font-bold text-white">
                    {currentTimeTravelDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Reports visible</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {visibleReportsCount}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Scrubber */}
          {isTimeTraveling && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 min-w-fit">
                  {timeTravelRange.start.toLocaleDateString()}
                </span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min={timeTravelRange.start.getTime()}
                    max={timeTravelRange.end.getTime()}
                    value={currentTimeTravelDate.getTime()}
                    onChange={(e) =>
                      onJumpToDate(new Date(parseInt(e.target.value)))
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${
                        ((currentTimeTravelDate.getTime() -
                          timeTravelRange.start.getTime()) /
                          (timeTravelRange.end.getTime() -
                            timeTravelRange.start.getTime())) *
                        100
                      }%, #374151 ${
                        ((currentTimeTravelDate.getTime() -
                          timeTravelRange.start.getTime()) /
                          (timeTravelRange.end.getTime() -
                            timeTravelRange.start.getTime())) *
                        100
                      }%, #374151 100%)`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-400 min-w-fit">
                  {timeTravelRange.end.toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          {/* Playback Controls */}
          {isTimeTraveling && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onJumpToDate(timeTravelRange.start)}
                className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newDate = new Date(
                    currentTimeTravelDate.getTime() - 7 * 24 * 60 * 60 * 1000
                  );
                  if (newDate >= timeTravelRange.start) onJumpToDate(newDate);
                }}
                className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
              >
                <Rewind className="h-4 w-4" />
              </Button>

              <Button
                onClick={isPlaying ? onPauseTimeTravel : onPlayTimeTravel}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newDate = new Date(
                    currentTimeTravelDate.getTime() + 7 * 24 * 60 * 60 * 1000
                  );
                  if (newDate <= timeTravelRange.end) onJumpToDate(newDate);
                }}
                className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
              >
                <FastForward className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onJumpToDate(timeTravelRange.end)}
                className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Speed Control */}
          {isTimeTraveling && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Playback Speed:</span>
              <div className="flex gap-2">
                {[
                  { label: "0.5x", value: 2000 },
                  { label: "1x", value: 1000 },
                  { label: "2x", value: 500 },
                  { label: "5x", value: 200 },
                ].map((speed) => (
                  <Button
                    key={speed.label}
                    variant={
                      playbackSpeed === speed.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => onSetPlaybackSpeed(speed.value)}
                    className={
                      playbackSpeed === speed.value
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
                    }
                  >
                    {speed.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            {!isTimeTraveling ? (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onStartTimeTravel}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Start Time Travel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={onStopTimeTravel}
                  className="flex-1 border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
                >
                  Exit Time Travel
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1 bg-gray-700 hover:bg-gray-600"
                >
                  Minimize Panel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
