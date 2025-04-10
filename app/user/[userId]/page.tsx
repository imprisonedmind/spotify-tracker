// FILE: app/user/[userId]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata, ResolvingMetadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { UserProfileDisplay } from "@/components/user-profile";
import { TracksView } from "@/components/tracks-view";
import { TabsSkeleton } from "@/components/skeletons/tabs-skeleton";
import { SectionSkeleton } from "@/components/skeletons/section-skeleton";
import { fetchUserData, fetchUserProfileForMeta } from "./actions";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { hideAds } from "@/lib/utils";
import { recordSitemapPath } from "@/lib/supabase/sitemap";
import { RateLimitNotifier } from "@/components/rate-limit-notifier";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { UserProfile } from "./types";

interface UserTracksPageProps {
  params: { userId: string };
}

// --- generateMetadata function ---
export async function generateMetadata(
  { params }: UserTracksPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // CORRECT: Await params before accessing userId
  const awaitedParams = await params;
  const userId = decodeURIComponent(awaitedParams.userId);
  const profile = await fetchUserProfileForMeta(userId);

  const previousImages = (await parent).openGraph?.images || [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://friendbeats.com";

  if (!profile) {
    return {
      title: "User Not Found | Friends Beat",
      description: "The requested Spotify user profile could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${profile.display_name || "Spotify User"} on Friends Beat`;
  const description = `See the recent tracks ${profile.display_name || "this user"} added to their Spotify playlists on Friends Beat.`;
  const imageUrl = profile.images?.[0]?.url;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `${siteUrl}/user/${encodeURIComponent(userId)}`,
      images: imageUrl
        ? [
            { url: imageUrl, alt: `${profile.display_name}'s profile picture` },
            ...previousImages,
          ]
        : previousImages,
      type: "profile",
      profile: {
        username: profile.id,
      },
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      images: imageUrl
        ? [{ url: imageUrl, alt: `${profile.display_name}'s profile picture` }]
        : undefined,
    },
  };
}

// --- Main Page Component ---
export default async function UserTracksPage({ params }: UserTracksPageProps) {
  // CORRECT: Await params before accessing userId
  const awaitedParams = await params;
  const userId = decodeURIComponent(awaitedParams.userId);
  let userDataResult;

  try {
    userDataResult = await fetchUserData(userId);
  } catch (error) {
    console.error(`Critical error rendering page for user ${userId}:`, error);
    throw error;
  }

  const profile = userDataResult.profile;
  const recentTracks =
    "recentTracks" in userDataResult ? userDataResult.recentTracks : [];
  const isRateLimited = userDataResult.rateLimited;

  if (!profile && !isRateLimited) {
    console.warn(
      `Reached page render for ${userId}, but profile is unexpectedly missing and not rate limited.`,
    );
    notFound();
  }

  if (profile) {
    const profileImageUrl = profile.images?.[0]?.url ?? null;
    const currentPath = `/user/${encodeURIComponent(userId)}`;
    recordSitemapPath(currentPath, profileImageUrl).catch((error) => {
      console.warn(
        `Failed to record profile visit for sitemap (user: ${userId}, path: ${currentPath}):`,
        error,
      );
    });
  }

  return (
    <>
      <RateLimitNotifier isRateLimited={isRateLimited} />

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

          {/* Profile Section */}
          {profile ? (
            <UserProfileDisplay profile={profile} />
          ) : (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Profile</AlertTitle>
              <AlertDescription>
                The user profile could not be loaded. This might be due to an
                invalid ID or a temporary issue.
              </AlertDescription>
            </Alert>
          )}

          {/* Tracks Section - Conditional Rendering */}
          <div className="mt-6">
            {isRateLimited ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>API Limit Reached</AlertTitle>
                <AlertDescription>
                  Could not load recent tracks due to Spotify API limits. Please
                  try again later. The profile information might still be
                  displayed.
                </AlertDescription>
              </Alert>
            ) : profile ? (
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
            ) : null}
          </div>

          {/* Ads */}
          {!hideAds && (
            <div className="mt-8 flex justify-center">
              <AdPlaceholder type="square" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
