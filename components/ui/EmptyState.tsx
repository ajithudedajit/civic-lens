"use client";

import { MapPin, Plus, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onInitializeDatabase?: () => void;
}

export default function EmptyState({ onInitializeDatabase }: EmptyStateProps) {
  return (
    <div className="fixed inset-0 w-full h-full bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Reports Yet</h2>
          <p className="text-gray-400 mb-6">
            Start by setting up Qdrant to store and manage community reports.
          </p>
        </div>

        <div className="space-y-4">
          {onInitializeDatabase && (
            <Button
              onClick={onInitializeDatabase}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Database className="h-4 w-4 mr-2" />
              Initialize Database
            </Button>
          )}

          <div className="text-sm text-gray-500">
            <p>To get started:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-left">
              <li>
                Run{" "}
                <code className="bg-gray-800 px-2 py-1 rounded text-xs">
                  npm run qdrant:compose
                </code>
              </li>
              <li>Initialize the database collection</li>
              <li>Start adding community reports</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
