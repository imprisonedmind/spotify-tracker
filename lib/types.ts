export interface SpotifyImage {
  url: string
  height: number
  width: number
}

export interface SpotifyArtist {
  id: string
  name: string
  external_urls: {
    spotify: string
  }
  images?: SpotifyImage[]
  followers?: {
    total: number
  }
  genres?: string[]
}

export interface SpotifyAlbum {
  id: string
  name: string
  images: SpotifyImage[]
  external_urls: {
    spotify: string
  }
  artists?: SpotifyArtist[]
  release_date?: string
}

export interface SpotifyPlaylist {
  id: string
  name: string
  external_urls: {
    spotify: string
  }
  images?: SpotifyImage[]
  owner?: {
    display_name: string
    id: string
  }
  followers?: {
    total: number
  }
  description?: string
}

export interface Track {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  external_urls: {
    spotify: string
  }
  added_at?: string
  played_at?: string
  liked_at?: string
  playlist?: SpotifyPlaylist
}

export interface FollowedEntity {
  id: string
  name: string
  type: "artist" | "playlist"
  images: SpotifyImage[]
  external_urls: {
    spotify: string
  }
  followed_at: string
  description?: string
  owner?: {
    display_name: string
  }
  followers?: {
    total: number
  }
  genres?: string[]
}

export interface UserProfile {
  id: string
  display_name: string
  external_urls: {
    spotify: string
  }
  followers: {
    total: number
  }
  images: SpotifyImage[]
  stats?: {
    totalPlaylists: number
    totalTracks: number
    followerCount: number
  }
}

export interface GroupedTracks {
  [key: string]: Track[]
}

export interface GroupedFollows {
  [key: string]: FollowedEntity[]
}
