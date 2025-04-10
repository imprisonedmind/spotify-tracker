// FILE: lib/spotify-api.ts

// Base URLs for Spotify API
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const SPOTIFY_ACCOUNTS_BASE = "https://accounts.spotify.com/api/token";

// Cache duration in seconds (3 minutes)
export const CACHE_DURATION = 180;

/**
 * Retrieves a Spotify API access token using client credentials flow.
 * Caches the token for CACHE_DURATION seconds.
 * @returns {Promise<string>} The Spotify access token.
 * @throws {Error} If Spotify credentials are not configured or token fetch fails.
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
      // Use Next.js fetch caching with revalidation
      next: { revalidate: CACHE_DURATION },
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
    // Re-throw the error after logging to allow higher-level handling
    throw error;
  }
}

/**
 * Fetches a user's public profile information from Spotify.
 * @param {string} userId - The Spotify user ID.
 * @param {string} accessToken - A valid Spotify access token.
 * @returns {Promise<any>} The user profile data.
 * @throws {Error} If the user is not found or the API request fails.
 */
export async function getUserProfile(
  userId: string,
  accessToken: string,
): Promise<any> {
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
        // User not found is a specific, potentially recoverable case
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
 * @param {string} userId - The Spotify user ID.
 * @param {string} accessToken - A valid Spotify access token.
 * @returns {Promise<any[]>} An array of playlist objects.
 * @throws {Error} If the user is not found or the API request fails.
 */
export async function getUserPlaylists(
  userId: string,
  accessToken: string,
): Promise<any[]> {
  // Fetch up to 50 playlists, which is the maximum allowed by the API per request.
  // Pagination could be added here if more than 50 playlists are needed.
  const url = `${SPOTIFY_API_BASE}/users/${userId}/playlists?limit=50`;
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
    // Ensure the response structure is as expected
    return data?.items ?? [];
  } catch (error) {
    console.error(`Error fetching Spotify playlists for ${userId}:`, error);
    throw error;
  }
}

/**
 * Fetches tracks from a specific Spotify playlist.
 * @param {string} playlistId - The Spotify playlist ID.
 * @param {string} accessToken - A valid Spotify access token.
 * @returns {Promise<any[]>} An array of playlist track objects.
 * @throws {Error} If the API request fails.
 */
export async function getPlaylistTracks(
  playlistId: string,
  accessToken: string,
): Promise<any[]> {
  // Fetch up to 100 tracks, the maximum per request.
  // Pagination could be added for playlists with more than 100 tracks.
  // Request specific fields to potentially reduce payload size if needed.
  const url = `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks?limit=100&fields=items(added_at,track(id,name,artists,album(images),external_urls,duration_ms,preview_url))`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: CACHE_DURATION },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Spotify playlist tracks request failed: ${response.status} ${response.statusText}`,
        { playlistId, url, errorBody },
      );
      throw new Error(
        `Failed to fetch playlist tracks for ${playlistId}: ${response.statusText}`,
      );
    }

    const data = await response.json();
    // Ensure the response structure is as expected and filter out potential null tracks
    return (data?.items ?? []).filter((item: any) => item && item.track);
  } catch (error) {
    console.error(
      `Error fetching Spotify tracks for playlist ${playlistId}:`,
      error,
    );
    throw error;
  }
}

/**
 * Determines the relative day category for a given date string.
 * @param {string} dateString - An ISO 8601 date string.
 * @returns {string} "Today", "Yesterday", or the day name (e.g., "Monday").
 */
export function getDayCategory(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Compare year, month, and day for accuracy
  const isSameDay = (d1: Date, d2: Date): boolean =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(date, today)) {
    return "Today";
  } else if (isSameDay(date, yesterday)) {
    return "Yesterday";
  } else {
    // Return day name for other days
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  }
}
