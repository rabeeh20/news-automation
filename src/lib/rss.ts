// ─── RSS Feed Fetcher ────────────────────────────────
// Google News RSS parser for India Tech feed.
// Fetches, parses, and returns structured items from
// Google News RSS with source URL resolution.

import Parser from "rss-parser";
import axios from "axios";
import { RSS_FEED_URL } from "./constants";
import type { RSSItem } from "@/types";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
  customFields: {
    item: [["source", "source"]],
  },
});

/**
 * Timestamp-prefixed logger
 */
function log(message: string): void {
  console.log(`[${new Date().toISOString()}] [RSS] ${message}`);
}

/**
 * Resolve Google News redirect URL to the actual source article URL.
 * Google News links (news.google.com/rss/articles/...) redirect to the real source.
 */
async function resolveGoogleNewsUrl(googleUrl: string): Promise<string> {
  try {
    // Follow redirects to get the final URL
    const response = await axios.head(googleUrl, {
      maxRedirects: 5,
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      validateStatus: (status) => status < 400,
    });
    return response.request?.res?.responseUrl || response.headers?.location || googleUrl;
  } catch {
    // If HEAD fails, try GET with redirect follow
    try {
      const response = await axios.get(googleUrl, {
        maxRedirects: 5,
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        validateStatus: (status) => status < 400,
      });
      return response.request?.res?.responseUrl || googleUrl;
    } catch {
      log(`⚠️ Could not resolve URL: ${googleUrl}`);
      return googleUrl;
    }
  }
}

/**
 * Extract source name from RSS item.
 * Google News RSS includes a <source> element with the publisher name.
 */
function extractSourceName(item: Parser.Item): string {
  // The source field can be a string or an object with _ (text content)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const source = (item as any).source as unknown;
  if (typeof source === "string") return source;
  if (source && typeof source === "object" && "_" in source) {
    return (source as { _: string })._;
  }
  // Fallback: try to extract from link domain
  try {
    const url = new URL(item.link || "");
    return url.hostname.replace("www.", "");
  } catch {
    return "Unknown";
  }
}

/**
 * Fetch and parse Google News RSS feed for India Tech news.
 * Returns an array of RSSItem objects with resolved source URLs.
 *
 * @param maxItems - Maximum number of items to return (default: 15)
 * @returns Promise<RSSItem[]> - Parsed RSS items
 */
export async function fetchRSSFeed(maxItems: number = 15): Promise<RSSItem[]> {
  log(`Fetching RSS feed from: ${RSS_FEED_URL}`);

  try {
    const feed = await parser.parseURL(RSS_FEED_URL);
    log(`Feed fetched: "${feed.title}" — ${feed.items.length} items found`);

    const items: RSSItem[] = [];

    // Process items (limit to maxItems)
    const feedItems = feed.items.slice(0, maxItems);

    for (const item of feedItems) {
      if (!item.title || !item.link) {
        log(`⚠️ Skipping item with missing title or link`);
        continue;
      }

      // Resolve Google News redirect to actual source URL
      const resolvedLink = await resolveGoogleNewsUrl(item.link);

      const rssItem: RSSItem = {
        title: item.title.trim(),
        link: resolvedLink,
        pubDate: item.pubDate || item.isoDate || undefined,
        contentSnippet: item.contentSnippet?.trim() || undefined,
        source: extractSourceName(item),
      };

      items.push(rssItem);
      log(`✅ Parsed: "${rssItem.title}" [${rssItem.source}]`);
    }

    log(`Successfully parsed ${items.length} RSS items`);
    return items;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    log(`❌ Failed to fetch/parse RSS feed: ${errMsg}`);
    throw new Error(`RSS feed fetch failed: ${errMsg}`);
  }
}
