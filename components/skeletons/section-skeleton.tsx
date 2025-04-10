import { Skeleton } from "@/components/ui/skeleton"
import { TrackCardSkeleton } from "./track-card-skeleton"

export function SectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-2">
          {Array(count)
            .fill(0)
            .map((_, i) => (
              <TrackCardSkeleton key={i} />
            ))}
        </div>
      </div>
    </div>
  )
}
