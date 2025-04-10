// lib/spotify/client.ts

import { Buffer } from "node:buffer"
import { SPOTIFY_ACCOUNTS_BASE, SPOTIFY_API_BASE, CACHE_REVALIDATE_SECONDS } from "./config"
import type { SpotifyUserProfile, SpotifyPlaylist, SpotifyPlaylistTrackItem } from "./types"

// --- Authentication ---

/**
 * Retrieves a Spotify API access token using client credentials flow.
 * Caches the token for a defined duration.
 * @throws {Error} If credentials are missing or the request fails.
 * @returns {Promise<string>} The Spotify API access token.
 */
export async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error("Spotify API credentials (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET) are not configured.")
    throw new Error("Server configuration error: Spotify API credentials missing.")
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  try {
    const response = await fetch(SPOTIFY_ACCOUNTS_BASE, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
      // Use Next.js fetch caching with revalidation
      next: { revalidate: CACHE_REVALIDATE_SECONDS },
      // cache: "force-cache", // Alternative explicit caching strategy if needed
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`Spotify token request failed: ${response.status} ${response.statusText}`, errorBody)
      throw new Error(`Failed to obtain Spotify access token. Status: ${response.status}`)
    }

    const data = await response.json()
    if (!data.access_token) {
      console.error("Spotify token response did not contain access_token", data)
      throw new Error("Invalid response from Spotify token endpoint.")
    }

    return data.access_token
  } catch (error) {
    console.error("Error fetching Spotify access token:", error)
    // Re-throw a generic error to avoid leaking details potentially,
    // or customize based on expected fetch errors.
    throw new Error("Could not connect to Spotify authentication service.")
  }
}

// --- API Helpers ---

/**
 * Executes a fetch request against the Spotify API.
 * @param endpoint - The API endpoint path (e.g., "/users/userId").
 * @param accessToken - The Spotify API access token.
 * @param options - Optional fetch options.
 * @returns {Promise<T>} The JSON parsed response body.
 * @throws {Error} If the request fails or returns a non-OK status.
 */
async function fetchSpotifyAPI<T>(endpoint: string, accessToken: string, options: RequestInit = {}): Promise<T> {
  const url = `${SPOTIFY_API_BASE}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      // Apply Next.js caching to API calls as well
      next: { revalidate: CACHE_REVALIDATE_SECONDS, ...options.next },
    })

    if (!response.ok) {
      // Handle specific errors like rate limiting (429) or not found (404) if needed
      if (response.status === 404) {
        throw new Error(`Spotify resource not found at ${endpoint}. Status: 404`)
      }
      const errorBody = await response.text()
      console.error(`Spotify API request failed: ${response.status} ${response.statusText} for ${url}`, errorBody)
      throw new Error(`Spotify API error. Status: ${response.status}`)
    }

    // Handle cases where response might be empty (e.g., 204 No Content)
    if (response.status === 204) {
      return null as T // Or handle as appropriate for the call
    }

    return response.json() as Promise<T>
  } catch (error) {
    // Log network errors or errors from the try block
    console.error(`Error during Spotify API call to ${url}:`, error)
    if (error instanceof Error && error.message.includes("Status: 404")) {
      throw error // Re-throw specific known errors
    }
    throw new Error(`Failed to communicate with Spotify API.`) // Generic error for other issues
  }
}

/**
 * Fetches a Spotify user's public profile.
 * @param userId - The Spotify User ID.
 * @param accessToken - The Spotify API access token.
 * @returns {Promise<SpotifyUserProfile>} The user's profile information.
 * @throws {Error} If the user is not found or the request fails.
 */
export async function getUserProfile(userId: string, accessToken: string): Promise<SpotifyUserProfile> {
  if (!userId) {
    throw new Error("User ID must be provided to fetch profile.")
  }
  return fetchSpotifyAPI<SpotifyUserProfile>(`/users/${encodeURIComponent(userId)}`, accessToken)
}

/**
 * Fetches all public playlists for a given Spotify user.
 * Handles pagination automatically.
 * @param userId - The Spotify User ID.
 * @param accessToken - The Spotify API access token.
 * @returns {Promise<SpotifyPlaylist[]>} A list of the user's public playlists.
 */
export async function getUserPlaylists(userId: string, accessToken: string): Promise<SpotifyPlaylist[]> {
  if (!userId) {
    throw new Error("User ID must be provided to fetch playlists.")
  }

  const allPlaylists: SpotifyPlaylist[] = []
  let url: string | null = `/users/${encodeURIComponent(userId)}/playlists?limit=50`

  while (url) {
    // We use fetchSpotifyAPI which uses the main API base URL, so we only need the path part
    const endpointPath = url.replace(SPOTIFY_API_BASE, "")
    const response = await fetchSpotifyAPI<{ items: SpotifyPlaylist[]; next: string | null }>(endpointPath, accessToken)

    if (response.items) {
      allPlaylists.push(...response.items)
    }
    url = response.next // Get URL for the next page, or null if last page
  }

  return allPlaylists
}

/**
 * Fetches all tracks for a given Spotify playlist.
 * Handles pagination automatically.
 * @param playlistId - The Spotify Playlist ID.
 * @param accessToken - The Spotify API access token.
 * @returns {Promise<SpotifyPlaylistTrackItem[]>} A list of tracks in the playlist.
 */
export async function getPlaylistTracks(playlistId: string, accessToken: string): Promise<SpotifyPlaylistTrackItem[]> {
  if (!playlistId) {
    throw new Error("Playlist ID must be provided to fetch tracks.")
  }

  const allTracks: SpotifyPlaylistTrackItem[] = []
  // Specify fields to reduce response size - adjust as needed
  const fields = "items(added_at,added_by.id,is_local,track(id,name,artists(id,name),album(id,name,images),duration_ms,explicit,external_urls,uri)),next"
  let url: string | null = `/playlists/${playlistId}/tracks?limit=100&fields=${encodeURIComponent(fields)}`

  while (url) {
    const endpointPath = url.replace(SPOTIFY_API_BASE, "")
    const response = await fetchSpotifyAPI<{ items: SpotifyPlaylistTrackItem[]; next: string | null }>(
        endpointPath,
        accessToken,
    )

    if (response.items) {
      allTracks.push(...response.items)
    }
    url = response.next
  }

  return allTracks
}