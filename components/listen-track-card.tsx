"use client"

import { formatDistanceToNow } from "date-fns"
import { BaseTrackCard } from "@/components/base-track-card"
import type { Track } from "@/lib/types"

interface ListenTrackCardProps {
  track: Track
  showTimeAgo?: boolean
}

export function ListenTrackCard({ track, showTimeAgo = false }: ListenTrackCardProps) {
  const playedAt = track.played_at ? new Date(track.played_at) : null
  const timeAgo = showTimeAgo && playedAt ? formatDistanceToNow(playedAt, { addSuffix: true }) : null

  return (
    <BaseTrackCard
      imageUrl={track.album.images[0]?.url}
      imageAlt={track.album.name}
      title={track.name}
      subtitle={track.artists.map((a) => a.name).join(", ")}
      description={`From: ${track.album.name}`}
      externalUrl={track.external_urls.spotify}
      timeAgo={timeAgo}
    />
  )
}
