// Base URLs for Spotify API
const SPOTIFY_API_BASE = "https://api.spotify.com/v1"
const SPOTIFY_ACCOUNTS_BASE = "https://accounts.spotify.com/api/token"

// Cache duration in seconds (3 minutes)
export const CACHE_DURATION = 180

// Get Spotify API access token
export async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Spotify API credentials are not configured")
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const response = await fetch(SPOTIFY_ACCOUNTS_BASE, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    next: { revalidate: CACHE_DURATION },
  })

  if (!response.ok) {
    throw new Error(`Failed to get Spotify access token: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

// Fetch a user's profile
export async function getUserProfile(userId: string, accessToken: string): Promise<any> {
  const response = await fetch(`${SPOTIFY_API_BASE}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: CACHE_DURATION },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`User ${userId} not found`)
    }
    throw new Error(`Failed to fetch user profile: ${response.statusText}`)
  }

  return response.json()
}

// Fetch a user's playlists
export async function getUserPlaylists(userId: string, accessToken: string): Promise<any[]> {
  const response = await fetch(`${SPOTIFY_API_BASE}/users/${userId}/playlists?limit=50`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: CACHE_DURATION },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`User ${userId} not found`)
    }
    throw new Error(`Failed to fetch user playlists: ${response.statusText}`)
  }

  const data = await response.json()
  return data.items
}

// Fetch a playlist's tracks
export async function getPlaylistTracks(playlistId: string, accessToken: string): Promise<any[]> {
  const response = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks?limit=100`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: CACHE_DURATION },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch playlist tracks: ${response.statusText}`)
  }

  const data = await response.json()
  return data.items
}

// Fetch a user's top tracks (Note: This requires user authentication with proper scopes)
// Since we can't get actual user listening history with client credentials,
// we'll simulate it by using tracks from playlists
export async function getUserTopTracks(userId: string, accessToken: string): Promise<any[]> {
  // In a real app, we would use the /me/player/recently-played endpoint
  // But since that requires user authentication, we'll use a workaround

  // For demo purposes, we'll get tracks from the user's public playlists
  // and randomize their "played_at" times to simulate recent listening
  const playlists = await getUserPlaylists(userId, accessToken)

  // Get tracks from the first few playlists
  const tracksPromises = playlists.slice(0, 3).map((playlist) => getPlaylistTracks(playlist.id, accessToken))

  const playlistTracksArrays = await Promise.all(tracksPromises)
  const allTracks = playlistTracksArrays.flat()

  // Take a random selection of tracks and assign recent "played_at" times
  const now = new Date()
  const recentTracks = allTracks
    .slice(0, 20)
    .map((item) => {
      // Random time in the past week
      const randomHours = Math.floor(Math.random() * 168) // 7 days * 24 hours
      const playedAt = new Date(now.getTime() - randomHours * 60 * 60 * 1000)

      return {
        ...item.track,
        played_at: playedAt.toISOString(),
      }
    })
    .sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime())

  return recentTracks
}

// Simulate fetching a user's liked tracks
export async function getUserLikedTracks(userId: string, accessToken: string): Promise<any[]> {
  // In a real app, we would use the /me/tracks endpoint
  // But since that requires user authentication, we'll use a workaround

  // For demo purposes, we'll get tracks from the user's public playlists
  // and randomize their "liked_at" times to simulate recently liked tracks
  const playlists = await getUserPlaylists(userId, accessToken)

  // Get tracks from a few random playlists
  const randomPlaylists = playlists.sort(() => 0.5 - Math.random()).slice(0, 2)
  const tracksPromises = randomPlaylists.map((playlist) => getPlaylistTracks(playlist.id, accessToken))

  const playlistTracksArrays = await Promise.all(tracksPromises)
  const allTracks = playlistTracksArrays.flat()

  // Take a random selection of tracks and assign recent "liked_at" times
  const now = new Date()
  const likedTracks = allTracks
    .slice(0, 15)
    .map((item) => {
      // Random time in the past week
      const randomHours = Math.floor(Math.random() * 168) // 7 days * 24 hours
      const likedAt = new Date(now.getTime() - randomHours * 60 * 60 * 1000)

      return {
        ...item.track,
        liked_at: likedAt.toISOString(),
      }
    })
    .sort((a, b) => new Date(b.liked_at).getTime() - new Date(a.liked_at).getTime())

  return likedTracks
}

