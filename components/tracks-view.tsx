// FILE: components/tracks-view.tsx
"use client";

import { useState } from "react";
import { ViewToggle } from "@/components/view-toggle";
import { RecentTracksDisplay } from "@/components/recent-tracks-display";
import type { Track } from "@/app/user/[userId]/types"; // Use alias if configured, or relative path

interface TracksViewProps {
  recentTracks: Track[];
  // Pass isLoading down if the parent component manages loading state
  // that affects this view specifically (beyond Suspense boundaries).
  // Often, Suspense handles this for the initial load.
  isLoading?: boolean;
}

export function TracksView({
  recentTracks,
  isLoading = false, // Default to false, Suspense handles initial load typically
}: TracksViewProps) {
  // Currently, only "adds" view is implemented.
  // If other views were added (e.g., "top tracks", "history"), this state would be used.
  const [activeView, setActiveView] = useState<"adds">("adds");

  return (
    <div className="mt-6">
      {/* ViewToggle might be redundant if only one view exists, consider removing if adds is the only option */}
      {/*
      <ViewToggle
        onToggle={setActiveView}
        initialView="adds"
        isLoading={isLoading} // Pass loading state if ViewToggle needs it
      />
      */}

      {/* Conditional rendering based on activeView */}
      {/* Since only 'adds' exists currently, this condition is always true */}
      {activeView === "adds" && (
        <RecentTracksDisplay tracks={recentTracks} isLoading={isLoading} />
      )}

      {/* Placeholder for other potential views */}
      {/* {activeView === 'history' && <ListeningHistoryDisplay userId={...} />} */}
    </div>
  );
}
