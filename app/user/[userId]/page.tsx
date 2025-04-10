// app/user/[userId]/page.tsx
import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { fetchUserData } from "@/lib/spotify/actions/get-user-actions"
import {ProfileSkeleton} from "@/components/skeletons/profile-skeleton";
import {UserProfileDisplay} from "@/components/user-profile";
import {SectionSkeleton} from "@/components/skeletons/section-skeleton";
import {RecentTracksDisplay} from "@/components/recent-tracks-display";

interface UserPageProps {
  params: { userId: string }
}

// This page is a React Server Component by default
export default async function UserPage({ params }: UserPageProps) {
  let userId: string
  const pparams = await params;

  try {
    // Decode the userId from the URL parameter
    userId = decodeURIComponent(pparams.userId)
  } catch (error) {
    console.error("Failed to decode userId parameter:", pparams.userId, error)
    // If decoding fails, it's likely an invalid URL segment
    notFound()
  }

  try {
    // Fetch user data on the server using the server action
    const { profile, recentTracks } = await fetchUserData(userId)

    // Render the page with the fetched data
    return (
        <div className="min-h-screen bg-white dark:bg-background">
          <div className="container mx-auto px-4 py-4 max-w-2xl">
            {/* Navigation back to home */}
            <div className="flex items-center mb-4">
              <Button
                  variant="ghost"
                  size="sm"
                  className="text-lavender-600 hover:text-lavender-700 hover:bg-lavender-100 dark:text-lavender-400 dark:hover:bg-lavender-900/30 h-8 px-2"
                  asChild // Use asChild to render the Link component with Button styles
              >
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span className="text-xs">Back</span>
                </Link>
              </Button>
            </div>

            {/* Display user profile - Suspense isn't strictly needed if data is already fetched,
              but good practice if UserProfileDisplay did its own fetching or was complex. */}
            <Suspense fallback={<ProfileSkeleton />}>
              <UserProfileDisplay profile={profile} />
            </Suspense>

            {/* Spacer */}
            <div className="my-6 h-px bg-lavender-200 dark:bg-lavender-800/40" />

            {/* Display recently added tracks */}
            <Suspense fallback={<SectionSkeleton count={5} title="Recently Added Tracks" />}>
              {/* Pass fetched tracks directly to the display component */}
              <RecentTracksDisplay tracks={recentTracks} />
            </Suspense>
          </div>
        </div>
    )
  } catch (error) {
    // Log the error for server-side observability
    console.error(`[UserPage] Error rendering page for user ${userId}:`, error)

    // Trigger a 404 Not Found page if fetchUserData indicates user not found
    // or for other critical fetch errors.
    if (error instanceof Error && error.message.includes("not found")) {
      notFound()
    }

    // Optionally, render a generic error message component instead of notFound()
    // for non-404 errors if preferred. For now, treat most fetch errors as not found.
    // Re-throw if it's an unexpected server error that shouldn't be a 404.
    if (!(error instanceof Error && error.message.includes("Could not retrieve data"))) {
      // Throwing here leads to Next.js default error page unless error.tsx is defined
      // For now, let's treat Spotify API errors as "not found" for simplicity.
      // throw error;
    }

    // Default to notFound for handled errors from fetchUserData or other issues.
    notFound()
  }
}