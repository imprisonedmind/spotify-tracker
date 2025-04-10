// components/user/UserProfileDisplay.tsx
import Image from "next/image"
import Link from "next/link"
import { User, CheckCircle, Music, List } from "lucide-react"
import {UserProfile} from "@/lib/types";
import {formatNumber} from "@/lib/utils/formatters";

interface UserProfileDisplayProps {
  profile: UserProfile
}

/**
 * Displays the user's profile information.
 * This is a Server Component receiving data via props.
 */
export function UserProfileDisplay({ profile }: UserProfileDisplayProps) {
  const profileImageUrl = profile.images?.[0]?.url
  const profileName = profile.display_name || profile.id
  const profileUrl = profile.external_urls?.spotify

  return (
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        {/* Profile Image */}
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0">
          {profileImageUrl ? (
              <Image
                  src={profileImageUrl}
                  alt={`${profileName}'s profile picture`}
                  fill
                  sizes="(max-width: 640px) 80px, 96px" // Optimize image loading
                  className="rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md"
              />
          ) : (
              <div className="h-full w-full rounded-full bg-lavender-100 dark:bg-lavender-800 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-md">
                <User className="h-10 w-10 text-lavender-500 dark:text-lavender-400" />
              </div>
          )}
          {/* Optional: Add a verified badge or similar indicator if applicable */}
          {/* <CheckCircle className="absolute bottom-0 right-0 h-5 w-5 text-blue-500 bg-white rounded-full p-0.5" /> */}
        </div>

        {/* Profile Info */}
        <div className="flex-grow text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold">
            {profileUrl ? (
                <Link
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-lavender-600 dark:hover:text-lavender-300 transition-colors"
                >
                  {profileName}
                </Link>
            ) : (
                profileName
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">@{profile.id}</p>

          {/* Stats */}
          {profile.stats && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                {profile.stats.followerCount > 0 && (
                    <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                      {formatNumber(profile.stats.followerCount)} Follower{profile.stats.followerCount !== 1 ? "s" : ""}
              </span>
                )}
                {profile.stats.totalPlaylists > 0 && (
                    <span className="flex items-center gap-1">
                <List className="h-3 w-3" />
                      {formatNumber(profile.stats.totalPlaylists)} Playlist
                      {profile.stats.totalPlaylists !== 1 ? "s" : ""}
              </span>
                )}
                {profile.stats.totalTracks > 0 && (
                    <span className="flex items-center gap-1">
                <Music className="h-3 w-3" />
                      {formatNumber(profile.stats.totalTracks)} Track{profile.stats.totalTracks !== 1 ? "s" : ""}
              </span>
                )}
              </div>
          )}
        </div>
      </div>
  )
}