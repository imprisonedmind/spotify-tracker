// lib/spotify/config.ts

// Base URLs for Spotify API
export const SPOTIFY_API_BASE = "https://api.spotify.com/v1"
export const SPOTIFY_ACCOUNTS_BASE = "https://accounts.spotify.com/api/token"

// Cache duration in seconds (e.g., 5 minutes) for Next.js fetch revalidation
export const CACHE_REVALIDATE_SECONDS = 300

// Minimum number of recently added tracks to aim for
export const MIN_RECENT_TRACKS_COUNT = 50

// Maximum age for tracks to be considered "recent" (in days)
export const MAX_RECENT_TRACK_AGE_DAYS = 7