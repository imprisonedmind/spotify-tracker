// components/skeletons/SectionSkeleton.tsx

/**
 * Renders a skeleton placeholder for a content section (e.g., list of tracks).
 */
interface SectionSkeletonProps {
  count?: number // Number of placeholder items to render
  title?: string // Optional title for the section
}

export function SectionSkeleton({ count = 3, title }: SectionSkeletonProps) {
  return (
      <div className="space-y-6 animate-pulse">
        {/* Optional Title Skeleton */}
        {title && <div className="h-6 w-1/3 bg-lavender-100 dark:bg-lavender-800/60 rounded mb-3" />}

        {/* Grouped Item Skeletons */}
        {Array.from({ length: Math.max(1, count) }).map((_, groupIndex) => (
            <div key={`group-${groupIndex}`} className="space-y-3">
              {/* Group Header Skeleton */}
              <div className="flex items-center gap-2 border-b border-lavender-100 dark:border-lavender-800/30 pb-1.5">
                <div className="h-4 w-4 bg-lavender-100 dark:bg-lavender-800/60 rounded-full" />
                <div className="h-4 w-1/4 bg-lavender-100 dark:bg-lavender-800/60 rounded" />
              </div>
              {/* Item Skeletons within Group */}
              <div className="space-y-2">
                {Array.from({ length: 2 }).map(
                    (
                        __,
                        itemIndex, // Render 2 item skeletons per group for visual density
                    ) => (
                        <div key={`item-${groupIndex}-${itemIndex}`} className="flex items-center gap-3 p-2 rounded-lg">
                          {/* Image Placeholder */}
                          <div className="h-12 w-12 shrink-0 rounded bg-lavender-100 dark:bg-lavender-800/60" />
                          {/* Text Lines Placeholder */}
                          <div className="flex-grow space-y-1.5">
                            <div className="h-4 w-3/4 bg-lavender-100 dark:bg-lavender-800/60 rounded" />
                            <div className="h-3 w-1/2 bg-lavender-100 dark:bg-lavender-800/60 rounded" />
                          </div>
                          {/* Timestamp Placeholder */}
                          <div className="h-3 w-10 shrink-0 bg-lavender-100 dark:bg-lavender-800/60 rounded" />
                        </div>
                    ),
                )}
              </div>
            </div>
        ))}
      </div>
  )
}