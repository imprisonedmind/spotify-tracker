import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PromoteSongAd } from "@/components/promote-ad-song";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Friend Beats | Discover What Your Friends Are Listening To",
  description:
    "See what music your friends are adding to their Spotify playlists",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased pb-12`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <PromoteSongAd />
        </ThemeProvider>
      </body>
    </html>
  );
}
