import { Music, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PromoteSongAd() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-lavender-500 to-peach-500 dark:from-lavender-700 dark:to-peach-700 p-2 shadow-lg">
      <div className="container mx-auto max-w-6xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 dark:bg-black/20 rounded-full p-1.5">
            <Music className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-white text-xs font-medium">
              Promote your music here
            </p>
            <p className="text-white/80 text-[10px]">
              Reach thousands of music lovers
            </p>
          </div>
        </div>
        <Link href={"/advertise"}>
          <Button
            size="sm"
            className="bg-white hover:bg-white/90 text-lavender-700 text-xs h-8 rounded-full px-3"
          >
            <span>Learn More</span>
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
