// FILE: components/layout/base-grouped-display.tsx
"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { Calendar } from "lucide-react";
import { SectionSkeleton } from "@/components/skeletons/section-skeleton";
import { getDateDisplayInfo } from "@/lib/spotify-api";

interface BaseGroupedDisplayProps<T> {
  items: T[];
  getDateString: (item: T) => string | undefined;
  /** Updated: Function to render a single item, now receives an `isToday` flag */
  renderItem: (item: T, isToday: boolean) => ReactNode;
  emptyState: ReactNode;
  isLoading?: boolean;
  getItemKey: (item: T) => string | number;
}

interface GroupedData<T> {
  display: string;
  sortDate: Date;
  items: T[];
}

export function BaseGroupedDisplay<T>({
  items,
  getDateString,
  renderItem, // Updated prop
  emptyState,
  isLoading = false,
  getItemKey,
}: BaseGroupedDisplayProps<T>) {
  const [groupedDataMap, setGroupedDataMap] = useState<
    Record<string, GroupedData<T>>
  >({});
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setIsInitializing(true);
    const newGroupedData: Record<string, GroupedData<T>> = {};

    items.forEach((item) => {
      const dateString = getDateString(item);
      if (!dateString) {
        console.warn("Item missing date string, skipping grouping:", item);
        return;
      }
      try {
        const { display, sortDate } = getDateDisplayInfo(dateString);
        if (!newGroupedData[display]) {
          newGroupedData[display] = { display, sortDate, items: [] };
        }
        newGroupedData[display].items.push(item);
      } catch (error) {
        console.error(
          `Error processing date "${dateString}" for item:`,
          item,
          error,
        );
      }
    });

    setGroupedDataMap(newGroupedData);
    setIsInitializing(false);
  }, [items, getDateString]);

  const sortedGroups = useMemo(() => {
    return Object.values(groupedDataMap).sort(
      (a, b) => b.sortDate.getTime() - a.sortDate.getTime(),
    );
  }, [groupedDataMap]);

  if (isLoading || isInitializing) {
    return <SectionSkeleton count={3} />;
  }

  if (!items.length || sortedGroups.length === 0) {
    return emptyState;
  }

  return (
    <div className="space-y-6">
      {sortedGroups.map((group) => (
        <div key={group.display} className="space-y-2">
          <div className="flex items-center gap-2 pt-2">
            <Calendar className="h-4 w-4 flex-shrink-0 text-lavender-500 dark:text-lavender-400" />
            <h2 className="text-base font-medium">
              {group.display}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({group.items.length})
              </span>
            </h2>
          </div>
          <div className="space-y-2">
            {group.items.map((item) => {
              // Determine if the current group is "Today"
              const isToday = group.display === "Today";
              return (
                <div key={getItemKey(item)}>
                  {/* Pass the isToday flag to the renderItem function */}
                  {renderItem(item, isToday)}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
