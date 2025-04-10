"use client"

import { Music } from "lucide-react"
import { BaseGroupedDisplay } from "@/components/base-grouped-display"
import { TrackCard } from "@/components/track-card"
import type { Track } from "@/lib/types"

interface RecentTracksDisplayProps {
  tracks: Track[]
  isLoading?: boolean
}

export function RecentTracksDisplay({ tracks, isLoading = false }: RecentTracksDisplayProps) {
  const emptyState = (
    <div className="text-center py-8 bg-white/90 dark:bg-background/90 backdrop-blur-sm rounded-2xl border border-lavender-200 dark:border-lavender-800/40">
      <div className="flex justify-center mb-2">
        <Music className="h-6 w-6 text-lavender-400" />
      </div>
      <p className="text-muted-foreground">No recent tracks found for this friend.</p>
      <p className="text-sm text-muted-foreground mt-2">Try checking another username!</p>
    </div>
  )

  return (
    <BaseGroupedDisplay
      items={tracks}
      getDateString={(track) => track.added_at}
      renderItem={(track, showTimeAgo) => <TrackCard track={track} showTimeAgo={showTimeAgo} />}
      emptyState={emptyState}
      isLoading={isLoading}
    />
  )
}
