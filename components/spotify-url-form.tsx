"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Loader2 } from "lucide-react"

export function SpotifyUrlForm() {
  const [spotifyUrl, setSpotifyUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!spotifyUrl) return

    setIsLoading(true)

    try {
      // Extract user ID from URL
      let userId = spotifyUrl

      // Handle full URLs
      if (spotifyUrl.includes("spotify.com/user/")) {
        const match = spotifyUrl.match(/spotify\.com\/user\/([^/?]+)/)
        if (match && match[1]) {
          userId = match[1]
        }
      }

      router.push(`/user/${encodeURIComponent(userId)}`)
    } catch (error) {
      console.error("Error processing URL:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border border-lavender-200 dark:border-lavender-800/40 shadow-md bg-white/90 dark:bg-background/90 backdrop-blur-sm rounded-2xl">
      <CardContent className="pt-4 pb-4">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Enter friend's Spotify username"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                className="pr-10 h-10 bg-transparent border-lavender-200 dark:border-lavender-700/40 rounded-xl pl-3"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 bg-lavender-500 hover:bg-lavender-600 dark:bg-lavender-600 dark:hover:bg-lavender-700 text-white rounded-xl"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">Find</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
