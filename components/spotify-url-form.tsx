"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, Music } from "lucide-react";

export function SpotifyUrlForm() {
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!spotifyUrl) return;

    setIsLoading(true);

    try {
      // Extract user ID from URL
      let userId = spotifyUrl;

      // Handle full URLs
      if (spotifyUrl.includes("spotify.com/user/")) {
        const match = spotifyUrl.match(/spotify\.com\/user\/([^/?]+)/);
        if (match && match[1]) {
          userId = match[1];
        }
      }

      router.push(`/user/${encodeURIComponent(userId)}`);
    } catch (error) {
      console.error("Error processing URL:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-lavender-200 dark:border-lavender-800/40 shadow-lg bg-white/90 dark:bg-background/90 backdrop-blur-sm rounded-2xl">
      <CardContent className="pt-5 pb-5">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Music className="h-4 w-4 text-lavender-800/60" />
              </div>
              <Input
                type="text"
                placeholder="Find a friend (Spotify link or username)"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                className="pl-10 pr-4 h-11 border-lavender-200 dark:border-lavender-700/40 rounded-lg bg-lavender-700/5 placeholder:text-lavender-800/60 focus:!outline-lavender-700 "
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 px-4 bg-gradient-to-r from-lavender-500 to-lavender-600 hover:from-lavender-600 hover:to-lavender-700 dark:from-lavender-600 dark:to-lavender-700 dark:hover:from-lavender-700 dark:hover:to-lavender-800 text-white rounded-lg shadow-md"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              <span>Find</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
