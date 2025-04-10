import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function TrackCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-lavender-200 dark:border-lavender-800/40 shadow-sm bg-white/90 dark:bg-background/90 backdrop-blur-sm rounded-2xl">
      <div className="flex items-center p-3">
        <Skeleton className="h-16 w-16 rounded-xl flex-shrink-0" />
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-16 rounded-full ml-2" />
          </div>
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-9 w-9 rounded-full ml-2" />
      </div>
    </Card>
  )
}
