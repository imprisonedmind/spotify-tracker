"use client"

import { formatDistanceToNow } from "date-fns"
import { BaseTrackCard } from "@/components/base-track-card"
import type { Track } from "@/lib/types"

interface TrackCardProps {
  track: Track
  showTimeAgo?: boolean
}

export function TrackCard({ track, showTimeAgo = false }: TrackCardProps) {
  const addedAt = new Date(track.added_at || "")
  const timeAgo = showTimeAgo && track.added_at ? formatDistanceToNow(addedAt, { addSuffix: true }) : null

  return (
    <BaseTrackCard
      imageUrl={track.album.images[0]?.url}
      imageAlt={track.album.name}
      title={track.name}
      subtitle={track.artists.map((a) => a.name).join(", ")}
      description={track.playlist ? `Added to: ${track.playlist.name}` : undefined}
      externalUrl={track.external_urls.spotify}
      timeAgo={timeAgo}
    />
  )
}
