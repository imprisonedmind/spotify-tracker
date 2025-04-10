// FILE: components/recent-tracks-display.tsx
"use client";

import { Music } from "lucide-react";
import { TrackCard } from "@/components/track-card"; // Import the specific card
import type { Track } from "@/app/user/[userId]/types";
import { BaseGroupedDisplay } from "@/components/base-grouped-display"; // Adjust path as needed

interface RecentTracksDisplayProps {
  tracks: Track[];
  isLoading?: boolean;
}

export function RecentTracksDisplay({
  tracks,
  isLoading = false,
}: RecentTracksDisplayProps) {
  const emptyState = (
    <div className="my-4 rounded-2xl border border-lavender-200/80 bg-white/90 p-8 text-center backdrop-blur-sm dark:border-lavender-800/40 dark:bg-background/90">
      <div className="mb-2 flex justify-center">
        <Music className="h-6 w-6 text-lavender-400" />
      </div>
      <p className="text-muted-foreground">No recent tracks found.</p>
    </div>
  );

  // Define a stable key generation function
  const getTrackKey = (track: Track): string => {
    // Combine track ID and added_at for uniqueness, fallback if needed
    return `${track.id || "no-id"}-${track.added_at || "no-date"}`;
  };

  return (
    <BaseGroupedDisplay
      items={tracks}
      getDateString={(track) => track.added_at}
      // Updated renderItem: receives 'isToday' boolean
      renderItem={(track, isToday) => (
        // Pass the 'isToday' flag to TrackCard as 'showTimeAgo'
        <TrackCard track={track} showTimeAgo={isToday} />
      )}
      emptyState={emptyState}
      isLoading={isLoading}
      getItemKey={getTrackKey}
    />
  );
}
