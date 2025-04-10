// FILE: app/users/[userId]/types.ts
// (Assuming this file exists or creating it if needed)

// Basic structure for a Spotify Track object, adjust as needed
export interface Track {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: { images: { url: string; height: number; width: number }[] };
  external_urls: { spotify: string };
  duration_ms: number;
  preview_url: string | null;
  added_at: string; // ISO 8601 date string
  playlist: {
    id: string;
    name: string;
    external_urls: { spotify: string };
  };
}

// Basic structure for a Spotify User Profile object, adjust as needed
export interface UserProfile {
  id: string;
  display_name: string | null;
  external_urls: { spotify: string };
  images?: { url: string; height: number | null; width: number | null }[];
  followers?: { href: string | null; total: number };
  stats: {
    totalPlaylists: number;
    totalTracks: number;
    followerCount: number;
  };
}
