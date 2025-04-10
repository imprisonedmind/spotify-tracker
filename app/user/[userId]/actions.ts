// FILE: app/users/[userId]/actions.ts
"use server";

import {
  getPlaylistTracks,
  getSpotifyAccessToken,
  getUserPlaylists,
  getUserProfile,
} from "@/lib/spotify-api"; // Assuming lib is at root
import type { Track, UserProfile } from "./types"; // Assuming types are co-located

// Define a minimum number of recent tracks to fetch
const MIN_RECENT_TRACKS = 20;

/**
 * Fetches comprehensive data for a specific Spotify user, including their profile,
 * stats, and their most recently added tracks across their owned playlists.
 *
 * @param {string} userId - The Spotify user ID.
 * @returns {Promise<{ profile: UserProfile; recentTracks: Track[] }>}
 *          An object containing the user's enhanced profile and recent tracks.
 * @throws {Error} Propagates errors from underlying API calls or processing.
 */
export async function fetchUserData(userId: string): Promise<{
  profile: UserProfile;
  recentTracks: Track[];
}> {
  if (!userId) {
    throw new Error("User ID must be provided");
  }

  try {
    const accessToken = await getSpotifyAccessToken();

    // Fetch profile and playlists concurrently
    const [profileData, playlistsData] = await Promise.all([
      getUserProfile(userId, accessToken),
      getUserPlaylists(userId, accessToken),
    ]);

    // Filter playlists owned by the target user and calculate stats
    const ownedPlaylists = playlistsData.filter(
      (playlist) => playlist.owner.id.toLowerCase() === userId.toLowerCase(),
    );

    const totalPlaylists = ownedPlaylists.length;
    const totalTracks = ownedPlaylists.reduce(
      (sum, playlist) => sum + (playlist.tracks?.total ?? 0),
      0,
    );

    const enhancedProfile: UserProfile = {
      ...profileData,
      stats: {
        totalPlaylists,
        totalTracks,
        followerCount: profileData.followers?.total ?? 0,
      },
    };

    // Fetch tracks for each owned playlist concurrently
    const trackFetchPromises = ownedPlaylists.map(async (playlist) => {
      try {
        const tracks = await getPlaylistTracks(playlist.id, accessToken);
        // Map to our Track type, adding playlist context
        return tracks.map((item) => ({
          ...(item.track as Omit<Track, "added_at" | "playlist">), // Assert structure from API call fields
          added_at: item.added_at,
          playlist: {
            id: playlist.id,
            name: playlist.name,
            external_urls: playlist.external_urls,
          },
        }));
      } catch (error) {
        console.warn(
          `Failed to fetch tracks for playlist ${playlist.id}. Skipping.`,
          error,
        );
        return []; // Return empty array for this playlist on error
      }
    });

    const trackArrays = await Promise.all(trackFetchPromises);

    // Flatten the arrays, filter out any potential null/invalid entries,
    // sort by added_at (newest first), and take the top N tracks.
    const allRecentTracks = trackArrays
      .flat()
      .filter((track): track is Track => !!track && !!track.added_at) // Type guard and ensure added_at exists
      .sort(
        (a, b) =>
          new Date(b.added_at).getTime() - new Date(a.added_at).getTime(),
      );

    const recentTracks = allRecentTracks.slice(0, MIN_RECENT_TRACKS);

    return { profile: enhancedProfile, recentTracks };
  } catch (error) {
    // Log the error context before re-throwing
    console.error(`Error fetching user data for ${userId}:`, error);
    // Re-throw to allow RSC error boundaries or callers to handle
    throw error;
  }
}
