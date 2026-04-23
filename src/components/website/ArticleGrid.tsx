"use client";

import { useState, useTransition } from "react";
import ArticleCard from "./ArticleCard";
import AdSlot from "./AdSlot";
import styles from "./ArticleGrid.module.css";
import type { ArticleWithCategory } from "@/types";

interface ArticleGridProps {
  initialArticles: ArticleWithCategory[];
  totalCount: number;
  pageSize: number;
  category?: string;
}

export default function ArticleGrid({
  initialArticles,
  totalCount,
  pageSize,
  category,
}: ArticleGridProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const hasMore = articles.length < totalCount;

  const loadMore = () => {
    startTransition(async () => {
      const nextPage = page + 1;
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: String(pageSize),
      });
      if (category) params.set("category", category);

      const res = await fetch(`/api/articles?${params}`);
      const data = await res.json();

      if (data.success && data.data) {
        setArticles((prev) => [...prev, ...data.data]);
        setPage(nextPage);
      }
    });
  };

  if (articles.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📭</div>
        <h3 className={styles.emptyTitle}>No articles found</h3>
        <p className={styles.emptyText}>
          Check back soon — fresh tech news is on the way!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.grid} id="article-grid">
        {articles.map((article, i) => (
          <>
            <ArticleCard
              key={article.id}
              article={article}
              featured={i === 0 && page === 1 && !category}
              index={i}
            />
            {/* In-feed ad after every 6 articles */}
            {(i + 1) % 6 === 0 && i < articles.length - 1 && (
              <AdSlot key={`ad-${i}`} slot="in-feed" className={styles.adSlot} />
            )}
          </>
        ))}
      </div>

      {hasMore && (
        <div className={styles.loadMoreWrapper}>
          <button
            className={styles.loadMoreBtn}
            onClick={loadMore}
            disabled={isPending}
            id="load-more-btn"
          >
            {isPending ? (
              <>
                <span className={styles.spinner} />
                Loading...
              </>
            ) : (
              "Load More Articles"
            )}
          </button>
        </div>
      )}
    </>
  );
}
