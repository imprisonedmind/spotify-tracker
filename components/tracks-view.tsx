"use client";

import { useState } from "react";
import { ViewToggle } from "@/components/view-toggle";
import { RecentTracksDisplay } from "@/components/recent-tracks-display";
import type { Track } from "@/lib/types";

interface TracksViewProps {
  recentTracks: Track[];
  isLoading?: boolean;
}

export function TracksView({
  recentTracks,
  isLoading = false,
}: TracksViewProps) {
  const [activeView, setActiveView] = useState<"adds">("adds");

  return (
    <div>
      <ViewToggle
        onToggle={setActiveView}
        initialView="adds"
        isLoading={isLoading}
      />

      {activeView === "adds" && (
        <RecentTracksDisplay tracks={recentTracks} isLoading={isLoading} />
      )}
    </div>
  );
}
