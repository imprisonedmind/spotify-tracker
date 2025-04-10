// FILE: app/user/[userId]/actions.ts
"use server";

import {
  getPlaylistTracks,
  getSpotifyAccessToken,
  getUserPlaylists,
  getUserProfile,
} from "@/lib/spotify-api";
import { SpotifyRateLimitError } from "@/lib/errors";
import type { Track, UserProfile } from "./types";
import { notFound } from "next/navigation"; // Import notFound

// Constants for data fetching strategy
const MIN_RECENT_TRACKS = 20; // Final number of tracks to display
const TRACK_FETCH_LIMIT_PER_PLAYLIST = 30; // Fetch slightly more per playlist initially

// Define the possible outcomes of the data fetching operation
type FetchUserDataResult =
  | { profile: UserProfile; recentTracks: Track[]; rateLimited: false }
  | { profile?: UserProfile; recentTracks: []; rateLimited: true }; // Profile might be fetched before rate limit

// fetchUserProfileForMeta remains the same (could be removed if fetchUserData covers all needs)
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

    // Basic mapping, stats are not calculated here
    return {
      id: profileData.id,
      display_name: profileData.display_name,
      external_urls: profileData.external_urls,
      images: profileData.images,
      followers: profileData.followers,
      stats: {
        // Placeholder stats
        totalPlaylists: 0,
        totalTracks: 0,
        followerCount: profileData.followers?.total ?? 0,
      },
    };
  } catch (error) {
    // Don't trigger toast/rate limit handling for metadata fetch
    if (error instanceof SpotifyRateLimitError) {
      console.warn(
        `Rate limited during metadata profile fetch for ${userId}. Returning null.`,
      );
    } else {
      console.error(
        `Error fetching profile for metadata (user: ${userId}):`,
        error instanceof Error ? error.message : error,
      );
    }
    return null;
  }
}

/**
 * Fetches comprehensive data for a specific Spotify user, handling rate limits gracefully.
 * Attempts to return profile data even if track fetching is rate limited.
 *
 * @param {string} userId - The Spotify user ID.
 * @returns {Promise<FetchUserDataResult>} Object containing profile/tracks or rate limit info.
 * @throws {Error} Throws non-rate-limit errors from critical fetches (e.g., initial profile 404).
 */
