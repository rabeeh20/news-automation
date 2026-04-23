// ─── App-Wide Constants ─────────────────────────────

export const SITE_NAME = "Prisom";
export const SITE_DESCRIPTION =
  "Your daily dose of tech news — India-focused, AI-powered, always fresh.";
export const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// ─── Categories ─────────────────────────────────────

export const DEFAULT_CATEGORIES = [
  { name: "Smartphones", slug: "smartphones" },
  { name: "AI", slug: "ai" },
  { name: "Startups", slug: "startups" },
  { name: "Gadgets", slug: "gadgets" },
  { name: "Apps", slug: "apps" },
  { name: "Gaming", slug: "gaming" },
] as const;

// ─── Article Settings ───────────────────────────────

export const ARTICLE_MIN_WORDS = 600;
export const ARTICLE_MAX_WORDS = 800;
export const ARTICLES_PER_PAGE = 12;

// ─── Cron Settings ──────────────────────────────────

export const CRON_START_HOUR = Number(process.env.CRON_START_HOUR) || 6;
export const CRON_END_HOUR = Number(process.env.CRON_END_HOUR) || 18;
export const CRON_INTERVAL_MINUTES =
  Number(process.env.CRON_INTERVAL_MINUTES) || 30;

// ─── RSS Feed ───────────────────────────────────────

export const RSS_FEED_URL =
  process.env.RSS_FEED_URL ||
  "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pKVGlnQVAB?gl=IN&hl=en-IN";
