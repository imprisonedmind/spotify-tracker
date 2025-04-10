"use client"

import { useState } from "react"
import { PlusCircle, Clock, Heart, Users } from "lucide-react"

type ViewType = "adds" | "listens" | "likes" | "follows"

interface ViewToggleProps {
  onToggle: (view: ViewType) => void
  initialView?: ViewType
  isLoading?: boolean
}

export function ViewToggle({ onToggle, initialView = "adds", isLoading = false }: ViewToggleProps) {
  const [activeView, setActiveView] = useState<ViewType>(initialView)

  const handleToggle = (view: ViewType) => {
    setActiveView(view)
    onToggle(view)
  }

  if (isLoading) {
    return (
      <div className="flex justify-between p-1 bg-lavender-50 dark:bg-lavender-900/30 rounded-xl mb-4">
        {["adds", "listens", "likes", "follows"].map((tab) => (
          <div key={tab} className="py-1.5 px-3 mx-0.5 rounded-lg animate-pulse bg-white/50 dark:bg-background/50" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex justify-between p-1 bg-lavender-50 dark:bg-lavender-900/30 rounded-xl mb-4">
      <button
        onClick={() => handleToggle("adds")}
        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          activeView === "adds"
            ? "bg-white dark:bg-background shadow-sm text-lavender-700 dark:text-lavender-300"
            : "text-muted-foreground hover:text-lavender-600 dark:hover:text-lavender-400"
        }`}
      >
        <PlusCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Recent Adds</span>
        <span className="sm:hidden">Adds</span>
      </button>
      <button
        onClick={() => handleToggle("listens")}
        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          activeView === "listens"
            ? "bg-white dark:bg-background shadow-sm text-lavender-700 dark:text-lavender-300"
            : "text-muted-foreground hover:text-lavender-600 dark:hover:text-lavender-400"
        }`}
      >
        <Clock className="h-4 w-4" />
        <span className="hidden sm:inline">Recent Listens</span>
        <span className="sm:hidden">Listens</span>
      </button>
      <button
        onClick={() => handleToggle("likes")}
        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          activeView === "likes"
            ? "bg-white dark:bg-background shadow-sm text-lavender-700 dark:text-lavender-300"
            : "text-muted-foreground hover:text-lavender-600 dark:hover:text-lavender-400"
        }`}
      >
        <Heart className="h-4 w-4" />
        <span className="hidden sm:inline">Recently Liked</span>
        <span className="sm:hidden">Likes</span>
      </button>
      <button
        onClick={() => handleToggle("follows")}
        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          activeView === "follows"
            ? "bg-white dark:bg-background shadow-sm text-lavender-700 dark:text-lavender-300"
            : "text-muted-foreground hover:text-lavender-600 dark:hover:text-lavender-400"
        }`}
      >
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Recently Followed</span>
        <span className="sm:hidden">Follows</span>
      </button>
    </div>
  )
}