export async function fetchUserData(
  userId: string,
): Promise<FetchUserDataResult> {
  if (!userId) {
    throw new Error("User ID must be provided");
  }

  let accessToken: string;
  let profileData: any;
  let enhancedProfile: UserProfile | undefined;
  let playlistsData: any[] = [];
  let rateLimitOccurred = false; // Flag to track if *any* rate limit happened

  try {
    // --- Phase 1: Fetch Core Profile Data ---
    accessToken = await getSpotifyAccessToken();
    profileData = await getUserProfile(userId, accessToken);

    // --- Phase 2: Fetch Playlists for Stats (best effort) ---
    let totalPlaylists = 0;
    let totalTracks = 0;
    try {
      playlistsData = await getUserPlaylists(userId, accessToken);
      const ownedPlaylists = playlistsData.filter(
        (playlist) =>
          playlist.owner?.id?.toLowerCase() === userId.toLowerCase(),
      );
      totalPlaylists = ownedPlaylists.length;
      totalTracks = ownedPlaylists.reduce(
        (sum, playlist) => sum + (playlist.tracks?.total ?? 0),
        0,
      );
    } catch (playlistError) {
      if (playlistError instanceof SpotifyRateLimitError) {
        console.warn(
          `Rate limited while fetching playlists for user ${userId}. Stats will be incomplete.`,
        );
        rateLimitOccurred = true; // *** SET THE FLAG HERE ***
        // Proceed with stats as 0, profile can still be shown
      } else {
        console.warn(
          `Failed to fetch playlists for user ${userId}, stats may be incomplete. Error: ${playlistError instanceof Error ? playlistError.message : playlistError}`,
        );
      }
      // Reset playlistsData as fetching failed or was rate limited
      playlistsData = [];
    }

    // --- Assemble Profile Object (always try to assemble profile) ---
    enhancedProfile = {
      id: profileData.id,
      display_name: profileData.display_name,
      external_urls: profileData.external_urls,
      images: profileData.images,
      followers: profileData.followers,
      stats: {
        totalPlaylists,
        totalTracks,
        followerCount: profileData.followers?.total ?? 0,
      },
    };

    // --- Early exit if rate limit already happened during playlists ---
    if (rateLimitOccurred) {
      console.log(
        `Exiting early after playlist rate limit for user ${userId}.`,
      );
      return { profile: enhancedProfile, recentTracks: [], rateLimited: true };
    }

    // --- Phase 3: Fetch Tracks (only if playlists were fetched successfully) ---
    const ownedPlaylists = playlistsData.filter(
      (playlist) => playlist.owner?.id?.toLowerCase() === userId.toLowerCase(),
    );

    // This check is now slightly redundant due to the early exit above, but safe to keep.
    // It handles the case where playlists were fetched but none were owned.
    if (ownedPlaylists.length === 0) {
      console.log(
        `No owned playlists found or available for track fetching for user ${userId}.`,
      );
      // No rate limit occurred if we reached here, return false
      return { profile: enhancedProfile, recentTracks: [], rateLimited: false };
    }

    // Wrap track fetching in its own try/catch to handle potential rate limits here
    let recentTracks: Track[] = [];
    try {
      const trackFetchPromises = ownedPlaylists.map(async (playlist) => {
        // Note: getPlaylistTracks throws SpotifyRateLimitError if it hits 429
        const tracks = await getPlaylistTracks(
          playlist.id,
          accessToken,
          TRACK_FETCH_LIMIT_PER_PLAYLIST,
        );
        return tracks
          .map((item): Track | null => {
            if (!item || !item.track || !item.added_at) {
              console.warn(
                `Skipping invalid track item in playlist ${playlist.id}:`,
                item,
              );
              return null;
            }
            const trackData = item.track;
            if (
              !trackData.id ||
              !trackData.name ||
              !trackData.artists ||
              !trackData.album
            ) {
              console.warn(
                `Skipping track with missing core data in playlist ${playlist.id}:`,
                trackData,
              );
              return null;
            }
            return {
              id: trackData.id,
              name: trackData.name,
              artists: trackData.artists,
              album: trackData.album,
              external_urls: trackData.external_urls,
              duration_ms: trackData.duration_ms,
              preview_url: trackData.preview_url ?? null,
              added_at: item.added_at,
              playlist: {
                id: playlist.id,
                name: playlist.name,
                external_urls: playlist.external_urls,
              },
            };
          })
          .filter((track): track is Track => track !== null);
      });

      const trackArrays = await Promise.all(trackFetchPromises);
      const allRecentTracks = trackArrays
        .flat()
        .filter((track): track is Track => !!track?.added_at)
        .sort(
          (a, b) =>
            new Date(b.added_at).getTime() - new Date(a.added_at).getTime(),
        );
      recentTracks = allRecentTracks.slice(0, MIN_RECENT_TRACKS);
    } catch (trackError) {
      if (trackError instanceof SpotifyRateLimitError) {
        console.warn(
          `Rate limited during track fetching phase for user ${userId}.`,
        );
        rateLimitOccurred = true; // Set the flag if rate limit happens here
        // Tracks will be empty []
      } else {
        // Re-throw unexpected errors during track fetching
        console.error(
          `Unexpected error during track fetching for ${userId}:`,
          trackError,
        );
        throw trackError;
      }
    }

    // --- Final Return ---
    // Return based on the rateLimitOccurred flag status
    return {
      profile: enhancedProfile,
      recentTracks,
      rateLimited: rateLimitOccurred,
    };
  } catch (error) {
    // This outer catch primarily handles errors in Phase 1 (Token/Profile)
    // and errors re-thrown from track fetching.
    if (error instanceof SpotifyRateLimitError) {
      console.warn(
        `Spotify rate limit encountered during initial data fetch or track fetch error handling for user ${userId}.`,
      );
      // Ensure profile is included if it was fetched before the error
      return { profile: enhancedProfile, recentTracks: [], rateLimited: true };
    }

    if (
      error instanceof Error &&
      (error.message.includes("not found") ||
        error.message.includes("Status: 404"))
    ) {
      console.log(
        `User or resource not found for ${userId}. Triggering notFound().`,
      );
      notFound();
    }

    console.error(`Unhandled error fetching user data for ${userId}:`, error);
    throw error;
  }
}
