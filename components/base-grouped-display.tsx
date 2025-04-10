// components/common/BaseGroupedDisplay.tsx
"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Calendar } from "lucide-react"
import {SectionSkeleton} from "@/components/skeletons/section-skeleton";

// --- Date Grouping Logic ---

/**
 * Determines the display category for a given date string (e.g., "Today", "Yesterday", "Monday").
 * @param dateString - An ISO 8601 date string.
 * @returns The category string.
 */
function getDayCategory(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  // Use UTC methods to compare dates without timezone interference, ensuring consistency.
  const dateDay = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  const todayDay = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const yesterdayDay = Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate())

  if (dateDay === todayDay) {
    return "Today"
  } else if (dateDay === yesterdayDay) {
    return "Yesterday"
  } else {
    // Use Intl API for localized day name (more robust than manual array)
    return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date)
  }
}

// --- Component Definition ---

interface BaseGroupedDisplayProps<T extends { id: string }> {
  items: T[]
  getDateString: (item: T) => string | undefined // Function to extract the date string from an item
  renderItem: (item: T, showTimeAgo: boolean) => ReactNode // Function to render each item
  emptyState: ReactNode // Content to show when items array is empty
  isLoading?: boolean // Optional loading state flag
  sectionTitle?: string // Optional title for the entire section
}

// Define the order for display categories
const CATEGORY_ORDER = [
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

/**
 * A client component that groups items by date categories (Today, Yesterday, Day of Week)
 * and renders them using a provided render function. Handles loading and empty states.
 */
export function BaseGroupedDisplay<T extends { id: string }>({
                                                               items,
                                                               getDateString,
                                                               renderItem,
                                                               emptyState,
                                                               isLoading = false,
                                                               sectionTitle,
                                                             }: BaseGroupedDisplayProps<T>) {
  const [groupedItems, setGroupedItems] = useState<Record<string, T[]>>({})
  const [isClient, setIsClient] = useState(false) // Track if component has mounted

  useEffect(() => {
    setIsClient(true) // Component has mounted

    const grouped: Record<string, T[]> = {}
    items.forEach((item) => {
      const dateString = getDateString(item)
      if (dateString) {
        try {
          const category = getDayCategory(dateString)
          if (!grouped[category]) {
            grouped[category] = []
          }
          grouped[category].push(item)
        } catch (e) {
          console.error(`Error parsing date string "${dateString}" for item ID ${item.id}:`, e)
          // Optionally group invalid dates into a separate category
        }
      }
    })
    setGroupedItems(grouped)
  }, [items, getDateString]) // Rerun grouping when items or the date extractor changes

  // Render skeleton on initial server render or when explicitly loading
  if (!isClient || isLoading) {
    return <SectionSkeleton count={3} title={sectionTitle} />
  }

  // Render empty state if there are no items after mounting and not loading
  if (items.length === 0) {
    return emptyState
  }

  // Get the categories present in the data, sorted according to CATEGORY_ORDER
  const presentCategories = CATEGORY_ORDER.filter((category) => groupedItems[category]?.length > 0)

  // Render empty state if, after grouping, no valid categories were found
  if (presentCategories.length === 0) {
    return emptyState
  }

  return (
      <div className="space-y-6">
        {sectionTitle && (
            <h2 className="text-lg font-semibold text-foreground mb-3">{sectionTitle}</h2>
        )}
        {presentCategories.map((category) => (
            <div key={category} className="space-y-3">
              {/* Group Header */}
              <div className="flex items-center gap-2 border-b border-lavender-100 dark:border-lavender-800/30 pb-1.5">
                <Calendar className="h-4 w-4 text-lavender-500 dark:text-lavender-400" />
                <h3 className="text-sm font-medium text-foreground">
                  {category}
                  <span className="ml-1.5 text-xs text-muted-foreground">({groupedItems[category].length})</span>
                </h3>
              </div>
              {/* Items in Group */}
              <div className="space-y-2">
                {groupedItems[category].map((item) => (
                    // Key ensures stability if item IDs are unique across categories
                    <div key={item.id}>{renderItem(item, category === "Today")}</div>
                ))}
              </div>
            </div>
        ))}
      </div>
  )
}