// FILE: lib/spotify-api.ts

import { Buffer } from "buffer";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const SPOTIFY_ACCOUNTS_BASE = "https://accounts.spotify.com/api/token";

// Cache duration in seconds (20 minutes)
export const CACHE_DURATION = 1200;

// --- getSpotifyAccessToken remains the same ---
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
      next: { revalidate: CACHE_DURATION }, // Use Next.js built-in fetch caching
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Spotify token request failed: ${response.status} ${response.statusText}`,
        errorBody,
      );
      throw new Error(
        `Failed to get Spotify access token: ${response.statusText}`,
      );
    }

    const data = await response.json();
    if (!data.access_token) {
      console.error("Spotify token response missing access_token:", data);
      throw new Error("Invalid response received from Spotify token endpoint");
    }
    return data.access_token;
  } catch (error) {
    console.error("Error fetching Spotify access token:", error);
    throw error;
  }
}

// --- getUserProfile remains the same ---
export async function getUserProfile(
  userId: string,
  accessToken: string,
): Promise<any> {
  // Consider defining a stricter type based on expected response
  const url = `${SPOTIFY_API_BASE}/users/${userId}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: CACHE_DURATION },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`User ${userId} not found`);
      }
      const errorBody = await response.text();
      console.error(
        `Spotify profile request failed: ${response.status} ${response.statusText}`,
        { userId, url, errorBody },
      );
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching Spotify user profile for ${userId}:`, error);
    throw error;
  }
}

/**
 * Fetches a user's public playlists from Spotify.
 * Optimization: Uses 'fields' to request only necessary data.
 * @param {string} userId - The Spotify user ID.
 * @param {string} accessToken - A valid Spotify access token.
 * @returns {Promise<any[]>} An array of playlist objects with minimal fields.
 * @throws {Error} If the user is not found or the API request fails.
 */
export async function getUserPlaylists(
  userId: string,
  accessToken: string,
): Promise<any[]> {
  // Consider defining a stricter PlaylistSummary type
  // Fetch up to 50 playlists, the maximum per request.
  // **Optimization**: Request only fields needed for filtering and stats.
  const fields = "items(id,name,owner(id),tracks(total),external_urls)";
  const url = `${SPOTIFY_API_BASE}/users/${userId}/playlists?limit=50&fields=${encodeURIComponent(fields)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: CACHE_DURATION },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`User ${userId} not found`);
      }
      const errorBody = await response.text();
      console.error(
        `Spotify playlists request failed: ${response.status} ${response.statusText}`,
        { userId, url, errorBody },
      );
      throw new Error(`Failed to fetch user playlists: ${response.statusText}`);
    }

    const data = await response.json();
    return data?.items ?? [];
  } catch (error) {
    console.error(`Error fetching Spotify playlists for ${userId}:`, error);
    throw error;
  }
}

/**
 * Fetches tracks from a specific Spotify playlist.
 * Optimization: Accepts a 'limit' parameter.
 * @param {string} playlistId - The Spotify playlist ID.
 * @param {string} accessToken - A valid Spotify access token.
 * @param {number} [limit=50] - The maximum number of tracks to fetch (default: 50, max: 100).
 * @returns {Promise<any[]>} An array of playlist track objects.
 * @throws {Error} If the API request fails.
 */
export async function getPlaylistTracks(
  playlistId: string,
  accessToken: string,
  limit: number = 50, // Default to fetching 50, can be overridden
): Promise<any[]> {
  // Consider defining a stricter PlaylistTrackItem type
  // Ensure limit is within Spotify's allowed range (1-100)
  const actualLimit = Math.max(1, Math.min(100, limit));

  // Request specific fields to reduce payload size.
  const fields =
    "items(added_at,track(id,name,artists(id,name),album(images),external_urls,duration_ms,preview_url))";
  // **Optimization**: Use the 'actualLimit' parameter in the URL.
  const url = `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks?limit=${actualLimit}&fields=${encodeURIComponent(fields)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      // Cache individual playlist track calls as well
      next: { revalidate: CACHE_DURATION },
    });

    if (!response.ok) {
      // Handle 404 for playlists specifically if needed, though less common than user 404
      const errorBody = await response.text();
      console.error(
        `Spotify playlist tracks request failed: ${response.status} ${response.statusText}`,
        { playlistId, limit: actualLimit, url, errorBody },
      );
      throw new Error(
        `Failed to fetch playlist tracks for ${playlistId}: ${response.statusText}`,
      );
    }

    const data = await response.json();
    // Filter out potential null tracks just in case
    return (data?.items ?? []).filter((item: any) => item && item.track);
  } catch (error) {
    console.error(
      `Error fetching Spotify tracks for playlist ${playlistId}:`,
      error,
    );
    throw error;
  }
}

// --- getDateDisplayInfo and formatAbsoluteDate remain the same ---
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
    // Return a default/error state instead of throwing? Depends on desired UX.
    // For now, keep throwing to align with previous behavior.
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
