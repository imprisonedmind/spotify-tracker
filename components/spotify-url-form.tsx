// components/forms/SpotifyUrlForm.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Loader2 } from "lucide-react"

/**
 * Extracts Spotify User ID from various input formats (URL, URI, username).
 * @param input - The user input string.
 * @returns The extracted Spotify User ID or the original input if no pattern matches.
 */
function extractSpotifyUserId(input: string): string {
  const trimmedInput = input.trim()

  // Regex for standard user URL: https://open.spotify.com/user/userId?si=...
  const urlMatch = trimmedInput.match(/open\.spotify\.com\/user\/([^/?]+)/)
  if (urlMatch?.[1]) {
    return urlMatch[1]
  }

  // Regex for Spotify URI: spotify:user:userId
  const uriMatch = trimmedInput.match(/spotify:user:([^:]+)/)
  if (uriMatch?.[1]) {
    return uriMatch[1]
  }

  // Assume it's a plain username if no other pattern matches
  // Basic validation: disallow spaces, ensure it's not empty
  if (trimmedInput.length > 0 && !/\s/.test(trimmedInput)) {
    return trimmedInput
  }

  // Return original input (or handle as error) if not identifiable
  return trimmedInput
}

export function SpotifyUrlForm() {
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // Clear previous errors

    const userId = extractSpotifyUserId(inputValue)

    if (!userId) {
      setError("Please enter a valid Spotify username or profile URL.")
      return
    }

    setIsLoading(true)

    // Navigate to the user page. The page itself will handle fetching and errors.
    // Using encodeURIComponent ensures the userId is safely passed in the URL.
    router.push(`/user/${encodeURIComponent(userId)}`)

    // We don't typically need to setIsLoading(false) here because of the navigation,
    // unless there's a chance navigation fails client-side before triggering.
    // For simplicity, we assume navigation succeeds or the target page handles loading/errors.
  }

  return (
      <Card className="border border-lavender-200 dark:border-lavender-800/40 shadow-md bg-white/90 dark:bg-background/90 backdrop-blur-sm rounded-2xl">
        <CardContent className="pt-4 pb-4">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-start">
                <div className="relative flex-1">
                  <Input
                      type="text"
                      placeholder="Spotify username or profile URL"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className={`pr-10 h-10 bg-transparent border-lavender-200 dark:border-lavender-700/40 rounded-xl pl-3 ${
                          error ? "border-red-500 dark:border-red-400" : ""
                      }`}
                      aria-label="Spotify username or profile URL"
                      aria-describedby={error ? "input-error" : undefined}
                      disabled={isLoading}
                  />
                </div>
                <Button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="h-10 bg-lavender-500 hover:bg-lavender-600 dark:bg-lavender-600 dark:hover:bg-lavender-700 text-white rounded-xl shrink-0 px-3"
                    aria-label="Find user"
                >
                  {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                      <>
                        <Search className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Find</span>
                      </>
                  )}
                </Button>
              </div>
              {error && (
                  <p id="input-error" className="text-xs text-red-600 dark:text-red-400 ml-1">
                    {error}
                  </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
  )
}