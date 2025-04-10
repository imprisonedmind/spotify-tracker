// FILE: components/recent-tracks-display.tsx
"use client";

import { Music } from "lucide-react";
import { TrackCard } from "@/components/track-card";
import type { Track } from "@/app/user/[userId]/types";
import { BaseGroupedDisplay } from "@/components/base-grouped-display"; // Use alias if configured, or relative path

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
      {/* Optional: Add more context if needed */}
      {/* <p className="mt-2 text-sm text-muted-foreground">This user hasn't added tracks recently.</p> */}
    </div>
  );

  // Define a function to get a unique key for each track item
  const getTrackKey = (track: Track): string => {
    // Use track ID and added_at timestamp for a robust key,
    // handling potential duplicate tracks added at different times (though unlikely here)
    return `${track.id}-${track.added_at}`;
  };

  return (
    <BaseGroupedDisplay
      items={tracks}
      // Provide the function to extract the date string for grouping
      getDateString={(track) => track.added_at}
      // Updated renderItem: only receives the track item
      // The logic for 'showTimeAgo' is now implicitly handled by the group header ("Today")
      // or needs to be implemented within TrackCard if relative time is desired for older items.
      // Assuming TrackCard can handle displaying the track without the explicit flag for now.
      renderItem={(track) => <TrackCard track={track} />}
      emptyState={emptyState}
      isLoading={isLoading}
      // Provide the required getItemKey prop
      getItemKey={getTrackKey}
    />
  );
}
