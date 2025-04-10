import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSkeleton() {
  return (
    <div className="bg-white/90 dark:bg-background/90 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-lavender-200 dark:border-lavender-800/40 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-6 w-48 mb-2" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  )
}
