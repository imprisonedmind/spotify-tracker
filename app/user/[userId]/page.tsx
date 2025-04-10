// FILE: app/user/[userId]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata, ResolvingMetadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UserProfileDisplay } from "@/components/user-profile";
import { TracksView } from "@/components/tracks-view";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { TabsSkeleton } from "@/components/skeletons/tabs-skeleton";
import { SectionSkeleton } from "@/components/skeletons/section-skeleton";
import { fetchUserData, fetchUserProfileForMeta } from "./actions";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { hideAds } from "@/lib/utils";

interface UserTracksPageProps {
  params: { userId: string };
}

// Generate dynamic metadata for SEO based on the user's profile
export async function generateMetadata(
  { params }: UserTracksPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const localParams = await params;

  const userId = decodeURIComponent(localParams.userId);

  try {
    const profile = await fetchUserProfileForMeta(userId);

    if (!profile) {
      // Return default metadata or indicate not found if preferred
      // Returning parent metadata avoids overwriting good defaults if user not found
      return {
        title: "User Not Found", // Indicate user not found in title
        description: `Profile page for Spotify user ${userId} could not be loaded.`,
      };
    }

    const previousImages = (await parent).openGraph?.images || [];
    const profileImage = profile.images?.[0]?.url;
    const displayName = profile.display_name || userId; // Fallback to userId if display_name is null

    return {
      title: `${displayName}'s Recent Spotify Activity`,
      description: `See the latest tracks ${displayName} added to their Spotify playlists. Discover what music user ${userId} is listening to.`,
      openGraph: {
        title: `${displayName}'s Recent Spotify Activity | Friend Beats`,
        description: `Explore ${displayName}'s recently added Spotify tracks.`,
        url: `/user/${encodeURIComponent(userId)}`, // Canonical URL for this specific page
        type: "profile", // More specific OG type
        images: profileImage
          ? [{ url: profileImage }, ...previousImages]
          : previousImages, // Prepend profile image if available
      },
      twitter: {
        title: `${displayName}'s Recent Spotify Activity | Friend Beats`,
        description: `Explore ${displayName}'s recently added Spotify tracks.`,
        images: profileImage ? [profileImage] : undefined, // Use profile image for Twitter card
      },
    };
  } catch (error) {
    console.error(
      `Error generating metadata for user ${userId}:`,
      error instanceof Error ? error.message : error,
    );
    // Fallback metadata in case of error during fetch
    return {
      title: "User Profile",
      description: `Profile page for Spotify user ${userId}.`,
    };
  }
}

export default async function UserTracksPage({ params }: UserTracksPageProps) {
  const userId = decodeURIComponent(params.userId);
  let profileData;

  try {
    profileData = await fetchUserData(userId);
  } catch (error) {
    console.error(`Error fetching primary data for user ${userId}:`, error);
    // If the primary data fetch fails, treat as not found.
    // Metadata generation might have already run, but this ensures the page body doesn't attempt render.
    notFound();
  }

  const { profile, recentTracks } = profileData;

  if (!profile) {
    notFound();
  }

  // // Asynchronously record this profile visit for potential sitemap enrichment.
  // // We don't await this or let its failure block the page rendering.
  // recordProfileVisit(userId).catch((error) => {
  //   console.warn(`Failed to record profile visit for ${userId}:`, error);
  // });

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-4">
        <div className="mb-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-lavender-600 hover:bg-lavender-100 hover:text-lavender-700 dark:text-lavender-400 dark:hover:bg-lavender-900/30"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="mr-1 h-4 w-4" />
              <span className="text-xs">Back</span>
            </Link>
          </Button>
        </div>

        {/* Top banner ad */}
        {!hideAds && (
          <div className="mb-6">
            <AdPlaceholder type="banner" />
          </div>
        )}

        {/* Profile section uses fetched data directly */}
        <UserProfileDisplay profile={profile} />

        {/* Tracks section uses Suspense for potentially slower data/rendering */}
        <Suspense
          fallback={
            <>
              <TabsSkeleton />
              <SectionSkeleton count={5} />
            </>
          }
        >
          <TracksView recentTracks={recentTracks} />
        </Suspense>

        {/* Bottom square ad */}
        {!hideAds && (
          <div className="mt-8 flex justify-center">
            <AdPlaceholder type="square" />
          </div>
        )}
      </div>
    </div>
  );
}
