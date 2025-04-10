import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdPlaceholderProps {
  type?: "banner" | "square" | "leaderboard" | "skyscraper"
  className?: string
}

export function AdPlaceholder({ type = "banner", className }: AdPlaceholderProps) {
  const dimensions = {
    banner: "h-16 w-full", // 468x60 equivalent
    square: "h-64 w-64", // 300x250 equivalent
    leaderboard: "h-24 w-full", // 728x90 equivalent
    skyscraper: "h-[600px] w-32", // 160x600 equivalent
  }

  return (
      <div
          className={cn(
        "border border-dashed border-lavender-300 dark:border-lavender-700 bg-lavender-50 dark:bg-lavender-900/20 rounded-lg flex items-center justify-center text-center p-2",
        dimensions[type],
        className,
  )}
>
  <div className="text-muted-foreground">
  <div className="flex justify-center mb-1">
  <ExternalLink className="h-4 w-4" />
      </div>
      <p className="text-xs">Ad Placeholder</p>
  <p className="text-[10px] opacity-70">{type}</p>
      </div>
      </div>
)
}
