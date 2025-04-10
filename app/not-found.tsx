import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Music } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-lavender-50/50 to-lavender-100/30 dark:from-background dark:via-lavender-950/10 dark:to-lavender-900/20 px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-lavender-100 dark:bg-lavender-800/40 rounded-full p-3">
            <Music className="h-6 w-6 text-lavender-600 dark:text-lavender-300" />
          </div>
        </div>
        <h1 className="text-xl font-bold mb-2">User Not Found</h1>
        <p className="text-muted-foreground text-sm mb-6">
          We couldn't find this friend or their music. Maybe check the username and try again?
        </p>
        <Link href="/">
          <Button className="bg-lavender-500 hover:bg-lavender-600 dark:bg-lavender-600 dark:hover:bg-lavender-700 text-white rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
