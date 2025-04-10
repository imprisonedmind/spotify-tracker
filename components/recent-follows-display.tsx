"use client"

import { Users } from "lucide-react"
import { BaseGroupedDisplay } from "@/components/base-grouped-display"
import { FollowedEntityCard } from "@/components/followed-entity-card"
import type { FollowedEntity } from "@/lib/types"

interface RecentFollowsDisplayProps {
  entities: FollowedEntity[]
  isLoading?: boolean
}

export function RecentFollowsDisplay({ entities, isLoading = false }: RecentFollowsDisplayProps) {
  const emptyState = (
    <div className="text-center py-8 bg-white/90 dark:bg-background/90 backdrop-blur-sm rounded-2xl border border-lavender-200 dark:border-lavender-800/40">
      <div className="flex justify-center mb-2">
        <Users className="h-6 w-6 text-lavender-400" />
      </div>
      <p className="text-muted-foreground">No recently followed artists or playlists found.</p>
      <p className="text-sm text-muted-foreground mt-2">Try checking another username!</p>
    </div>
  )

  return (
    <BaseGroupedDisplay
      items={entities}
      getDateString={(entity) => entity.followed_at}
      renderItem={(entity, showTimeAgo) => <FollowedEntityCard entity={entity} showTimeAgo={showTimeAgo} />}
      emptyState={emptyState}
      isLoading={isLoading}
    />
  )
}
