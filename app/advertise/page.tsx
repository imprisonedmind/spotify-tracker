import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Twitter,
  Mail,
  Music,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-lavender-50/50 to-lavender-100/30 dark:from-background dark:via-lavender-950/10 dark:to-lavender-900/20">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-lavender-600 hover:text-lavender-700 hover:bg-lavender-100 dark:text-lavender-400 dark:hover:bg-lavender-900/30 h-8 px-2"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="text-xs">Back to Home</span>
            </Link>
          </Button>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 bg-lavender-100 dark:bg-lavender-800/40 rounded-full mb-4">
            <Music className="h-6 w-6 text-lavender-600 dark:text-lavender-300" />
          </div>
          <h1 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-lavender-600 to-peach-500 dark:from-lavender-400 dark:to-peach-300">
            Promote Your Music
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Reach thousands of music enthusiasts and get your songs discovered
            by new listeners
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-10">
          <Card className="bg-white/90 dark:bg-background/90 backdrop-blur-sm border-lavender-200 dark:border-lavender-800/40">
            <CardHeader className="pb-2">
              <div className="bg-lavender-100 dark:bg-lavender-800/40 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-lavender-600 dark:text-lavender-300" />
              </div>
              <CardTitle className="text-base">Targeted Audience</CardTitle>
              <CardDescription>
                Reach music lovers actively discovering new songs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/90 dark:bg-background/90 backdrop-blur-sm border-lavender-200 dark:border-lavender-800/40">
            <CardHeader className="pb-2">
              <div className="bg-peach-100 dark:bg-peach-800/40 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-peach-600 dark:text-peach-300" />
              </div>
              <CardTitle className="text-base">Boost Visibility</CardTitle>
              <CardDescription>
                Get your music in front of potential new fans
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/90 dark:bg-background/90 backdrop-blur-sm border-lavender-200 dark:border-lavender-800/40">
            <CardHeader className="pb-2">
              <div className="bg-mint-100 dark:bg-mint-800/40 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5 text-mint-600 dark:text-mint-300" />
              </div>
              <CardTitle className="text-base">Premium Placement</CardTitle>
              <CardDescription>
                Featured across the Friends Beat platform
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-white/90 dark:bg-background/90 backdrop-blur-sm border-lavender-200 dark:border-lavender-800/40 mb-10">
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>
              Contact me to discuss advertising options and pricing for
              promoting your music
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-lavender-50 dark:bg-lavender-900/20 rounded-lg">
              <Twitter className="h-5 w-5 text-lavender-600 dark:text-lavender-400" />
              <div>
                <p className="font-medium">Twitter</p>
                <a
                  href="https://x.com/lukey_stephens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-lavender-600 dark:text-lavender-400 hover:underline"
                >
                  @lukey_stephens
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-lavender-50 dark:bg-lavender-900/20 rounded-lg">
              <Mail className="h-5 w-5 text-lavender-600 dark:text-lavender-400" />
              <div>
                <p className="font-medium">Email</p>
                <a
                  href="mailto:lukexstephens@gmail.com"
                  className="text-sm text-lavender-600 dark:text-lavender-400 hover:underline"
                >
                  lukexstephens@gmail.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Limited spots available. Contact today to secure your placement!
          </p>
        </div>
      </div>
    </div>
  );
}
