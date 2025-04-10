import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PromoteSongAd } from "@/components/promote-ad-song";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

// It's recommended to set metadataBase for resolving social media images
// Replace 'https://yourdomain.com' with your actual production domain
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://friendbeats.com"; // Use an env var or default

export const metadata: Metadata = {
  // Base URL for resolving relative paths, especially for Open Graph images
  metadataBase: new URL(siteUrl),

  // Core metadata
  title: {
    default: "Friend Beats | Discover What Your Friends Are Listening To",
    template: "%s | Friend Beats", // Useful for child pages setting their own title
  },
  description:
    "See what music your friends are adding to their Spotify playlists. Connect your Spotify account and explore the latest tracks your social circle is enjoying.",
  applicationName: "Friend Beats",
  keywords: [
    "music discovery",
    "spotify",
    "friends music",
    "social music",
    "playlists",
    "music sharing",
    "track discovery",
    "new music",
  ],
  authors: [{ name: "Friend Beats Team", url: siteUrl }], // Update with actual author/team info
  generator: "Next.js", // Keep or update as needed, 'v0.dev' might be less standard
  referrer: "origin-when-cross-origin",
  creator: "Friend Beats Team", // Or your company name
  publisher: "Friend Beats", // Or your company name

  // Robots directives for search engines
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Icons
  icons: {
    icon: "/favicon.ico", // Standard favicon
    shortcut: "/favicon-16x16.png", // Legacy shortcut icon
    apple: "/apple-touch-icon.png", // Apple touch icon
    // Consider adding other sizes if needed (e.g., 192x192 for Android)
  },

  // Open Graph (og:) metadata for social sharing (Facebook, LinkedIn, etc.)
  openGraph: {
    title: "Friend Beats | Discover What Your Friends Are Listening To",
    description:
      "See what music your friends are adding to their Spotify playlists.",
    url: siteUrl, // Canonical URL of the page
    siteName: "Friend Beats",
    images: [
      {
        url: "/seo-large.jpg", // Relative path, resolved by metadataBase
        width: 1200, // Corrected standard width for large OG images
        height: 630,
        alt: "Friend Beats - Discover friends' music on Spotify.",
      },
      {
        url: "/seo-small.jpg", // Small variant if needed, though often one is enough
        width: 600,
        height: 315,
        alt: "Friend Beats - Discover friends' music on Spotify.",
      },
    ],
    locale: "en_US",
    type: "website", // Correct type for a landing page
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image", // Use 'summary_large_image' for richer preview
    title: "Friend Beats | Discover What Your Friends Are Listening To",
    description:
      "See what music your friends are adding to their Spotify playlists.",
    siteId: "lukestephens.co.za", // Optional: Your website's Twitter ID
    creator: "@lukey_stephens", // Optional: Your personal/company Twitter handle
    // creatorId: 'YourTwitterCreatorID', // Optional: Your personal/company Twitter ID
    images: [
      {
        url: "/seo-large.jpg", // Use the large image for Twitter Card
        alt: "Friend Beats - Discover friends' music on Spotify.",
      },
    ],
  },

  // Verification (optional, add if needed)
  // verification: {
  //   google: 'YourGoogleSiteVerificationToken',
  //   yandex: 'YourYandexVerificationToken',
  //   other: {
  //     me: ['your-email@example.com', 'your-link'],
  //   },
  // },

  // Optional: Category for the website content
  category: "technology music social",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Added suppressHydrationWarning for ThemeProvider */}
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased pb-12`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light" // Consider 'system' for OS preference
          enableSystem // Add if using defaultTheme='system'
          disableTransitionOnChange
        >
          {children}
          <PromoteSongAd />
        </ThemeProvider>
      </body>
      <Script src="https://scripts.simpleanalyticscdn.com/latest.js" />
    </html>
  );
}
