import { SpotifyUrlForm } from "@/components/spotify-url-form"
import { Headphones } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-lavender-50/50 to-lavender-100/30 dark:from-background dark:via-lavender-950/10 dark:to-lavender-900/20 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-lavender-100 dark:bg-lavender-800/40 rounded-full p-3">
              <Headphones className="h-6 w-6 text-lavender-600 dark:text-lavender-300" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-lavender-600 to-peach-500 dark:from-lavender-400 dark:to-peach-300">
            Friend Beats
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            See what your friends are adding to their playlists and discover new music through their tastes
          </p>
        </div>
        <SpotifyUrlForm />

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Enter any Spotify username to see their recent playlist additions
          </p>
        </div>
      </div>
    </div>
  )
}
