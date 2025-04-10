// FILE: components/track-card.tsx
"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns"; // Use strict for "x hours ago" vs "about x hours ago"
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Track } from "@/app/user/[userId]/types"; // Adjust path as needed

interface TrackCardProps {
  track: Track;
  /** Flag to indicate if the relative time badge should be shown (typically for "Today") */
  showTimeAgo?: boolean;
}

// Helper to safely get the album image URL
const getImageUrl = (track: Track): string => {
  return track.album?.images?.[0]?.url || "/placeholder-album.svg"; // Provide a fallback image
};

// Helper to format artist names
const formatArtists = (artists: Track["artists"]): string => {
  return artists?.map((artist) => artist.name).join(", ") || "Unknown Artist";
};

export function TrackCard({ track, showTimeAgo = false }: TrackCardProps) {
  // Function to attempt opening the native Spotify app link
  const openInSpotifyApp = (url: string) => {
    // Basic conversion: https://open.spotify.com/track/TRACK_ID -> spotify:track:TRACK_ID
    const appUrl = url
      .replace("https://open.spotify.com/", "spotify:")
      .replace(/\?.*$/, ""); // Remove query params if any
    // Attempt to navigate - might be blocked by browser depending on config/permissions
    // Consider adding a fallback or user feedback if this fails silently
    try {
      window.location.href = appUrl;
    } catch (error) {
      console.warn(
        "Could not open Spotify app link, falling back to web:",
        error,
      );
      window.open(url, "_blank", "noopener,noreferrer"); // Fallback to web link
    }
  };

  // Calculate time ago string only if needed and possible
  let timeAgoString: string | null = null;
  if (showTimeAgo && track.added_at) {
    try {
      timeAgoString = formatDistanceToNowStrict(new Date(track.added_at), {
        addSuffix: true,
      });
    } catch (error) {
      console.error(
        "Error formatting date for time ago:",
        track.added_at,
        error,
      );
      // Don't display badge if date is invalid
    }
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-lavender-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md dark:border-lavender-800/40 dark:bg-background/90">
      <div className="flex items-center p-3">
        {/* Album Image */}
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-16">
          <Image
            src={getImageUrl(track)}
            alt={`Album art for ${track.album?.name || track.name}`}
            fill
            sizes="(max-width: 640px) 56px, 64px" // Optimization hint for browser
            className="object-cover"
            unoptimized={getImageUrl(track).includes("placeholder")} // Avoid optimizing placeholder
          />
          {/* Optional: Add badge icon here if needed */}
        </div>

        {/* Track Info */}
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            {/* Track Title (Allow wrapping) */}
            <h3 className="flex-1 break-words font-medium text-sm leading-tight sm:text-base">
              {track.name || "Untitled Track"}
            </h3>
            {/* Time Ago Badge (Conditional) */}
            {timeAgoString && (
              <Badge
                variant="outline" // Use outline or a subtle variant
                className="ml-2 flex-shrink-0 border-lavender-200 bg-lavender-50 px-1.5 py-0 text-[10px] font-normal text-lavender-700 dark:border-lavender-700/50 dark:bg-lavender-900/30 dark:text-lavender-300 sm:text-xs"
              >
                {timeAgoString}
              </Badge>
            )}
          </div>
          {/* Artist Name */}
          <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">
            {formatArtists(track.artists)}
          </p>
          {/* Added to Playlist Info */}
          {track.playlist && (
            <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground/80 sm:text-xs">
              Added to: {track.playlist.name}
            </p>
          )}
        </div>

        {/* External Link Button */}
        <div className="ml-2 flex flex-shrink-0 items-center self-start sm:self-center">
          <a
            href={track.external_urls?.spotify}
            target="_blank" // Provide fallback target
            rel="noopener noreferrer"
            title={`Open ${track.name} in Spotify`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-lavender-500 transition-colors hover:bg-lavender-100 hover:text-lavender-700 dark:text-lavender-400 dark:hover:bg-lavender-800/40 dark:hover:text-lavender-200"
            onClick={(e) => {
              e.preventDefault(); // Prevent default link navigation
              if (track.external_urls?.spotify) {
                openInSpotifyApp(track.external_urls.spotify);
              }
            }}
            // Disable button visually and functionally if no URL
            aria-disabled={!track.external_urls?.spotify}
            style={{
              pointerEvents: !track.external_urls?.spotify ? "none" : "auto",
              opacity: !track.external_urls?.spotify ? 0.5 : 1,
            }}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">Open in Spotify</span>
          </a>
        </div>
      </div>
    </Card>
  );
}
