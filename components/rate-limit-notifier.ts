// FILE: components/rate-limit-notifier.tsx
"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface RateLimitNotifierProps {
  /** Flag indicating if a rate limit error occurred during data fetching */
  isRateLimited: boolean;
}

/**
 * A client component that displays a toast notification when a rate limit
 * error is detected via the `isRateLimited` prop. Includes logging.
 */
export function RateLimitNotifier({ isRateLimited }: RateLimitNotifierProps) {
  // Log the received prop value every time this component renders on the client
  console.log(
    `[RateLimitNotifier] Rendering. isRateLimited prop: ${isRateLimited}`,
  );

  useEffect(() => {
    // Log when the effect attempts to run
    console.log(
      `[RateLimitNotifier] useEffect triggered. isRateLimited value inside effect: ${isRateLimited}`,
    );

    if (isRateLimited) {
      // Log right before calling toast
      console.log(
        "[RateLimitNotifier] Rate limit detected (isRateLimited is true). Calling toast.error().",
      );
      toast.error("Spotify API Limit Reached", {
        description: "Could not load all data. Please try again in a moment.",
        duration: 6000, // Show for 6 seconds
        id: "rate-limit-toast", // Add an ID for potential debugging/styling
      });
    }
  }, [isRateLimited]); // Effect runs when isRateLimited changes or on initial mount if true

  // This component does not render any visible UI itself
  return null;
}
