// FILE: lib/supabase/sitemap.ts
import { createClient } from "@supabase/supabase-js";

// Ensure environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseServiceRoleKey) {
  throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

const SITEMAP_TABLE = "sitemap_entries";

/**
 * Represents a single entry retrieved for sitemap generation.
 */
export interface SitemapDbEntry {
  path: string;
  imageUrl: string | null; // Added image_url
  // last_visited_at could also be fetched if needed for lastModified
}

/**
 * Records a visited path and its associated image URL in the sitemap registry.
 * Uses upsert to add/update the entry based on the path.
 *
 * @param path - The relative URL path (e.g., /user/some-user-id).
 * @param imageUrl - Optional URL of the primary image for this path.
 */
export async function recordSitemapPath(
  path: string,
  imageUrl?: string | null, // Accept optional image URL
): Promise<void> {
  if (!path || typeof path !== "string" || !path.startsWith("/")) {
    console.warn("recordSitemapPath: Invalid path provided.", { path });
    return;
  }

  const { error } = await supabaseAdmin
    .from(SITEMAP_TABLE)
    .upsert(
      {
        path: path,
        last_visited_at: new Date().toISOString(),
        image_url: imageUrl || null, // Store image URL or null
      },
      { onConflict: "path" },
    )
    .select("path") // Select minimal data
    .single();

  if (error) {
    console.error(
      `Error recording sitemap path "${path}" with image:`,
      error.message,
    );
    // Decide whether to throw or just log
  }
}

/**
 * Fetches all unique paths and their associated image URLs for the sitemap.
 *
 * @returns {Promise<SitemapDbEntry[]>} A promise resolving to an array of sitemap entries.
 */
export async function fetchSitemapPaths(): Promise<SitemapDbEntry[]> {
  const { data, error } = await supabaseAdmin
    .from(SITEMAP_TABLE)
    .select("path, image_url") // Select both path and image_url
    .order("last_visited_at", { ascending: false }); // Optional ordering

  if (error) {
    console.error("Error fetching sitemap paths:", error.message);
    return []; // Return empty on error
  }

  // Ensure data is an array and map to the expected structure
  // Add type assertion for safety if needed, or runtime check
  return Array.isArray(data)
    ? data.map((entry) => ({
        path: entry.path,
        imageUrl: entry.image_url,
      }))
    : [];
}
