// ─── Thumbnail Generator ─────────────────────────────
// Category-based static thumbnails for articles.
//
// OPTIMIZED: Replaced Gemini Imagen API calls with
// pre-generated category thumbnails. This eliminates
// 1 API call per article (was using imagen-3.0-generate-002).
//
// Each category has a professionally designed thumbnail
// stored in /public/images/categories/.

function log(message: string): void {
  console.log(`[${new Date().toISOString()}] [ImageGen] ${message}`);
}

/**
 * Category → thumbnail mapping.
 * All images are pre-generated and stored in public/images/categories/.
 */
const CATEGORY_THUMBNAILS: Record<string, string> = {
  smartphones: "/images/categories/smartphones.png",
  ai: "/images/categories/ai.png",
  startups: "/images/categories/startups.png",
  gadgets: "/images/categories/gadgets.png",
  apps: "/images/categories/apps.png",
  gaming: "/images/categories/gaming.png",
};

/** Default fallback thumbnail if category is unknown */
const DEFAULT_THUMBNAIL = "/images/categories/gadgets.png";

/**
 * Get the thumbnail URL for an article based on its category.
 *
 * No API calls — instant, deterministic, and free.
 *
 * @param _title - Article title (unused, kept for API compatibility)
 * @param _slug - Article slug (unused, kept for API compatibility)
 * @param category - Article category slug (e.g., "smartphones", "ai")
 * @returns URL path to the category thumbnail image
 */
export async function generateThumbnail(
  _title: string,
  _slug: string,
  category?: string
): Promise<string | null> {
  const cat = (category || "").toLowerCase();
  const thumbnailUrl = CATEGORY_THUMBNAILS[cat] || DEFAULT_THUMBNAIL;

  log(`📸 Assigned thumbnail for category "${cat || "unknown"}": ${thumbnailUrl}`);
  return thumbnailUrl;
}
