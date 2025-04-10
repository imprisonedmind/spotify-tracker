"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Calendar } from "lucide-react"
import { SectionSkeleton } from "@/components/skeletons/section-skeleton"
import { getDayCategory } from "@/lib/spotify-api"

interface BaseGroupedDisplayProps<T> {
  items: T[]
  getDateString: (item: T) => string | undefined
  renderItem: (item: T, showTimeAgo: boolean) => ReactNode
  emptyState: ReactNode
  isLoading?: boolean
}

export function BaseGroupedDisplay<T extends { id: string }>({
  items,
  getDateString,
  renderItem,
  emptyState,
  isLoading = false,
}: BaseGroupedDisplayProps<T>) {
  const [groupedItems, setGroupedItems] = useState<Record<string, T[]>>({})
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Group items by day category
    const grouped: Record<string, T[]> = {}

    items.forEach((item) => {
      const dateString = getDateString(item)
      if (!dateString) return

      const category = getDayCategory(dateString)
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(item)
    })

    setGroupedItems(grouped)
    setIsInitializing(false)
  }, [items, getDateString])

  if (isLoading || isInitializing) {
    return <SectionSkeleton count={3} />
  }

  if (!items.length) {
    return emptyState
  }

  // Order for day categories
  const categoryOrder = [
    "Today",
    "Yesterday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]

  return (
    <div className="space-y-6">
      {categoryOrder.map((category) => {
        if (!groupedItems[category] || groupedItems[category].length === 0) return null

        return (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-lavender-500 dark:text-lavender-400" />
              <h2 className="text-base font-medium">
                {category} <span className="text-muted-foreground text-sm">({groupedItems[category].length})</span>
              </h2>
            </div>
            <div className="space-y-2">
              {groupedItems[category].map((item) => (
                <div key={getItemKey(item, category)}>{renderItem(item, category === "Today")}</div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Helper function to generate a unique key for each item
function getItemKey(item: any, category: string): string {
  // Try to use various date fields that might exist on the item
  const dateField = item.added_at || item.played_at || item.liked_at || item.followed_at
  return `${item.id}-${dateField}-${category}`
}
