"use client"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ReactNode } from "react"

interface BaseTrackCardProps {
  imageUrl: string
  imageAlt: string
  title: string
  subtitle: string
  description?: string
  externalUrl: string
  timeAgo?: string | null
  badgeIcon?: ReactNode
}

export function BaseTrackCard({
  imageUrl,
  imageAlt,
  title,
  subtitle,
  description,
  externalUrl,
  timeAgo,
  badgeIcon,
}: BaseTrackCardProps) {
  const openInSpotifyApp = (url: string) => {
    // Convert web URL to Spotify app URL
    const appUrl = url.replace("https://open.spotify.com/", "spotify:").replace("/", ":")
    window.location.href = appUrl
  }

  return (
    <Card className="overflow-hidden border border-lavender-200 dark:border-lavender-800/40 shadow-sm hover:shadow-md transition-all bg-white/90 dark:bg-background/90 backdrop-blur-sm rounded-2xl">
      <div className="flex items-center p-3">
        {/* Image */}
        <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden">
          <Image src={imageUrl || "/placeholder.svg?height=64&width=64"} alt={imageAlt} fill className="object-cover" />
          {badgeIcon && (
            <div className="absolute bottom-1 right-1 bg-white/90 dark:bg-black/70 rounded-full p-1">{badgeIcon}</div>
          )}
        </div>

        {/* Content */}
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base line-clamp-1">{title}</h3>
            {timeAgo && (
              <Badge className="ml-2 bg-lavender-100 text-lavender-700 border-0 text-xs py-0 h-5 dark:bg-lavender-800/40 dark:text-lavender-300">
                {timeAgo}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm line-clamp-1">{subtitle}</p>
          {description && <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{description}</div>}
        </div>

        {/* Action Button */}
        <div className="flex items-center">
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center justify-center h-9 w-9 rounded-full text-lavender-600 dark:text-lavender-400 hover:bg-lavender-100 dark:hover:bg-lavender-800/30 transition-colors"
            onClick={(e) => {
              e.preventDefault()
              openInSpotifyApp(externalUrl)
            }}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">Open in Spotify</span>
          </a>
        </div>
      </div>
    </Card>
  )
}
