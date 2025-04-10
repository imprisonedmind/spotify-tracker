"use client"

import { formatDistanceToNow } from "date-fns"
import { Heart } from "lucide-react"
import { BaseTrackCard } from "@/components/base-track-card"
import type { Track } from "@/lib/types"

interface LikedTrackCardProps {
  track: Track
  showTimeAgo?: boolean
}

export function LikedTrackCard({ track, showTimeAgo = false }: LikedTrackCardProps) {
  const likedAt = track.liked_at ? new Date(track.liked_at) : null
  const timeAgo = showTimeAgo && likedAt ? formatDistanceToNow(likedAt, { addSuffix: true }) : null

  return (
    <BaseTrackCard
      imageUrl={track.album.images[0]?.url}
      imageAlt={track.album.name}
      title={track.name}
      subtitle={track.artists.map((a) => a.name).join(", ")}
      description={`From: ${track.album.name}`}
      externalUrl={track.external_urls.spotify}
      timeAgo={timeAgo}
      badgeIcon={<Heart className="h-3 w-3 text-red-500 fill-red-500" />}
    />
  )
}
