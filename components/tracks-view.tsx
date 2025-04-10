"use client"

import { useState } from "react"
import { ViewToggle } from "@/components/view-toggle"
import { RecentTracksDisplay } from "@/components/recent-tracks-display"
import { RecentListensDisplay } from "@/components/recent-listens-display"
import { RecentLikesDisplay } from "@/components/recent-likes-display"
import { RecentFollowsDisplay } from "@/components/recent-follows-display"
import type { Track, FollowedEntity } from "@/lib/types"

interface TracksViewProps {
  recentTracks: Track[]
  recentListens: Track[]
  recentLikes: Track[]
  recentFollows: FollowedEntity[]
  isLoading?: boolean
}

export function TracksView({
  recentTracks,
  recentListens,
  recentLikes,
  recentFollows,
  isLoading = false,
}: TracksViewProps) {
  const [activeView, setActiveView] = useState<"adds" | "listens" | "likes" | "follows">("adds")

  return (
    <div>
      <ViewToggle onToggle={setActiveView} initialView="adds" isLoading={isLoading} />

      {activeView === "adds" && <RecentTracksDisplay tracks={recentTracks} isLoading={isLoading} />}
      {activeView === "listens" && <RecentListensDisplay tracks={recentListens} isLoading={isLoading} />}
      {activeView === "likes" && <RecentLikesDisplay tracks={recentLikes} isLoading={isLoading} />}
      {activeView === "follows" && <RecentFollowsDisplay entities={recentFollows} isLoading={isLoading} />}
    </div>
  )
}
