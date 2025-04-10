// components/user/RecentTracksDisplay.tsx
"use client"

// This component needs to be a client component because BaseGroupedDisplay uses hooks (useState, useEffect).

import {Music} from "lucide-react"
import {BaseGroupedDisplay} from "@/components/base-grouped-display";
import {Track} from "@/lib/types";
import {TrackCard} from "@/components/track-card";

interface RecentTracksDisplayProps {
  tracks: Track[]
}

/**
 * Renders the list of recently added tracks, grouped by day.
 */
export function RecentTracksDisplay({tracks}: RecentTracksDisplayProps) {
  const emptyState = (
      <div
          className="text-center py-10 px-4 bg-white/90 dark:bg-background/90 backdrop-blur-sm rounded-2xl border border-lavender-200 dark:border-lavender-800/40">
        <div className="flex justify-center mb-3">
          <Music className="h-8 w-8 text-lavender-400 dark:text-lavender-600"/>
        </div>
        <p className="text-lg font-medium text-foreground">No Recent Playlist Additions</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
          This user hasn't added any tracks to their public, owned playlists recently, or we couldn't find any.
        </p>
      </div>
  )

  return (
      <BaseGroupedDisplay<Track>
          items={tracks}
          getDateString={(track) => track.added_at} // Use added_at for grouping
          renderItem={(track, showTimeAgo) => <TrackCard track={track} showTimeAgo={showTimeAgo}
                                                         context="playlistAdd"/>} // Pass context
          emptyState={emptyState}
          isLoading={false} // Data is pre-fetched by the server component
          sectionTitle="Recently Added Tracks"
      />
  )
}