// Simulate fetching a user's followed artists and playlists
export async function getUserFollowed(userId: string, accessToken: string): Promise<any[]> {
  // In a real app, we would use the /me/following and /me/playlists endpoints
  // But since those require user authentication, we'll use a workaround

  // For artists, we'll get artists from the user's playlist tracks
  const playlists = await getUserPlaylists(userId, accessToken)

  // Get some random playlists to use for "followed playlists"
  const randomPlaylists = playlists
    .filter((playlist) => playlist.owner.id.toLowerCase() !== userId.toLowerCase())
    .sort(() => 0.5 - Math.random())
    .slice(0, 5)
    .map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      type: "playlist",
      images: playlist.images,
      external_urls: playlist.external_urls,
      owner: playlist.owner,
      followers: playlist.followers,
      description: playlist.description,
      followed_at: new Date(Date.now() - Math.floor(Math.random() * 168) * 60 * 60 * 1000).toISOString(),
    }))

  // Get tracks from a few user playlists to extract artists
  const userPlaylists = playlists.filter((playlist) => playlist.owner.id.toLowerCase() === userId.toLowerCase())
  const tracksPromises = userPlaylists.slice(0, 2).map((playlist) => getPlaylistTracks(playlist.id, accessToken))

  const playlistTracksArrays = await Promise.all(tracksPromises)
  const allTracks = playlistTracksArrays.flat()

  // Extract unique artists
  const artistsMap = new Map()
  allTracks.forEach((item) => {
    item.track.artists.forEach((artist) => {
      if (!artistsMap.has(artist.id)) {
        artistsMap.set(artist.id, {
          ...artist,
          type: "artist",
          followed_at: new Date(Date.now() - Math.floor(Math.random() * 168) * 60 * 60 * 1000).toISOString(),
        })
      }
    })
  })

  // Get artist details for a few random artists
  const randomArtists = Array.from(artistsMap.values())
    .sort(() => 0.5 - Math.random())
    .slice(0, 8)

  // Fetch additional artist details where possible
  const artistDetailsPromises = randomArtists.map(async (artist) => {
    try {
      const response = await fetch(`${SPOTIFY_API_BASE}/artists/${artist.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        next: { revalidate: CACHE_DURATION },
      })

      if (response.ok) {
        const artistDetails = await response.json()
        return {
          ...artist,
          images: artistDetails.images,
          followers: artistDetails.followers,
          genres: artistDetails.genres,
        }
      }
      return artist
    } catch (error) {
      console.error(`Failed to fetch details for artist ${artist.id}:`, error)
      return artist
    }
  })

  const artistsWithDetails = await Promise.all(artistDetailsPromises)

  // Combine artists and playlists and sort by followed_at
  const followed = [...artistsWithDetails, ...randomPlaylists].sort(
    (a, b) => new Date(b.followed_at).getTime() - new Date(a.followed_at).getTime(),
  )

  return followed
}

// Check if a track was added within the current week
export function wasAddedThisWeek(addedAt: string): boolean {
  const now = new Date()
  const trackDate = new Date(addedAt)
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(now.getDate() - 7)

  return trackDate >= oneWeekAgo
}

// Get day category for a track
export function getDayCategory(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  // Reset hours to compare just the dates
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const yesterdayDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())

  if (dateDay.getTime() === todayDay.getTime()) {
    return "Today"
  } else if (dateDay.getTime() === yesterdayDay.getTime()) {
    return "Yesterday"
  } else {
    // Return day name for other days this week
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[date.getDay()]
  }
}
