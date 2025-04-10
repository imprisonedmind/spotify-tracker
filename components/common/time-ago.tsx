// components/common/TimeAgo.tsx
"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNowStrict } from "date-fns" // Using date-fns for robust relative time

interface TimeAgoProps {
  dateString: string
  className?: string
}

/**
 * Renders a relative time string (e.g., "5m ago", "2h ago") that updates periodically.
 */
export function TimeAgo({ dateString, className }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState("")

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    const update = () => {
      try {
        const date = new Date(dateString)
        // Add suffix: true adds "ago" automatically
        const formatted = formatDistanceToNowStrict(date, { addSuffix: true })
        setTimeAgo(formatted)
      } catch (error) {
        console.error("Error formatting date for TimeAgo:", dateString, error)
        setTimeAgo("Invalid date") // Fallback for invalid date strings
      }
    }

    update() // Initial update

    // Set up interval to refresh the time string periodically (e.g., every minute)
    intervalId = setInterval(update, 60000)

    // Cleanup interval on component unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [dateString]) // Rerun effect if the date string changes

  return (
      <span className={className} title={new Date(dateString).toLocaleString()}>
      {timeAgo}
    </span>
  )
}