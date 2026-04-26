// ─── News Cron Worker ────────────────────────────────
// Standalone cron worker process managed by PM2.
// Runs the full scrape → rewrite → publish pipeline
// every 30 minutes between 6am–6pm IST.

import "dotenv/config";
import cron from "node-cron";
import { prisma } from "../lib/db";
import { fetchRSSFeed } from "../lib/rss";
import { scrapeArticle } from "../lib/scraper";
import { checkDuplicate, checkUrlExists, generateTitleHash } from "../lib/duplicate";
import { rewriteArticle } from "../lib/gemini";
import { generateThumbnail } from "../lib/image-gen";
import {
  CRON_START_HOUR,
  CRON_END_HOUR,
  CRON_INTERVAL_MINUTES,
  DEFAULT_CATEGORIES,
} from "../lib/constants";

function log(message: string): void {
  console.log(`[${new Date().toISOString()}] [CronWorker] ${message}`);
}

/**
 * Get or create a category by slug.
 * Looks up the category in the DB; creates it from DEFAULT_CATEGORIES if missing.
 */
async function getOrCreateCategory(categorySlug: string): Promise<string> {
  const slug = categorySlug.toLowerCase();

  // Try to find existing category
  const existing = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (existing) return existing.id;

  // Find matching default category for the display name
  const defaultCat = DEFAULT_CATEGORIES.find((c) => c.slug === slug);
  const name = defaultCat?.name || slug.charAt(0).toUpperCase() + slug.slice(1);

  // Create the category
  const created = await prisma.category.create({
    data: { name, slug },
    select: { id: true },
  });
  log(`📁 Created category: ${name} (${slug})`);
  return created.id;
}

/**
 * Ensure a unique slug by appending a numeric suffix if needed.
 */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Process a single RSS item through the full pipeline:
 * Duplicate check → Scrape → Rewrite → SEO → Image → Save
 *
 * Returns true if article was published, false if skipped.
 */
async function processArticle(item: {
  title: string;
  link: string;
  pubDate?: string;
  source?: string;
}): Promise<boolean> {
  const { title, link } = item;

  try {
    // 1. Check URL duplicate
    const urlExists = await checkUrlExists(link);
    if (urlExists) {
      log(`⏭️ URL already exists: ${link}`);
      return false;
    }

    // 2. Check title duplicate
    const dupCheck = await checkDuplicate(title);
    if (dupCheck.isDuplicate) {
      log(`⏭️ Duplicate: "${title}" (${dupCheck.reason})`);
      return false;
    }

    // 3. Scrape the article content
    const scrapeResult = await scrapeArticle(link);
    if (!scrapeResult.success || scrapeResult.wordCount < 50) {
      log(`⏭️ Scrape failed or too short for: "${title}"`);
      return false;
    }

    // 4. Rewrite with Gemini AI (single call: article + SEO metadata)
    const aiResult = await rewriteArticle(scrapeResult.content, title);

    // 5. Get category-based thumbnail (no API call — static images)
    const thumbnailUrl = await generateThumbnail(aiResult.title, aiResult.slug, aiResult.category);

    // 6. Get or create category
    const categoryId = await getOrCreateCategory(aiResult.category);

    // 7. Ensure unique slug
    const uniqueSlug = await ensureUniqueSlug(aiResult.slug);

    // 8. Save to database
    const article = await prisma.article.create({
      data: {
        title: aiResult.title,
        slug: uniqueSlug,
        excerpt: aiResult.excerpt,
        content: aiResult.content,
        originalTitle: title,
        originalUrl: link,
        sourceHash: generateTitleHash(title),
        metaTitle: aiResult.metaTitle,
        metaDescription: aiResult.metaDescription,
        keywords: aiResult.keywords,
        thumbnailUrl,
        categoryId,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    log(`🎉 Published: "${article.title}" → /article/${article.slug}`);
    return true;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    log(`❌ Failed to process "${title}": ${errMsg}`);
    return false;
  }
}

/**
 * Main pipeline: fetch RSS → process each item → log results.
 */
async function runPipeline(): Promise<void> {
  const startTime = Date.now();
  log("🚀 ═══════════════════════════════════════════");
  log("🚀 Starting news scrape pipeline...");
  log("🚀 ═══════════════════════════════════════════");

  let articlesFound = 0;
  let articlesAdded = 0;
  let duplicatesSkipped = 0;
  let errorMessage: string | null = null;

  try {
    // Fetch RSS feed
    const rssItems = await fetchRSSFeed(15);
    articlesFound = rssItems.length;
    log(`📡 Fetched ${articlesFound} RSS items`);

    // Process each item sequentially (to respect rate limits)
    for (const item of rssItems) {
      try {
        const published = await processArticle(item);
        if (published) {
          articlesAdded++;
        } else {
          duplicatesSkipped++;
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        log(`⚠️ Item error: ${errMsg}`);
        duplicatesSkipped++;
      }

      // Small delay between articles to be respectful
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error);
    log(`❌ Pipeline error: ${errorMessage}`);
  }

  const duration = Math.round((Date.now() - startTime) / 1000);

  // Log results to ScrapeLog table
  try {
    await prisma.scrapeLog.create({
      data: {
        status: errorMessage ? (articlesAdded > 0 ? "PARTIAL" : "FAILED") : "SUCCESS",
        articlesFound,
        articlesAdded,
        duplicatesSkipped,
        errorMessage,
        duration,
      },
    });
  } catch (logError) {
    log(`⚠️ Failed to save scrape log: ${logError}`);
  }

  log("📊 ═══════════════════════════════════════════");
  log(`📊 Pipeline complete in ${duration}s`);
  log(`📊 Found: ${articlesFound} | Added: ${articlesAdded} | Skipped: ${duplicatesSkipped}`);
  if (errorMessage) log(`📊 Error: ${errorMessage}`);
  log("📊 ═══════════════════════════════════════════");
}

/**
 * Check if current IST hour is within operating window.
 */
function isWithinOperatingHours(): boolean {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000);
  const hour = istTime.getHours();
  return hour >= CRON_START_HOUR && hour < CRON_END_HOUR;
}

// ─── Start the cron job ─────────────────────────────
log("⏰ Prisom — News Cron Worker starting...");
log(`⏰ Schedule: Every ${CRON_INTERVAL_MINUTES} min, ${CRON_START_HOUR}:00–${CRON_END_HOUR}:00 IST`);

// Run every CRON_INTERVAL_MINUTES minutes
const cronExpression = `*/${CRON_INTERVAL_MINUTES} * * * *`;

cron.schedule(cronExpression, async () => {
  if (!isWithinOperatingHours()) {
    log("💤 Outside operating hours (6am–6pm IST), skipping...");
    return;
  }
  await runPipeline();
}, {
  timezone: "Asia/Kolkata",
});

log("✅ Cron job scheduled. Waiting for next tick...");

// Run immediately on startup (if within operating hours)
if (isWithinOperatingHours()) {
  log("🔥 Within operating hours — running initial pipeline...");
  runPipeline().catch((err) => log(`❌ Initial pipeline error: ${err}`));
} else {
  log("💤 Outside operating hours. Will start at 6:00 AM IST.");
}
