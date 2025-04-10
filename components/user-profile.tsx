"use client"

import Image from "next/image"
import { Users, ListMusic, Music, ExternalLink } from "lucide-react"
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton"
import type { UserProfile } from "@/lib/types"

interface UserProfileProps {
  profile: UserProfile
  isLoading?: boolean
}

export function UserProfileDisplay({ profile, isLoading = false }: UserProfileProps) {
  if (isLoading) {
    return <ProfileSkeleton />
  }

  return (
    <div className="bg-white/90 dark:bg-background/90 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-lavender-200 dark:border-lavender-800/40 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-lavender-200 dark:border-lavender-700/40 shadow-sm">
            <Image
              src={profile.images?.[0]?.url || "/placeholder.svg?height=80&width=80"}
              alt={profile.display_name || profile.id}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold truncate">{profile.display_name || profile.id}</h1>

          <div className="flex flex-wrap gap-3 mt-1">
            <div className="inline-flex items-center gap-1">
              <Users className="h-4 w-4 text-lavender-500 dark:text-lavender-400" />
              <span className="text-sm text-muted-foreground">
                {profile.stats?.followerCount.toLocaleString() || 0}
              </span>
            </div>
            <div className="inline-flex items-center gap-1">
              <ListMusic className="h-4 w-4 text-peach-500 dark:text-peach-400" />
              <span className="text-sm text-muted-foreground">{profile.stats?.totalPlaylists || 0}</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Music className="h-4 w-4 text-mint-500 dark:text-mint-400" />
              <span className="text-sm text-muted-foreground">{profile.stats?.totalTracks?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

        <a
          href={profile.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-lavender-100 text-lavender-700 hover:bg-lavender-200 dark:bg-lavender-800/40 dark:text-lavender-300 dark:hover:bg-lavender-700/40 transition-colors text-xs"
        >
          View Profile
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </div>
    </div>
  )
}
