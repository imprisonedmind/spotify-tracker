// lib/spotify/types.ts

// Based on common fields from Spotify API responses relevant to this app.
// Refine further based on actual usage and API documentation.

export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface SpotifyExternalUrls {
  spotify: string
}

export interface SpotifyArtist {
  id: string
  name: string
  type: "artist"
  external_urls: SpotifyExternalUrls
  href: string // API endpoint URL
  uri: string // Spotify URI
}

export interface SpotifyAlbum {
  id: string
  name: string
  album_type: string
  artists: SpotifyArtist[]
  images: SpotifyImage[]
  external_urls: SpotifyExternalUrls
  release_date: string
  total_tracks: number
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  duration_ms: number
  explicit: boolean
  external_urls: SpotifyExternalUrls
  href: string
  is_local: boolean
  popularity: number // 0-100
  preview_url: string | null
  track_number: number
  type: "track"
  uri: string
}

// For playlist items, includes metadata about when it was added
export interface SpotifyPlaylistTrackItem {
  added_at: string // ISO 8601 timestamp
  added_by: { id: string } | null // User who added the track
  is_local: boolean
  track: SpotifyTrack | null // Track can be null if unavailable
}

export interface SpotifyPlaylistOwner {
  id: string
  display_name: string | null
  external_urls: SpotifyExternalUrls
  href: string
  type: "user"
  uri: string
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string | null
  owner: SpotifyPlaylistOwner
  public: boolean | null
  collaborative: boolean
  images: SpotifyImage[]
  tracks: {
    href: string // Link to fetch tracks
    total: number
  }
  external_urls: SpotifyExternalUrls
  snapshot_id: string
  type: "playlist"
  uri: string
}

export interface SpotifyUserProfile {
  id: string
  display_name: string | null
  external_urls: SpotifyExternalUrls
  followers?: {
    href: string | null
    total: number
  }
  href: string
  images?: SpotifyImage[]
  type: "user"
  uri: string
}

// Internal application types, potentially augmenting Spotify types

export interface UserProfile extends SpotifyUserProfile {
  stats?: {
    totalPlaylists: number
    totalTracks: number
    followerCount: number
  }
}

export interface Track extends SpotifyTrack {
  added_at: string // Copied from SpotifyPlaylistTrackItem
  playlist?: {
    id: string
    name: string
    external_urls: SpotifyExternalUrls
  }
}

// Type guard for filtering null tracks
export function isTrack(item: SpotifyPlaylistTrackItem): item is SpotifyPlaylistTrackItem & { track: SpotifyTrack } {
  return item.track !== null
}