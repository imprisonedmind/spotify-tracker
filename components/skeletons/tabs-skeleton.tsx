import { Skeleton } from "@/components/ui/skeleton"

export function TabsSkeleton() {
  return (
    <div className="p-1 bg-lavender-50 dark:bg-lavender-900/30 rounded-xl mb-4 flex">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-9 flex-1 rounded-lg mx-1" />
        ))}
    </div>
  )
}
