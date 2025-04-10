// FILE: components/layout/base-grouped-display.tsx
"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { Calendar } from "lucide-react";
import { SectionSkeleton } from "@/components/skeletons/section-skeleton";
import { getDateDisplayInfo } from "@/lib/spotify-api"; // Use the updated function

interface BaseGroupedDisplayProps<T> {
  /** The array of items to display */
  items: T[];
  /** Function to extract the relevant date string (ISO 8601 format) from an item */
  getDateString: (item: T) => string | undefined;
  /** Function to render a single item */
  renderItem: (item: T) => ReactNode;
  /** Content to display when items array is empty after filtering/grouping */
  emptyState: ReactNode;
  /** Optional loading state indicator */
  isLoading?: boolean;
  /** Function to derive a unique stable key for each item (React key prop) */
  getItemKey: (item: T) => string | number;
}

/** Represents a group of items categorized by a date display string */
interface GroupedData<T> {
  /** The display string for the group header (e.g., "Today", "Yesterday", "Monday", "21 Jan 2024") */
  display: string;
  /** The normalized date (start of day) used for sorting groups chronologically */
  sortDate: Date;
  /** The items belonging to this group */
  items: T[];
}

/**
 * A client component that groups items by date categories ("Today", "Yesterday",
 * day name for current week, "DD MMM YYYY" for older dates) and renders them
 * in chronologically sorted groups.
 */
export function BaseGroupedDisplay<T>({
  items,
  getDateString,
  renderItem,
  emptyState,
  isLoading = false,
  getItemKey,
}: BaseGroupedDisplayProps<T>) {
  // State to hold the processed and grouped data
  const [groupedDataMap, setGroupedDataMap] = useState<
    Record<string, GroupedData<T>>
  >({});
  // State to manage initial processing state, distinct from external isLoading prop
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Reset initialization state when items or getDateString change
    setIsInitializing(true);
    const newGroupedData: Record<string, GroupedData<T>> = {};

    items.forEach((item) => {
      const dateString = getDateString(item);
      // Skip items that don't provide a valid date string
      if (!dateString) {
        console.warn("Item is missing a date string, skipping grouping:", item);
        return;
      }

      try {
        // Get the display category and sortable date from the helper
        const { display, sortDate } = getDateDisplayInfo(dateString);

        // Initialize group if it doesn't exist
        if (!newGroupedData[display]) {
          newGroupedData[display] = { display, sortDate, items: [] };
        }
        // Add item to the corresponding group
        newGroupedData[display].items.push(item);
      } catch (error) {
        // Log errors from getDateDisplayInfo (e.g., invalid date format)
        console.error(
          `Error processing date "${dateString}" for item:`,
          item,
          error,
        );
        // Skip items with invalid dates rather than crashing
      }
    });

    setGroupedDataMap(newGroupedData);
    setIsInitializing(false); // Mark initialization complete
  }, [items, getDateString]); // Re-run grouping when items or the date extractor change

  // Memoize the sorted groups to avoid re-sorting on every render
  const sortedGroups = useMemo(() => {
    return (
      Object.values(groupedDataMap)
        // Sort groups: Most recent date first (descending order)
        .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
    );
  }, [groupedDataMap]); // Re-calculate only when the grouped data changes

  // Display skeleton if explicitly loading or during initial client-side processing
  if (isLoading || isInitializing) {
    return <SectionSkeleton count={3} />; // Adjust skeleton count as needed
  }

  // Display empty state if there are no items or no groups were formed (e.g., all dates invalid)
  if (!items.length || sortedGroups.length === 0) {
    return emptyState;
  }

  // Render the sorted groups
  return (
    <div className="space-y-6">
      {sortedGroups.map((group) => (
        <div key={group.display} className="space-y-2">
          {/* Group Header */}
          <div className="flex items-center gap-2 pt-2">
            <Calendar className="h-4 w-4 flex-shrink-0 text-lavender-500 dark:text-lavender-400" />
            <h2 className="text-base font-medium">
              {group.display}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({group.items.length})
              </span>
            </h2>
          </div>
          {/* Items within the group */}
          <div className="space-y-2">
            {group.items.map((item) => (
              // Use the provided getItemKey prop for stable React list keys
              // *** The error likely occurs because getItemKey(item) returns an invalid key
              // *** OR because renderItem(item) throws an error for a specific item.
              // *** Debug the props passed to this component from its parent.
              <div key={getItemKey(item)}>{renderItem(item)}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
