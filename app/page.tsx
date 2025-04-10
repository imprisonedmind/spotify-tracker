import Link from "next/link";
import { SpotifyUrlForm } from "@/components/spotify-url-form";
import { Headphones, Heart, Music } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-lavender-50/50 to-lavender-100/30 dark:from-background dark:via-lavender-950/10 dark:to-lavender-900/20">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative bg-gradient-to-br from-lavender-100 to-lavender-200 dark:from-lavender-800/40 dark:to-lavender-700/20 rounded-full p-4 shadow-md">
                <Headphones className="h-8 w-8 text-lavender-600 dark:text-lavender-300" />
                <div className="absolute -top-2 right-5">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-peach-500/20 size-6" />
                  <Heart className="absolute inset-1 z-10 size-4 rotate-6 fill-peach-400 text-peach-400" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-lavender-600 to-peach-500 dark:from-lavender-400 dark:to-peach-300">
              Friend Beats
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-2">
              See what your friends are adding to their playlists and discover
              new music through their tastes
            </p>
            <div className="flex justify-center gap-2 mb-6">
              <Badge
                variant="outline"
                className="bg-lavender-50 dark:bg-lavender-900/30"
              >
                <Music className="h-3 w-3 mr-1 text-lavender-500" />
                <span className="text-xs">Recent Adds</span>
              </Badge>
            </div>
          </div>

          <SpotifyUrlForm />

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground mb-3">
              Try these example profiles:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/user/therealhowiie"
                className="text-xs px-3 py-1 rounded-full bg-lavender-100 text-lavender-700 hover:bg-lavender-200 dark:bg-lavender-800/40 dark:text-lavender-300 dark:hover:bg-lavender-700/40 transition-colors"
              >
                luke
              </Link>
              <Link
                href="/user/i551demt6ctuzjgy98w8gy9jh"
                className="text-xs px-3 py-1 rounded-full bg-lavender-100 text-lavender-700 hover:bg-lavender-200 dark:bg-lavender-800/40 dark:text-lavender-300 dark:hover:bg-lavender-700/40 transition-colors"
              >
                micah
              </Link>
              <Link
                href="/user/wriub0zrre37yfxkg661okv2f"
                className="text-xs px-3 py-1 rounded-full bg-lavender-100 text-lavender-700 hover:bg-lavender-200 dark:bg-lavender-800/40 dark:text-lavender-300 dark:hover:bg-lavender-700/40 transition-colors"
              >
                richard
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 border-t border-lavender-200 dark:border-lavender-800/40 bg-white/80 dark:bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}{" "}
            <a
              href="https://lukestephens.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lavender-600 dark:text-lavender-400 hover:underline"
            >
              lukestephens.co.za
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
