// lib/actions/getUserData.ts
"use server"

import {
  getSpotifyAccessToken,
  getUserProfile,
  getUserPlaylists,
  getPlaylistTracks,
} from "@/lib/spotify/client"
import { MIN_RECENT_TRACKS_COUNT, MAX_RECENT_TRACK_AGE_DAYS } from "@/lib/spotify/config"
import {isTrack, SpotifyPlaylist, Track, UserProfile} from "@/lib/types";

/**
 * Calculates statistics based on user playlists.
 * @param userId - The ID of the user whose stats are being calculated.
 * @param playlists - An array of the user's playlists.
 * @param profileFollowers - Follower count from the profile, if available.
 * @returns An object containing playlist and track counts.
 */
function calculateUserStats(
    userId: string,
    playlists: SpotifyPlaylist[],
    profileFollowers?: number,
): NonNullable<UserProfile["stats"]> {
  const lowerCaseUserId = userId.toLowerCase()
  const userOwnedPlaylists = playlists.filter((p) => p.owner?.id?.toLowerCase() === lowerCaseUserId)

  const totalPlaylists = userOwnedPlaylists.length
  const totalTracks = userOwnedPlaylists.reduce((sum, p) => sum + (p.tracks?.total ?? 0), 0)
  const followerCount = profileFollowers ?? 0

  return { totalPlaylists, totalTracks, followerCount }
}

/**
 * Filters and sorts playlist tracks to find recently added ones based on defined criteria.
 * Fetches tracks page by page if necessary.
 * @param playlists - Playlists to fetch tracks from.
 * @param accessToken - Spotify API access token.
 * @returns A sorted list of recently added tracks.
 */
async function getRecentlyAddedTracks(
    playlists: SpotifyPlaylist[],
    accessToken: string,
    userId: string,
): Promise<Track[]> {
  const lowerCaseUserId = userId.toLowerCase()
  const userOwnedPlaylists = playlists.filter((p) => p.owner?.id?.toLowerCase() === lowerCaseUserId)

  if (userOwnedPlaylists.length === 0) {
    return []
  }

  // Fetch all tracks from user-owned playlists concurrently
  const trackPromises = userOwnedPlaylists.map(async (playlist) => {
    try {
      const playlistTracks = await getPlaylistTracks(playlist.id, accessToken)
      // Map to internal Track format, filtering out null tracks and adding playlist info
      return playlistTracks.filter(isTrack).map((item) => ({
        ...item.track,
        added_at: item.added_at,
        playlist: {
          id: playlist.id,
          name: playlist.name,
          external_urls: playlist.external_urls,
        },
      }))
    } catch (error) {
      console.warn(`Failed to fetch tracks for playlist ${playlist.id}:`, error)
      return [] // Return empty array for this playlist on error
    }
  })

  const tracksFromAllPlaylists = (await Promise.all(trackPromises)).flat()

  // Sort all collected tracks by added_at date, newest first
  tracksFromAllPlaylists.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())

  // Determine the cutoff date (N days ago)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - MAX_RECENT_TRACK_AGE_DAYS)
  const cutoffTimestamp = cutoffDate.getTime()

  // Filter tracks added within the last N days
  const tracksWithinDateLimit = tracksFromAllPlaylists.filter(
      (track) => new Date(track.added_at).getTime() >= cutoffTimestamp,
  )

  // Decide which set of tracks to return:
  // If tracks within the date limit meet the minimum count, return them.
  // Otherwise, return the N most recently added tracks regardless of date.
  if (tracksWithinDateLimit.length >= MIN_RECENT_TRACKS_COUNT) {
    return tracksWithinDateLimit
  } else {
    return tracksFromAllPlaylists.slice(0, MIN_RECENT_TRACKS_COUNT)
  }
}

/**
 * Fetches core user data: profile and recently added tracks from their owned playlists.
 * This action runs on the server.
 * @param userId - The Spotify User ID.
 * @returns An object containing the user's profile and recent tracks.
 * @throws {Error} If the user is not found or a critical API error occurs.
 */
export async function fetchUserData(userId: string): Promise<{
  profile: UserProfile
  recentTracks: Track[]
}> {
  if (!userId) {
    throw new Error("User ID is required.")
  }

  try {
    const accessToken = await getSpotifyAccessToken()

    // Fetch profile and playlists concurrently
    const [profileResponse, playlistsResponse] = await Promise.all([
      getUserProfile(userId, accessToken),
      getUserPlaylists(userId, accessToken),
    ])

    // Process profile and calculate stats
    const profile: UserProfile = {
      ...profileResponse,
      stats: calculateUserStats(userId, playlistsResponse, profileResponse.followers?.total),
    }

    // Fetch and process recently added tracks
    const recentTracks = await getRecentlyAddedTracks(playlistsResponse, accessToken, userId)

    return { profile, recentTracks }
  } catch (error) {
    // Log the detailed error on the server
    console.error(`Error fetching data for Spotify user ${userId}:`, error)

    // Re-throw errors that should trigger a 404 or other specific client handling
    if (error instanceof Error) {
      if (error.message.includes("Status: 404")) {
        // Let the page component handle this with notFound()
        throw new Error(`User '${userId}' not found.`)
      }
      if (error.message.includes("Spotify API error") || error.message.includes("connect to Spotify")) {
        // Surface API/connection issues
        throw new Error("Could not retrieve data from Spotify. Please try again later.")
      }
    }

    // Throw a generic error for other unexpected issues
    throw new Error("An unexpected error occurred while fetching user data.")
  }
}