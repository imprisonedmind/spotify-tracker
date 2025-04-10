"use client"

import { useState, ElementType } from "react"
import { PlusCircle, Clock, Heart, Users } from "lucide-react"
import clsx from "clsx" // Using clsx for conditional classes clarity

// Define the view types and their configurations
export type ViewType = "adds" | "listens" | "likes" | "follows"

interface ToggleButtonConfig {
  type: ViewType
  icon: ElementType
  labelLong: string
  labelShort: string
}

const toggleButtonsConfig: ToggleButtonConfig[] = [
  { type: "adds", icon: PlusCircle, labelLong: "Recent Adds", labelShort: "Adds" },
  { type: "listens", icon: Clock, labelLong: "Recent Listens", labelShort: "Listens" },
  { type: "likes", icon: Heart, labelLong: "Recently Liked", labelShort: "Likes" },
  { type: "follows", icon: Users, labelLong: "Recently Followed", labelShort: "Follows" },
]

// --- Subcomponents ---

interface ToggleButtonProps {
  config: ToggleButtonConfig
  isActive: boolean
  onClick: (view: ViewType) => void
}

/**
 * Renders a single toggle button within the ViewToggle group.
 */
function ToggleButton({ config, isActive, onClick }: ToggleButtonProps) {
  const { type, icon: Icon, labelLong, labelShort } = config

  const buttonClasses = clsx(
      "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
      {
        "bg-white dark:bg-background shadow-sm text-lavender-700 dark:text-lavender-300": isActive,
        "text-muted-foreground hover:text-lavender-600 dark:hover:text-lavender-400": !isActive,
      }
  )

  return (
      <button onClick={() => onClick(type)} className={buttonClasses}>
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{labelLong}</span>
        <span className="sm:hidden">{labelShort}</span>
      </button>
  )
}

/**
 * Renders the skeleton state for the ViewToggle component.
 */
function ViewToggleSkeleton() {
  return (
      <div className="flex justify-between p-1 bg-lavender-50 dark:bg-lavender-900/30 rounded-xl mb-4">
        {/* Render placeholders matching the number of actual buttons */}
        {toggleButtonsConfig.map((config) => (
            <div key={config.type} className="py-1.5 px-3 mx-0.5 rounded-lg w-20 sm:w-28"> {/* Approx width */}
              <div className="h-5 w-full animate-pulse bg-white/50 dark:bg-background/50 rounded"/>
            </div>
        ))}
      </div>
  )
}


// --- Main Component ---

interface ViewToggleProps {
  onToggle: (view: ViewType) => void
  initialView?: ViewType
  isLoading?: boolean
}

/**
 * A client component allowing users to toggle between different view types (adds, listens, likes, follows).
 * Manages the active state and renders toggle buttons.
 */
export function ViewToggle({ onToggle, initialView = "adds", isLoading = false }: ViewToggleProps) {
  const [activeView, setActiveView] = useState<ViewType>(initialView)

  const handleToggle = (view: ViewType) => {
    setActiveView(view)
    onToggle(view)
  }

  if (isLoading) {
    return <ViewToggleSkeleton />
  }

  return (
      <div className="flex justify-between p-2 bg-lavender-50 dark:bg-lavender-900/30 rounded-xl mb-4">
        {toggleButtonsConfig.map((config) => (
            <ToggleButton
                key={config.type}
                config={config}
                isActive={activeView === config.type}
                onClick={handleToggle}
            />
        ))}
      </div>
  )
}