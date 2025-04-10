// components/skeletons/ProfileSkeleton.tsx

/**
 * Renders a skeleton placeholder for the user profile section.
 */
export function ProfileSkeleton() {
  return (
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 animate-pulse">
        {/* Image Placeholder */}
        <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-full bg-lavender-100 dark:bg-lavender-800/60" />

        {/* Text Placeholders */}
        <div className="flex-grow w-full sm:w-auto flex flex-col items-center sm:items-start">
          <div className="h-6 w-3/5 sm:w-48 bg-lavender-100 dark:bg-lavender-800/60 rounded mb-2" />
          <div className="h-4 w-2/5 sm:w-32 bg-lavender-100 dark:bg-lavender-800/60 rounded mb-3" />
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 w-full">
            <div className="h-3 w-20 bg-lavender-100 dark:bg-lavender-800/60 rounded" />
            <div className="h-3 w-24 bg-lavender-100 dark:bg-lavender-800/60 rounded" />
            <div className="h-3 w-16 bg-lavender-100 dark:bg-lavender-800/60 rounded" />
          </div>
        </div>
      </div>
  )
}