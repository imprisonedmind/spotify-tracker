"use server"

import {
  getSpotifyAccessToken,
  getUserProfile,
  getUserPlaylists,
  getPlaylistTracks,
  getUserTopTracks,
  getUserLikedTracks,
  getUserFollowed,
  wasAddedThisWeek,
} from "./spotify-api"
import type { Track, UserProfile, FollowedEntity } from "./types"

export async function fetchUserData(userId: string): Promise<{
  profile: UserProfile
  recentTracks: Track[]
  recentListens: Track[]
  recentLikes: Track[]
  recentFollows: FollowedEntity[]
}> {
  try {
    // Get access token
    const accessToken = await getSpotifyAccessToken()

    // Get user profile
    const profile = await getUserProfile(userId, accessToken)

    // Get user's playlists
    const playlists = await getUserPlaylists(userId, accessToken)

    // Calculate some stats
    const totalPlaylists = playlists.filter(
      (playlist) => playlist.owner.id.toLowerCase() === userId.toLowerCase(),
    ).length
    const totalTracks = playlists
      .filter((playlist) => playlist.owner.id.toLowerCase() === userId.toLowerCase())
      .reduce((sum, playlist) => sum + playlist.tracks.total, 0)

    // Enhanced profile with stats
    const enhancedProfile = {
      ...profile,
      stats: {
        totalPlaylists,
        totalTracks,
        followerCount: profile.followers?.total || 0,
      },
    }

    // Get tracks from each playlist
    const recentTracksPromises = playlists.map(async (playlist) => {
      // Only process playlists owned by the user
      if (playlist.owner.id.toLowerCase() !== userId.toLowerCase()) {
        return []
      }

      const tracks = await getPlaylistTracks(playlist.id, accessToken)

      // Filter tracks added this week and map to our Track type
      return tracks
        .filter((item) => wasAddedThisWeek(item.added_at))
        .map((item) => ({
          ...item.track,
          added_at: item.added_at,
          playlist: {
            id: playlist.id,
            name: playlist.name,
            external_urls: playlist.external_urls,
          },
        }))
    })

    // Wait for all playlist track fetches to complete
    const recentTracksArrays = await Promise.all(recentTracksPromises)

    // Flatten the arrays and sort by added_at (newest first)
    const recentTracks = recentTracksArrays
      .flat()
      .sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())

    // Get recent listens (simulated)
    const recentListens = await getUserTopTracks(userId, accessToken)

    // Get recently liked tracks (simulated)
    const recentLikes = await getUserLikedTracks(userId, accessToken)

    // Get recently followed artists and playlists (simulated)
    const recentFollows = await getUserFollowed(userId, accessToken)

    return { profile: enhancedProfile, recentTracks, recentListens, recentLikes, recentFollows }
  } catch (error) {
    console.error("Error fetching user data:", error)
    throw error
  }
}
