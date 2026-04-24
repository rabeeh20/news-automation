// ─── Article Content Scraper ─────────────────────────
// Scrapes article content from source URLs using
// cheerio + axios for lightweight HTML parsing.
// Strips ads, navigation, and non-article elements.

import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Timestamp-prefixed logger
 */
function log(message: string): void {
  console.log(`[${new Date().toISOString()}] [Scraper] ${message}`);
}

/**
 * Elements to remove before extracting article content.
 * These are common non-article elements found on news sites.
 */
const REMOVE_SELECTORS = [
  "script",
  "style",
  "noscript",
  "iframe",
  "svg",
  "nav",
  "header",
  "footer",
  "aside",
  ".sidebar",
  ".nav",
  ".navigation",
  ".menu",
  ".header",
  ".footer",
  ".ad",
  ".ads",
  ".advertisement",
  ".social-share",
  ".share-buttons",
  ".related-articles",
  ".related-posts",
  ".comments",
  ".comment-section",
  "#comments",
  ".newsletter",
  ".subscribe",
  ".popup",
  ".modal",
  ".cookie",
  ".breadcrumb",
  ".pagination",
  "[role='navigation']",
  "[role='banner']",
  "[role='contentinfo']",
  "[aria-hidden='true']",
  ".wp-block-embed",
  "figure.wp-block-embed",
];

/**
 * Selectors that commonly contain the main article content.
 * Tried in order of specificity — first match wins.
 */
const ARTICLE_SELECTORS = [
  "article .entry-content",
  "article .post-content",
  "article .article-content",
  "article .article-body",
  "article .story-body",
  ".article-body",
  ".article-content",
  ".post-content",
  ".entry-content",
  ".story-body",
  ".story-content",
  '[itemprop="articleBody"]',
  '[data-article-body]',
  ".content-body",
  ".td-post-content",
  ".post-body",
  "article",
  ".article",
  "main",
  "#content",
  ".content",
];

/**
 * Clean extracted text:
 * - Remove excessive whitespace
 * - Remove empty lines
 * - Trim each line
 */
function cleanText(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Result of scraping an article page.
 */
export interface ScrapeResult {
  success: boolean;
  content: string;
  wordCount: number;
  error?: string;
}

// @ts-expect-error - google-news-url-decoder lacks type definitions
import { GoogleDecoder } from "google-news-url-decoder";

/**
 * Scrape article content from a given URL.
 *
 * Strategy:
 * 1. Decode Google News URL if necessary
 * 2. Fetch the page HTML
 * 3. Remove non-article elements (nav, ads, footer, etc.)
 * 4. Try article-specific selectors to find the main content
 * 5. Fallback to <body> text extraction
 * 6. Clean and return the text
 *
 * @param url - The article URL to scrape
 * @returns ScrapeResult with article text content
 */
export async function scrapeArticle(url: string): Promise<ScrapeResult> {
  log(`Scraping article: ${url}`);

  try {
    let finalUrl = url;

    // Decode Google News URLs to get the actual publisher link
    if (url.includes("news.google.com/rss/articles/")) {
      try {
        const decoder = new GoogleDecoder();
        const decoded = await decoder.decode(url);
        if (decoded && decoded.status && decoded.decoded_url) {
          finalUrl = decoded.decoded_url;
          log(`Decoded Google News URL to: ${finalUrl}`);
        }
      } catch (decodeErr) {
        log(`Failed to decode Google News URL, attempting raw URL anyway: ${decodeErr}`);
      }
    }

    // Fetch the page with timeout and browser-like headers
    const response = await axios.get(finalUrl, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate",
      },
      responseType: "text",
    });

    if (typeof response.data !== "string") {
      return {
        success: false,
        content: "",
        wordCount: 0,
        error: "Response is not HTML text",
      };
    }

    const $ = cheerio.load(response.data);

    // Remove non-article elements
    REMOVE_SELECTORS.forEach((selector) => {
      $(selector).remove();
    });

    // Try each article selector in order
    let articleText = "";

    for (const selector of ARTICLE_SELECTORS) {
      const element = $(selector).first();
      if (element.length > 0) {
        // Extract text from paragraphs within the article container
        const paragraphs: string[] = [];
        element.find("p").each((_, el) => {
          const text = $(el).text().trim();
          if (text.length > 20) {
            // Filter out very short fragments
            paragraphs.push(text);
          }
        });

        if (paragraphs.length >= 3) {
          articleText = paragraphs.join("\n\n");
          log(`✅ Found content using selector: "${selector}" (${paragraphs.length} paragraphs)`);
          break;
        }

        // If not enough paragraphs, try raw text extraction
        const rawText = element.text();
        if (rawText.length > 300) {
          articleText = rawText;
          log(`✅ Found content using raw text from: "${selector}"`);
          break;
        }
      }
    }

    // Fallback: extract meta description if content is too short
    if (articleText.length < 200) {
      const metaDescription =
        $('meta[name="description"]').attr("content") ||
        $('meta[property="og:description"]').attr("content") ||
        "";

      const metaTitle =
        $("title").text() ||
        $('meta[property="og:title"]').attr("content") ||
        "";

      if (metaDescription) {
        articleText = `${metaTitle}\n\n${metaDescription}`;
        log(`⚠️ Using meta description as fallback content`);
      }
    }

    // Final fallback: get all body text
    if (articleText.length < 100) {
      articleText = $("body").text();
      log(`⚠️ Using full body text as last resort fallback`);
    }

    // Clean the text
    const cleaned = cleanText(articleText);
    const wordCount = cleaned.split(/\s+/).length;

    log(`📊 Scraped ${wordCount} words from: ${url}`);

    if (wordCount < 50) {
      return {
        success: false,
        content: cleaned,
        wordCount,
        error: `Content too short: only ${wordCount} words extracted`,
      };
    }

    return {
      success: true,
      content: cleaned,
      wordCount,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    log(`❌ Scrape failed for ${url}: ${errMsg}`);

    return {
      success: false,
      content: "",
      wordCount: 0,
      error: errMsg,
    };
  }
}
