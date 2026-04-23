// ─── SEO Utilities ───────────────────────────────────
// JSON-LD structured data, Open Graph, and meta helpers

import { SITE_NAME, SITE_URL } from "./constants";
import type { ArticleWithCategory } from "@/types";

/**
 * Generate JSON-LD NewsArticle structured data
 */
export function generateArticleJsonLd(article: ArticleWithCategory) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    image: article.thumbnailUrl
      ? [article.thumbnailUrl]
      : [`${SITE_URL}/images/default-thumbnail.jpg`],
    datePublished: new Date(article.publishedAt).toISOString(),
    dateModified: new Date(article.updatedAt).toISOString(),
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/article/${article.slug}`,
    },
    articleSection: article.category.name,
    keywords: article.keywords.join(", "),
    inLanguage: "en-IN",
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate WebSite structured data for homepage
 */
export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Your daily dose of tech news — India-focused, AI-powered, always fresh.",
    inLanguage: "en-IN",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Estimate reading time from content
 */
export function estimateReadTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
