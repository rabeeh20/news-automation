import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  formatDate,
  estimateReadTime,
} from "@/lib/seo";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import ShareButtons from "@/components/website/ShareButtons";
import ArticleCard from "@/components/website/ArticleCard";
import AdSlot from "@/components/website/AdSlot";
import styles from "./article.module.css";
import type { ArticleWithCategory } from "@/types";

interface ArticlePageProps {
  params: { slug: string };
}

/* ─── Metadata Generation ─────────────── */
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!article) {
    return { title: "Article Not Found" };
  }

  const articleUrl = `${SITE_URL}/article/${article.slug}`;

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    keywords: article.keywords,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      url: articleUrl,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "article",
      publishedTime: new Date(article.publishedAt).toISOString(),
      modifiedTime: new Date(article.updatedAt).toISOString(),
      section: article.category.name,
      tags: article.keywords,
      images: article.thumbnailUrl
        ? [
            {
              url: article.thumbnailUrl,
              width: 1200,
              height: 630,
              alt: `${article.title} — ${article.category.name} | ${SITE_NAME}`,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      images: article.thumbnailUrl ? [article.thumbnailUrl] : [],
    },
    alternates: {
      canonical: articleUrl,
    },
  };
}

/* ─── Page Component ──────────────────── */
export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
    include: { category: true },
  });

  if (!article) {
    notFound();
  }

  // Fetch related articles from same category
  const relatedArticles = await prisma.article.findMany({
    where: {
      categoryId: article.categoryId,
      status: "PUBLISHED",
      id: { not: article.id },
    },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const articleUrl = `${SITE_URL}/article/${article.slug}`;
  const readTime = estimateReadTime(article.content);
  const typedArticle = article as ArticleWithCategory;

  // JSON-LD
  const articleJsonLd = generateArticleJsonLd(typedArticle);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: article.category.name, url: `${SITE_URL}/category/${article.category.slug}` },
    { name: article.title, url: articleUrl },
  ]);

  return (
    <>
      <Header />
      <main className={styles.articlePage} id="article-page">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />

        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>›</span>
          <Link
            href={`/category/${article.category.slug}`}
            className={styles.breadcrumbLink}
          >
            {article.category.name}
          </Link>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>{article.title}</span>
        </nav>

        {/* Article Header */}
        <header className={styles.articleHeader}>
          <Link
            href={`/category/${article.category.slug}`}
            className={styles.categoryLink}
          >
            {article.category.name}
          </Link>
          <h1 className={styles.articleTitle}>{article.title}</h1>
          <div className={styles.articleMeta}>
            <span className={styles.metaItem}>
              📅 {formatDate(article.publishedAt)}
            </span>
            <span className={styles.metaItem}>
              📖 {readTime} min read
            </span>
            <span className={styles.metaItem}>
              ✍️ {SITE_NAME}
            </span>
          </div>
          <div className={styles.shareRow}>
            <ShareButtons url={articleUrl} title={article.title} />
          </div>
        </header>

        {/* Thumbnail */}
        {article.thumbnailUrl && (
          <div className={styles.thumbnailWrapper}>
            <Image
              src={article.thumbnailUrl}
              alt={`${article.title} — ${article.category.name} | ${SITE_NAME}`}
              width={720}
              height={405}
              className={styles.thumbnailImage}
              priority
            />
          </div>
        )}

        {/* Ad: Below Title */}
        <div className={styles.adBelowTitle}>
          <AdSlot slot="rectangle" />
        </div>

        {/* Article Body */}
        <article className={styles.articleContent}>
          <div
            className={styles.articleBody}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* Ad: In-Article */}
        <div className={styles.adBelowTitle}>
          <AdSlot slot="in-article" />
        </div>

        {/* Footer: Tags + Share */}
        <div className={styles.articleFooter}>
          {article.keywords.length > 0 && (
            <div className={styles.tagsList}>
              {article.keywords.map((keyword) => (
                <span key={keyword} className={styles.tag}>
                  #{keyword}
                </span>
              ))}
            </div>
          )}

          <ShareButtons url={articleUrl} title={article.title} />

          <div className={styles.footerDivider} />
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>Related Articles</h2>
            <div className={styles.relatedGrid}>
              {relatedArticles.map((related, i) => (
                <ArticleCard
                  key={related.id}
                  article={related as ArticleWithCategory}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}

        {/* Ad: Bottom */}
        <div className={styles.adBottom}>
          <AdSlot slot="leaderboard" />
        </div>
      </main>
      <Footer />
    </>
  );
}
