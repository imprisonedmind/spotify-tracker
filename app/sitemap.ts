// FILE: app/sitemap.ts
import type { MetadataRoute } from "next";
import { fetchSitemapPaths, SitemapDbEntry } from "@/lib/supabase/sitemap"; // Import type

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  `http://localhost:${process.env.PORT || 3000}`;

// Optional: Define a primary image for the site/landing page
// Ensure this path points to a valid, accessible image URL
const SITE_IMAGE_URL = `${SITE_URL}/og-image.png`; // Example: Adjust if needed

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // 1. Define static paths
    const staticPaths: MetadataRoute.Sitemap = [
      {
        url: `${SITE_URL}/`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
        // *** FIX: images should be string[] ***
        images: SITE_IMAGE_URL ? [SITE_IMAGE_URL] : undefined,
      },
      // Add other static pages if necessary
    ];

    // 2. Fetch dynamic paths including image URLs
    const dynamicEntriesData: SitemapDbEntry[] = await fetchSitemapPaths();

    // 3. Map dynamic data, ensuring correct image format
    const dynamicEntries: MetadataRoute.Sitemap = dynamicEntriesData.map(
      (entry) => {
        const fullPath = entry.path.startsWith("/")
          ? entry.path
          : `/${entry.path}`;
        // *** FIX: images should be string[] ***
        const entryImages = entry.imageUrl ? [entry.imageUrl] : undefined;

        return {
          url: `${SITE_URL}${fullPath}`,
          lastModified: new Date(), // Consider fetching/using last_visited_at if desired
          changeFrequency: "weekly",
          priority: 0.7,
          // *** FIX: Assign the corrected string array ***
          images: entryImages,
        };
      },
    );

    // 4. Combine static and dynamic entries
    const allEntries = [...staticPaths, ...dynamicEntries];

    return allEntries;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Fallback with correct image format
    return [
      {
        url: `${SITE_URL}/`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
        // *** FIX: images should be string[] ***
        images: SITE_IMAGE_URL ? [SITE_IMAGE_URL] : undefined,
      },
    ];
  }
}
