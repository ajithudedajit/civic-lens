"use client";

import { Home, Map, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: "feed" | "map" | "profile";
  onTabChange: (tab: "feed" | "map" | "profile") => void;
  onCreateReport: () => void;
}

export function Navigation({
  activeTab,
  onTabChange,
  onCreateReport,
}: NavigationProps) {
  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={onCreateReport}
        size="icon"
        className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex items-center justify-around h-16 px-4">
          <button
            onClick={() => onTabChange("feed")}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-colors",
              activeTab === "feed"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Feed</span>
          </button>

          <button
            onClick={() => onTabChange("map")}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-colors",
              activeTab === "map"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Map className="h-5 w-5" />
            <span className="text-xs font-medium">Map</span>
          </button>

          <button
            onClick={() => onTabChange("profile")}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-colors",
              activeTab === "profile"
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
}
