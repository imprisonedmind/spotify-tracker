"use client"

import { formatDistanceToNow } from "date-fns"
import { Music, Users } from "lucide-react"
import { BaseTrackCard } from "@/components/base-track-card"
import type { FollowedEntity } from "@/lib/types"

interface FollowedEntityCardProps {
  entity: FollowedEntity
  showTimeAgo?: boolean
}

export function FollowedEntityCard({ entity, showTimeAgo = false }: FollowedEntityCardProps) {
  const followedAt = new Date(entity.followed_at)
  const timeAgo = showTimeAgo ? formatDistanceToNow(followedAt, { addSuffix: true }) : null

  let subtitle = ""
  if (entity.type === "artist") {
    subtitle = entity.genres?.slice(0, 2).join(", ") || "Artist"
    if (entity.followers) {
      subtitle += ` • ${entity.followers.total.toLocaleString()} followers`
    }
  } else {
    subtitle = `By ${entity.owner?.display_name || "Unknown"}`
    if (entity.followers) {
      subtitle += ` • ${entity.followers.total.toLocaleString()} followers`
    }
  }

  return (
    <BaseTrackCard
      imageUrl={entity.images?.[0]?.url}
      imageAlt={entity.name}
      title={entity.name}
      subtitle={subtitle}
      description={entity.type === "playlist" && entity.description ? entity.description : undefined}
      externalUrl={entity.external_urls.spotify}
      timeAgo={timeAgo}
      badgeIcon={
        entity.type === "artist" ? (
          <Users className="h-3 w-3 text-lavender-500" />
        ) : (
          <Music className="h-3 w-3 text-peach-500" />
        )
      }
    />
  )
}
