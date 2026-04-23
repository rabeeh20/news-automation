import { prisma } from "@/lib/db";
import { ARTICLES_PER_PAGE, SITE_URL } from "@/lib/constants";
import { generateWebsiteJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import CategoryBar from "@/components/website/CategoryBar";
import ArticleGrid from "@/components/website/ArticleGrid";
import AdSlot from "@/components/website/AdSlot";
import styles from "./home.module.css";
import type { ArticleWithCategory } from "@/types";

/* ─── Page Metadata ──────────────────────── */
export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
  },
};

export default async function HomePage() {
  const [articles, totalCount] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
      take: ARTICLES_PER_PAGE,
    }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
  ]);

  const websiteJsonLd = generateWebsiteJsonLd();
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
  ]);

  return (
    <>
      <Header />
      <main id="homepage">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroGradient}>Latest Tech News</span>
              {" "}from India
            </h1>
            <p className={styles.heroSubtitle}>
              Your daily dose of tech — covering smartphones, AI, startups,
              gadgets, apps, and gaming.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Ad: Leaderboard */}
          <div className={styles.adLeaderboard}>
            <AdSlot slot="leaderboard" />
          </div>

          {/* Category Filter */}
          <CategoryBar />

          {/* Article Grid */}
          <ArticleGrid
            initialArticles={articles as ArticleWithCategory[]}
            totalCount={totalCount}
            pageSize={ARTICLES_PER_PAGE}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
