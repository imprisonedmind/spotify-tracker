import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton"
import { TabsSkeleton } from "@/components/skeletons/tabs-skeleton"
import { SectionSkeleton } from "@/components/skeletons/section-skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="flex items-center mb-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-lavender-600 hover:text-lavender-700 hover:bg-lavender-100 dark:text-lavender-400 dark:hover:bg-lavender-900/30 h-8 px-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="text-xs">Back</span>
            </Button>
          </Link>
        </div>

        <ProfileSkeleton />
        <TabsSkeleton />
        <SectionSkeleton count={5} />
      </div>
    </div>
  )
}
