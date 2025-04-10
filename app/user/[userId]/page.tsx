import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UserProfileDisplay } from "@/components/user-profile";
import { TracksView } from "@/components/tracks-view";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { TabsSkeleton } from "@/components/skeletons/tabs-skeleton";
import { SectionSkeleton } from "@/components/skeletons/section-skeleton";
import { fetchUserData } from "@/app/user/[userId]/actions";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { hideAds } from "@/lib/utils";

interface UserTracksPageProps {
  params: { userId: string };
}

export default async function UserTracksPage({ params }: UserTracksPageProps) {
  const localParams = await params;
  const userId = decodeURIComponent(localParams.userId);

  try {
    const { profile, recentTracks } = await fetchUserData(userId);

    if (!profile) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-white dark:bg-background">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-lavender-600 hover:text-lavender-700 hover:bg-lavender-100 dark:text-lavender-400 dark:hover:bg-lavender-900/30 h-8 px-2"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="text-xs">Back</span>
              </Link>
            </Button>
          </div>

          {/* Top banner ad */}
          {!hideAds ? (
            <div className="mb-6">
              <AdPlaceholder type="banner" />
            </div>
          ) : null}

          <Suspense fallback={<ProfileSkeleton />}>
            <UserProfileDisplay profile={profile} />
          </Suspense>

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
          {!hideAds ? (
            <div className="mt-8 flex justify-center">
              <AdPlaceholder type="square" />
            </div>
          ) : null}
        </div>
      </div>
    );
  } catch (error) {
    console.error(`Error fetching data for user ${userId}:`, error);
    notFound();
  }
}
