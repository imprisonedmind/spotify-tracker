// FILE: lib/errors.ts
/**
 * Custom error class for Spotify API rate limit errors (429).
 */
export class SpotifyRateLimitError extends Error {
  /** Optional seconds suggested by Spotify to wait before retrying */
  retryAfter: number | null;

  constructor(message: string, retryAfter: string | null = null) {
    super(message);
    this.name = "SpotifyRateLimitError";
    this.retryAfter = retryAfter ? parseInt(retryAfter, 10) : null;
    // Maintain prototype chain
    Object.setPrototypeOf(this, SpotifyRateLimitError.prototype);
  }
}

// Consider adding other custom error types if needed (e.g., SpotifyNotFoundError)
