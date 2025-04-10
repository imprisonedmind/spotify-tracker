import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { fetchUserData } from "@/lib/spotify-actions" // Assuming this fetches data based on userId
import { UserProfileDisplay } from "@/components/user-profile"
import { TracksView } from "@/components/tracks-view"
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton"
import { TabsSkeleton } from "@/components/skeletons/tabs-skeleton"
import { SectionSkeleton } from "@/components/skeletons/section-skeleton"

interface UserTracksPageProps {
  params: { userId: string }
}

// We define the Page component as async to fetch server-side data
export default async function UserTracksPage({ params }: UserTracksPageProps) {
  // Decode the userId safely within the async function scope
  // Note: Awaiting params is not strictly necessary here as it's passed directly,
  // but accessing its properties should ideally happen within the async flow.
  // The error likely stems from static analysis expecting this pattern.
  const localParams = await params;
  const userId = decodeURIComponent(localParams.userId)

  try {
    // Fetch user data on the server
    const { profile, recentTracks, recentListens, recentLikes, recentFollows } = await fetchUserData(userId)

    // If fetchUserData indicates not found (e.g., by returning null profile or throwing specific error),
    // we should ideally trigger notFound() here. Assuming fetchUserData throws for errors.
    if (!profile) {
      notFound();
    }

    return (
        <div className="min-h-screen bg-white dark:bg-background">
          <div className="container mx-auto px-4 py-4 max-w-2xl">
            <div className="flex items-center mb-4">
              {/* Simple back navigation */}
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

            {/* Display user profile with Suspense boundary */}
            <Suspense fallback={<ProfileSkeleton />}>
              {/* UserProfileDisplay likely fetches its own data or accepts it via props.
                Passing profile directly makes it a pure presentation component. */}
              <UserProfileDisplay profile={profile} />
            </Suspense>

            {/* Display user tracks/activity tabs with Suspense boundary */}
            <Suspense
                fallback={
                  <>
                    <TabsSkeleton />
                    <SectionSkeleton count={5} />
                  </>
                }
            >
              {/* TracksView displays various track lists fetched on the server */}
              <TracksView
                  recentTracks={recentTracks}
                  recentListens={recentListens}
                  recentLikes={recentLikes}
                  recentFollows={recentFollows}
              />
            </Suspense>
          </div>
        </div>
    )
  } catch (error) {
    // Log the error for server-side observability
    console.error(`Error fetching data for user ${userId}:`, error)
    // Trigger a 404 Not Found page if data fetching fails (e.g., user doesn't exist or API error)
    // Consider more specific error handling if needed (e.g., distinguishing 404 from 500)
    notFound()
  }
}

// Note: Added `asChild` to the Back Button for proper Link integration.
// Refined error handling to call notFound() within the try block if profile is null/undefined,
// assuming fetchUserData handles non-existent users gracefully.
// Ensured userId decoding happens within the async function scope.