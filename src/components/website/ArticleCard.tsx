import Link from "next/link";
import Image from "next/image";
import styles from "./ArticleCard.module.css";
import type { ArticleWithCategory } from "@/types";

interface ArticleCardProps {
  article: ArticleWithCategory;
  featured?: boolean;
  index?: number;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Generate a descriptive alt tag from the article title and category.
 * Example: "iPhone 16 Review — Smartphones | Prisom"
 */
function generateAltText(article: ArticleWithCategory): string {
  return `${article.title} — ${article.category.name} | Prisom`;
}

export default function ArticleCard({ article, featured = false, index = 0 }: ArticleCardProps) {
  const readTime = estimateReadTime(article.content);
  const altText = generateAltText(article);

  // First card on page 1 (featured) gets priority loading; rest are lazy
  const isPriority = featured && index === 0;

  return (
    <article
      className={`${styles.card} ${featured ? styles.featured : ""}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      id={`article-card-${article.slug}`}
    >
      {/* Thumbnail */}
      <div className={styles.thumbnailWrapper}>
        {article.thumbnailUrl ? (
          <Image
            src={article.thumbnailUrl}
            alt={altText}
            fill
            sizes={
              featured
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className={styles.thumbnail}
            priority={isPriority}
            loading={isPriority ? undefined : "lazy"}
          />
        ) : (
          <Image
            src={`https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80`}
            alt="Technology News Placeholder"
            fill
            sizes={
              featured
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className={styles.thumbnail}
            loading="lazy"
          />
        )}
        <Link
          href={`/category/${article.category.slug}`}
          className={styles.categoryBadge}
        >
          {article.category.name}
        </Link>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <Link href={`/article/${article.slug}`} className={styles.title}>
          {article.title}
        </Link>
        <p className={styles.excerpt}>{article.excerpt}</p>

        {/* Meta */}
        <div className={styles.meta}>
          <span className={styles.date}>
            📅 {formatDate(article.publishedAt)}
          </span>
          <span className={styles.readTime}>
            📖 {readTime} min read
          </span>
        </div>
      </div>
    </article>
  );
}
