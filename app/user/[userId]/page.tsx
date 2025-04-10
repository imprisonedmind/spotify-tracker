// FILE: app/user/[userId]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata, ResolvingMetadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UserProfileDisplay } from "@/components/user-profile";
import { TracksView } from "@/components/tracks-view";
import { TabsSkeleton } from "@/components/skeletons/tabs-skeleton";
import { SectionSkeleton } from "@/components/skeletons/section-skeleton";
import { fetchUserData, fetchUserProfileForMeta } from "./actions";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { hideAds } from "@/lib/utils";
import { recordSitemapPath } from "@/lib/supabase/sitemap"; // Correct import

interface UserTracksPageProps {
  params: { userId: string };
}

// generateMetadata remains the same

export default async function UserTracksPage({ params }: UserTracksPageProps) {
  const awaitedParams = await params;
  const userId = decodeURIComponent(awaitedParams.userId);

  let profileData;
  try {
    profileData = await fetchUserData(userId);
  } catch (error) {
    console.error(`Error fetching primary data for user ${userId}:`, error);
    notFound();
  }

  const { profile, recentTracks } = profileData;

  if (!profile) {
    console.warn(
      `Profile data was unexpectedly null for user ${userId} after successful fetch.`,
    );
    notFound();
  }

  // Extract primary profile image URL
  const profileImageUrl = profile.images?.[0]?.url ?? null;

  // Record sitemap path *with* the image URL
  const currentPath = `/user/${encodeURIComponent(userId)}`;
  recordSitemapPath(currentPath, profileImageUrl).catch((error) => {
    // Pass image URL here
    console.warn(
      `Failed to record profile visit for sitemap (user: ${userId}, path: ${currentPath}):`,
      error,
    );
  });

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-4">
        {/* Back Button */}
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

        {/* Ads */}
        {!hideAds && (
          <div className="mb-6">
            <AdPlaceholder type="banner" />
          </div>
        )}

        {/* Profile */}
        <UserProfileDisplay profile={profile} />

        {/* Tracks */}
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

        {/* Ads */}
        {!hideAds && (
          <div className="mt-8 flex justify-center">
            <AdPlaceholder type="square" />
          </div>
        )}
      </div>
    </div>
  );
}
