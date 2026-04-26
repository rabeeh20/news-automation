// ─── TypeScript Type Definitions ─────────────────────

import type {
  Article,
  Category,
  ScrapeLog,
  SiteSetting,
  ArticleStatus,
  ScrapeStatus,
} from "@/generated/prisma/client";

// Re-export Prisma types for convenience
export type { Article, Category, ScrapeLog, SiteSetting, ArticleStatus, ScrapeStatus };

// ─── API Response Types ─────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ─── Article Types ──────────────────────────────────

export interface ArticleWithCategory extends Article {
  category: Category;
}

export interface ArticleCreateInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  originalTitle: string;
  originalUrl: string;
  sourceHash: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  thumbnailUrl?: string;
  categoryId: string;
  status?: ArticleStatus;
}

// ─── Gemini AI Types ────────────────────────────────

/**
 * Combined AI result — single Gemini call returns both
 * the rewritten article content AND SEO metadata.
 */
export interface ArticleAIResult {
  // Article content
  title: string;
  content: string;
  excerpt: string;
  // SEO metadata
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  category: string;
  slug: string;
}

/** @deprecated Use ArticleAIResult instead */
export type RewrittenArticle = Pick<ArticleAIResult, "title" | "content" | "excerpt">;

/** @deprecated Use ArticleAIResult instead */
export type SEOMetadata = Pick<ArticleAIResult, "metaTitle" | "metaDescription" | "keywords" | "category" | "slug">;

// ─── RSS Feed Types ─────────────────────────────────

export interface RSSItem {
  title: string;
  link: string;
  pubDate?: string;
  contentSnippet?: string;
  source?: string;
}

// ─── Dashboard Stats ────────────────────────────────

export interface DashboardStats {
  totalArticles: number;
  articlesToday: number;
  totalCategories: number;
  lastScrape: ScrapeLog | null;
  articlesByCategory: { name: string; count: number }[];
  recentArticles: ArticleWithCategory[];
}
