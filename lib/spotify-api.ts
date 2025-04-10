// FILE: lib/spotify-api.ts

import { Buffer } from "buffer";
import { SpotifyRateLimitError } from "./errors";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const SPOTIFY_ACCOUNTS_BASE = "https://accounts.spotify.com/api/token";

// Cache duration in seconds (e.g., 1 hour for profile/playlists, 20 min for tracks?)
// Using a single constant for now, can be refined.
export const CACHE_DURATION = 3600; // 1 hour
export const TRACKS_CACHE_DURATION = 1200; // 20 minutes

/**
 * Fetches or retrieves a cached Spotify API access token using Client Credentials Flow.
 * @returns {Promise<string>} A valid Spotify access token.
 * @throws {Error} If credentials are missing or the request fails.
 * @throws {SpotifyRateLimitError} If the token endpoint returns 429.
 */
export async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Spotify API credentials missing in environment variables.");
    throw new Error("Spotify API credentials are not configured");
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch(SPOTIFY_ACCOUNTS_BASE, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
      // Cache the token itself for a shorter duration than API data,
      // e.g., 50 minutes (Spotify tokens typically last 60 mins).
      next: { revalidate: 3000 },
    });

    const responseBodyText = await response.text(); // Read body once for potential error logging

    if (!response.ok) {
      console.error(
        `Spotify token request failed: ${response.status} ${response.statusText}`,
        responseBodyText,
      );
      if (response.status === 429) {
        throw new SpotifyRateLimitError(
          `Spotify API rate limit exceeded on token request. Status: 429. Body: ${responseBodyText}`,
          response.headers.get("Retry-After"),
        );
      }
      throw new Error(
        `Failed to get Spotify access token: ${response.statusText}. Body: ${responseBodyText}`,
      );
    }

    const data = JSON.parse(responseBodyText); // Parse after checking status ok
    if (!data.access_token) {
      console.error("Spotify token response missing access_token:", data);
      throw new Error("Invalid response received from Spotify token endpoint");
    }
    return data.access_token;
  } catch (error) {
    // Catch fetch errors or errors thrown above
    if (error instanceof SpotifyRateLimitError) {
      throw error; // Re-throw specific error
    }
    console.error("Error fetching Spotify access token:", error);
    // Wrap other errors for consistency or re-throw
    throw new Error(
      `Failed to obtain Spotify access token: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Fetches a user's profile from Spotify.
 * @param {string} userId - The Spotify user ID.
 * @param {string} accessToken - A valid Spotify access token.
 * @returns {Promise<any>} User profile data object.
 * @throws {Error} If the user is not found or the request fails.
 * @throws {SpotifyRateLimitError} If the API returns 429.
 */
export async function getUserProfile(
  userId: string,
  accessToken: string,
): Promise<any> {
  // Consider defining a stricter return type: SpotifyApi.UserProfileResponse
  const url = `${SPOTIFY_API_BASE}/users/${userId}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: CACHE_DURATION }, // Cache profile data longer
    });

    const responseBodyText = await response.text();

    if (!response.ok) {
      console.error(
        `Spotify profile request failed: ${response.status} ${response.statusText}`,
        { userId, url, responseBodyText },
      );
      if (response.status === 404) {
        // Consider throwing a specific NotFoundError if needed elsewhere
        throw new Error(`User profile ${userId} not found. Status: 404.`);
      }
      if (response.status === 429) {
        throw new SpotifyRateLimitError(
          `Spotify API rate limit exceeded fetching profile for ${userId}. Status: 429. Body: ${responseBodyText}`,
          response.headers.get("Retry-After"),
        );
      }
      throw new Error(
        `Failed to fetch user profile ${userId}: ${response.statusText}. Body: ${responseBodyText}`,
      );
    }

    return JSON.parse(responseBodyText);
  } catch (error) {
    if (error instanceof SpotifyRateLimitError) {
      throw error; // Re-throw specific error
    }
    console.error(`Error fetching Spotify user profile for ${userId}:`, error);
    // Wrap or re-throw other errors
    throw new Error(
      `Failed to fetch profile for ${userId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Fetches a user's public playlists from Spotify.
 * Optimization: Uses 'fields' to request only necessary data.
 * @param {string} userId - The Spotify user ID.
 * @param {string} accessToken - A valid Spotify access token.
 * @returns {Promise<any[]>} An array of playlist objects with minimal fields.
 * @throws {Error} If the user is not found or the API request fails.
 * @throws {SpotifyRateLimitError} If the API returns 429.
 */
export async function getUserPlaylists(
  userId: string,
  accessToken: string,
): Promise<any[]> {
  // Consider defining a stricter return type: Partial<SpotifyApi.PlaylistObjectSimplified>[]
  // Fetch up to 50 playlists, the maximum per request.
  const fields = "items(id,name,owner(id),tracks(total),external_urls)";
  const url = `${SPOTIFY_API_BASE}/users/${userId}/playlists?limit=50&fields=${encodeURIComponent(fields)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: CACHE_DURATION }, // Cache playlist list longer
    });

    const responseBodyText = await response.text();

    if (!response.ok) {
      console.error(
        `Spotify playlists request failed: ${response.status} ${response.statusText}`,
        { userId, url, responseBodyText },
      );
      if (response.status === 404) {
        // User not found might manifest here too if profile check passed somehow but playlists fail
        throw new Error(
          `User ${userId} not found when fetching playlists. Status: 404.`,
        );
      }
      if (response.status === 429) {
        throw new SpotifyRateLimitError(
          `Spotify API rate limit exceeded fetching playlists for ${userId}. Status: 429. Body: ${responseBodyText}`,
          response.headers.get("Retry-After"),
        );
      }
      throw new Error(
        `Failed to fetch user playlists for ${userId}: ${response.statusText}. Body: ${responseBodyText}`,
      );
    }

    const data = JSON.parse(responseBodyText);
    return data?.items ?? [];
  } catch (error) {
    if (error instanceof SpotifyRateLimitError) {
      throw error; // Re-throw specific error
    }
    console.error(`Error fetching Spotify playlists for ${userId}:`, error);
    // Wrap or re-throw other errors
    throw new Error(
      `Failed to fetch playlists for ${userId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Fetches tracks from a specific Spotify playlist, aiming for the most recent ones.
 * Optimization: Accepts 'limit' and 'totalTracks' to calculate offset for fetching the end of the playlist.
 *
 * @param {string} playlistId - The Spotify playlist ID.
 * @param {string} accessToken - A valid Spotify access token.
 * @param {number} totalTracks - The total number of tracks in the playlist (used to calculate offset).
 * @param {number} [limit=50] - Max tracks to fetch (1-100).
 * @returns {Promise<any[]>} An array of the most recently added playlist track objects.
 * @throws {Error} If the API request fails.
 * @throws {SpotifyRateLimitError} If the API returns 429.
 */
export async function getPlaylistTracks(
  playlistId: string,
  accessToken: string,
  totalTracks: number, // Add totalTracks parameter
  limit: number = 10,
): Promise<any[]> {
  const actualLimit = Math.max(1, Math.min(100, limit));
  // Calculate offset to get the last 'limit' tracks
  // Ensure offset is not negative if totalTracks < limit
  const offset = Math.max(0, totalTracks - actualLimit);

  const fields =
    "items(added_at,track(id,name,artists(id,name),album(images),external_urls,duration_ms,preview_url))";
  // Add the calculated offset to the URL
  const url = `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks?limit=${actualLimit}&offset=${offset}&fields=${encodeURIComponent(fields)}`;

  console.log(`Fetching tracks for playlist ${playlistId}: URL=${url}`); // Add log for debugging URL

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: TRACKS_CACHE_DURATION },
    });

    const responseBodyText = await response.text();

    if (!response.ok) {
      console.error(
        `Spotify playlist tracks request failed: ${response.status} ${response.statusText}`,
        {
          playlistId,
          limit: actualLimit,
          offset,
          totalTracks,
          url,
          responseBodyText,
        }, // Log relevant parameters
      );
      if (response.status === 404) {
        throw new Error(
          `Playlist ${playlistId} not found or inaccessible. Status: 404.`,
        );
      }
      // Handle potential 400 Bad Request if offset is invalid (though Math.max should prevent negative)
      if (response.status === 400) {
        throw new Error(
          `Bad request fetching tracks for playlist ${playlistId} (potentially invalid offset: ${offset} for total: ${totalTracks}). Status: 400. Body: ${responseBodyText}`,
        );
      }
      if (response.status === 429) {
        throw new SpotifyRateLimitError(
          `Spotify API rate limit exceeded fetching tracks for playlist ${playlistId}. Status: 429. Body: ${responseBodyText}`,
          response.headers.get("Retry-After"),
        );
      }
      throw new Error(
        `Failed to fetch playlist tracks for ${playlistId}: ${response.statusText}. Body: ${responseBodyText}`,
      );
    }

    const data = JSON.parse(responseBodyText);
    return (data?.items ?? []).filter((item: any) => item?.track);
  } catch (error) {
    if (error instanceof SpotifyRateLimitError) {
      console.warn(`Rate limit hit for playlist ${playlistId}.`);
      throw error;
    }
    console.error(
      `Error fetching Spotify tracks for playlist ${playlistId}:`,
      error,
    );
    throw new Error(
      `Failed to fetch tracks for playlist ${playlistId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// --- Date formatting functions remain the same ---
function formatAbsoluteDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getDateDisplayInfo(dateString: string): {
  display: string;
  sortDate: Date;
} {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.error(`Invalid date string encountered: ${dateString}`);
    // Return a default/error state or throw, decided to throw for now.
    throw new Error(`Invalid date string provided: ${dateString}`);
  }

  const now = new Date();
  const dateStartOfDay = new Date(date);
  dateStartOfDay.setHours(0, 0, 0, 0);
  const todayStartOfDay = new Date(now);
  todayStartOfDay.setHours(0, 0, 0, 0);
  const yesterdayStartOfDay = new Date(todayStartOfDay);
  yesterdayStartOfDay.setDate(todayStartOfDay.getDate() - 1);

  const currentDayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const startOfWeek = new Date(todayStartOfDay);
  startOfWeek.setDate(todayStartOfDay.getDate() + diffToMonday);

  let display: string;

  if (dateStartOfDay.getTime() === todayStartOfDay.getTime()) {
    display = "Today";
  } else if (dateStartOfDay.getTime() === yesterdayStartOfDay.getTime()) {
    display = "Yesterday";
  } else if (dateStartOfDay >= startOfWeek) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    display = days[date.getDay()];
  } else {
    display = formatAbsoluteDate(dateStartOfDay);
  }

  return { display, sortDate: dateStartOfDay };
}
