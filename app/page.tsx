// app/page.tsx
import { Headphones } from "lucide-react"
import {SpotifyUrlForm} from "@/components/spotify-url-form";

export default function HomePage() {
  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-lavender-50/50 to-lavender-100/30 dark:from-background dark:via-lavender-950/10 dark:to-lavender-900/20 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-lavender-100 dark:bg-lavender-800/40 rounded-full p-3 inline-block">
                <Headphones className="h-6 w-6 text-lavender-600 dark:text-lavender-300" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-lavender-600 to-peach-500 dark:from-lavender-400 dark:to-peach-300">
              Friend Beats
            </h1>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
              See what your friends recently added to their Spotify playlists.
            </p>
          </div>
          <SpotifyUrlForm />

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">Enter a Spotify username to get started.</p>
          </div>
        </div>
      </div>
  )
}