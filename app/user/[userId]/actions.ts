// FILE: app/user/[userId]/actions.ts
"use server";

import {
  getPlaylistTracks,
  getSpotifyAccessToken,
  getUserPlaylists,
  getUserProfile,
} from "@/lib/spotify-api";
import type { Track, UserProfile } from "./types";

// Number of recent tracks we ultimately want to display
const MIN_RECENT_TRACKS = 20;
// **Optimization**: How many recent tracks to fetch *per playlist*.
// Should be >= MIN_RECENT_TRACKS to increase chances of getting the global top N.
// 30 is a reasonable starting point, balancing API calls vs completeness.
const TRACK_FETCH_LIMIT_PER_PLAYLIST = 30;

// --- fetchUserProfileForMeta remains the same ---
export async function fetchUserProfileForMeta(
  userId: string,
): Promise<UserProfile | null> {
  if (!userId) {
    console.warn("fetchUserProfileForMeta called without userId");
    return null;
  }

  try {
    const accessToken = await getSpotifyAccessToken();
    const profileData = await getUserProfile(userId, accessToken);

    // Map to UserProfile type, ensure stats object exists
    return {
      id: profileData.id,
      display_name: profileData.display_name,
      external_urls: profileData.external_urls,
      images: profileData.images,
      followers: profileData.followers,
      stats: {
        totalPlaylists: 0, // Not calculated here
        totalTracks: 0, // Not calculated here
        followerCount: profileData.followers?.total ?? 0,
      },
    };
  } catch (error) {
    console.error(
      `Error fetching profile for metadata (user: ${userId}):`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

/**
 * Fetches comprehensive data for a specific Spotify user.
 * Optimization: Fetches only recent tracks per playlist.
 *
 * @param {string} userId - The Spotify user ID.
 * @returns {Promise<{ profile: UserProfile; recentTracks: Track[] }>}
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

    // Fetch profile and *minimal* playlist data concurrently
    const [profileData, playlistsData] = await Promise.all([
      getUserProfile(userId, accessToken),
      getUserPlaylists(userId, accessToken), // Now fetches fewer fields
    ]);

    // Filter playlists owned by the target user
    const ownedPlaylists = playlistsData.filter(
      // Ensure case-insensitivity for user ID comparison
      (playlist) => playlist.owner?.id?.toLowerCase() === userId.toLowerCase(),
    );

    // Calculate stats using the fetched playlist data
    const totalPlaylists = ownedPlaylists.length;
    const totalTracks = ownedPlaylists.reduce(
      (sum, playlist) => sum + (playlist.tracks?.total ?? 0),
      0,
    );

    const enhancedProfile: UserProfile = {
      ...profileData, // Spread raw profile data
      // Ensure fields match UserProfile type
      id: profileData.id,
      display_name: profileData.display_name,
      external_urls: profileData.external_urls,
      images: profileData.images,
      followers: profileData.followers,
      // Add calculated stats
      stats: {
        totalPlaylists,
        totalTracks,
        followerCount: profileData.followers?.total ?? 0,
      },
    };

    // Fetch *limited recent* tracks for each owned playlist concurrently
    const trackFetchPromises = ownedPlaylists.map(async (playlist) => {
      try {
        // **Optimization**: Pass the reduced limit here
        const tracks = await getPlaylistTracks(
          playlist.id,
          accessToken,
          TRACK_FETCH_LIMIT_PER_PLAYLIST, // Use the defined constant
        );

        // Map to our Track type, adding playlist context
        return tracks
          .map((item): Track | null => {
            // Basic validation for track structure before mapping
            if (!item || !item.track || !item.added_at) {
              console.warn(
                `Skipping invalid track item in playlist ${playlist.id}:`,
                item,
              );
              return null;
            }
            return {
              ...(item.track as Omit<Track, "added_at" | "playlist">),
              added_at: item.added_at,
              playlist: {
                id: playlist.id,
                name: playlist.name,
                external_urls: playlist.external_urls,
              },
            };
          })
          .filter((track): track is Track => track !== null); // Filter out any nulls from validation
      } catch (error) {
        // Log specific playlist fetch error but don't fail the whole process
        console.warn(
          `Failed to fetch tracks for playlist ${playlist.id}. Skipping. Error: ${error instanceof Error ? error.message : error}`,
        );
        return []; // Return empty array for this playlist on error
      }
    });

    const trackArrays = await Promise.all(trackFetchPromises);

    // Flatten, filter (ensure added_at), sort by added_at (newest first),
    // and take the top MIN_RECENT_TRACKS.
    const allRecentTracks = trackArrays
      .flat()
      // Secondary filter for added_at robustness, although mapping tries to ensure it
      .filter((track): track is Track => !!track?.added_at)
      .sort(
        (a, b) =>
          new Date(b.added_at).getTime() - new Date(a.added_at).getTime(),
      );

    // Slice to the desired final number of tracks
    const recentTracks = allRecentTracks.slice(0, MIN_RECENT_TRACKS);

    return { profile: enhancedProfile, recentTracks };
  } catch (error) {
    console.error(`Error fetching user data for ${userId}:`, error);
    throw error; // Re-throw after logging
  }
}
