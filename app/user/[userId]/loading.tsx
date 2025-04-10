// app/user/[userId]/loading.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import {ProfileSkeleton} from "@/components/skeletons/profile-skeleton";
import {SectionSkeleton} from "@/components/skeletons/section-skeleton";

// This component defines the loading UI for the user page route segment
export default function UserPageLoading() {
  return (
      <div className="min-h-screen bg-white dark:bg-background animate-pulse">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          {/* Static back button during loading */}
          <div className="flex items-center mb-4">
            <Button
                variant="ghost"
                size="sm"
                className="text-lavender-600 hover:text-lavender-700 hover:bg-lavender-100 dark:text-lavender-400 dark:hover:bg-lavender-900/30 h-8 px-2 pointer-events-none" // Disable interaction
                aria-disabled="true"
                asChild
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="text-xs">Back</span>
              </Link>
            </Button>
          </div>

          {/* Skeleton for the profile section */}
          <ProfileSkeleton />

          {/* Spacer */}
          <div className="my-6 h-px bg-lavender-200 dark:bg-lavender-800/40" />

          {/* Skeleton for the tracks section */}
          <SectionSkeleton count={5} title="Recently Added Tracks" />
        </div>
      </div>
  )
}