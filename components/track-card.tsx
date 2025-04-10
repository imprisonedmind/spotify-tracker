// FILE: components/track-card.tsx
"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { Card } from "@/components/ui/card";
import type { Track } from "@/app/user/[userId]/types"; // Adjust path as needed
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; // Assuming you have a utility for class names

interface TrackCardProps {
  track: Track;
  /** Flag to indicate if the relative time badge should be shown (typically for "Today") */
  showTimeAgo?: boolean;
}

// Helper to safely get the album image URL
const getImageUrl = (track: Track): string => {
  return track.album?.images?.[0]?.url || "/placeholder-album.svg";
};

// Helper to format artist names
const formatArtists = (artists: Track["artists"]): string => {
  return artists?.map((artist) => artist.name).join(", ") || "Unknown Artist";
};

// Reusable function to attempt opening Spotify app links
const openInSpotifyApp = (url: string | undefined) => {
  if (!url) {
    console.warn("No URL provided to openInSpotifyApp");
    return;
  }
  // Convert web URL (https://open.spotify.com/...) to app URI (spotify:...)
  const appUrl = url
    .replace("https://open.spotify.com/", "spotify:")
    .replace(/\?.*$/, ""); // Remove query params

  try {
    // Attempt to navigate via window.location.href
    // Note: This might be blocked by browsers or require user interaction/permissions
    window.location.href = appUrl;
  } catch (error) {
    console.warn(
      `Could not open Spotify app link (${appUrl}), falling back to web link (${url}):`,
      error,
    );
    // Fallback: Open the original web URL in a new tab
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

export function TrackCard({ track, showTimeAgo = false }: TrackCardProps) {
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
    }
  }

  const playlistUrl = track.playlist?.external_urls?.spotify;
  const trackUrl = track.external_urls?.spotify;

  return (
    <Card className="overflow-hidden rounded-2xl border border-lavender-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md dark:border-lavender-800/40 dark:bg-background/90">
      <div className="flex items-center p-3 justify-between">
        {/* Album Image */}
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-16">
          <Image
            src={getImageUrl(track)}
            alt={`Album art for ${track.album?.name || track.name}`}
            fill
            sizes="(max-width: 640px) 56px, 64px"
            className="object-cover"
            unoptimized={getImageUrl(track).includes("placeholder")}
          />
        </div>

        {/* Track Info */}
        <div className="ml-3 flex-1 min-w-0">
          {/* Track Title */}
          <h3 className="flex-1 break-words font-medium text-sm leading-tight sm:text-base">
            {track.name || "Untitled Track"}
          </h3>

          {/* Artist Name */}
          <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">
            {formatArtists(track.artists)}
          </p>
          {/* Added to Playlist Info */}
          {track.playlist && (
            <div className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground/80 sm:text-xs">
              Added to:{" "}
              <a
                href={playlistUrl} // Use the playlist URL
                target="_blank"
                rel="noopener noreferrer"
                title={`Open playlist "${track.playlist.name}" in Spotify`}
                className={cn(
                  "hover:underline focus:outline-none focus:ring-1 focus:ring-ring rounded-sm text-lavender-700", // Basic link styling + focus
                  !playlistUrl && "pointer-events-none opacity-60", // Disable if no URL
                )}
                onClick={(e) => {
                  e.preventDefault(); // Prevent default navigation
                  e.stopPropagation(); // Prevent card click if nested
                  openInSpotifyApp(playlistUrl); // Use the reusable app opener function
                }}
                // Prevent interaction if no URL
                aria-disabled={!playlistUrl}
              >
                {track.playlist.name || "Unnamed Playlist"}
              </a>
            </div>
          )}
        </div>

        {timeAgoString && (
          <Badge
            variant="outline"
            className="ml-2 flex-shrink-0 border-lavender-200 bg-lavender-50 px-1.5 py-0 text-[10px] font-normal text-lavender-700 dark:border-lavender-700/50 dark:bg-lavender-900/30 dark:text-lavender-300 sm:text-xs"
          >
            {timeAgoString}
          </Badge>
        )}

        {/* External Link Button (for the track) */}
        <div className="ml-2 flex flex-shrink-0 items-center self-start sm:self-center">
          <a
            href={trackUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open track "${track.name}" in Spotify`}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-lavender-500 transition-colors hover:bg-lavender-100 hover:text-lavender-700 dark:text-lavender-400 dark:hover:bg-lavender-800/40 dark:hover:text-lavender-200",
              !trackUrl && "pointer-events-none opacity-50", // Disable if no URL
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openInSpotifyApp(trackUrl);
            }}
            aria-disabled={!trackUrl}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">Open track in Spotify</span>
          </a>
        </div>
      </div>
    </Card>
  );
}
