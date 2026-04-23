import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ARTICLES_PER_PAGE, SITE_NAME, SITE_URL } from "@/lib/constants";
import { generateBreadcrumbJsonLd } from "@/lib/seo";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import CategoryBar from "@/components/website/CategoryBar";
import ArticleGrid from "@/components/website/ArticleGrid";
import styles from "./category.module.css";
import type { ArticleWithCategory } from "@/types";

interface CategoryPageProps {
  params: { slug: string };
}

/* ─── Metadata Generation ─────────────── */
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) {
    return { title: "Category Not Found" };
  }

  const categoryUrl = `${SITE_URL}/category/${category.slug}`;

  return {
    title: `${category.name} News — ${SITE_NAME}`,
    description: `Latest ${category.name.toLowerCase()} tech news from India. Stay updated with the newest ${category.name.toLowerCase()} developments, reviews, and insights.`,
    openGraph: {
      title: `${category.name} News — ${SITE_NAME}`,
      description: `Latest ${category.name.toLowerCase()} tech news from India. Stay updated with the newest developments, reviews, and insights.`,
      url: categoryUrl,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary",
      title: `${category.name} News — ${SITE_NAME}`,
      description: `Latest ${category.name.toLowerCase()} tech news from India.`,
    },
    alternates: {
      canonical: categoryUrl,
    },
  };
}

/* ─── Page Component ──────────────────── */
export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) {
    notFound();
  }

  const [articles, totalCount] = await Promise.all([
    prisma.article.findMany({
      where: {
        categoryId: category.id,
        status: "PUBLISHED",
      },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
      take: ARTICLES_PER_PAGE,
    }),
    prisma.article.count({
      where: {
        categoryId: category.id,
        status: "PUBLISHED",
      },
    }),
  ]);

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: category.name, url: `${SITE_URL}/category/${category.slug}` },
  ]);

  return (
    <>
      <Header />
      <main className={styles.categoryPage} id="category-page">
        {/* JSON-LD Breadcrumbs */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />

        {/* Header */}
        <div className={styles.categoryHeader}>
          {/* Breadcrumbs */}
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>{category.name}</span>
          </nav>

          <h1 className={styles.categoryTitle}>
            <span className={styles.categoryTitleGradient}>
              {category.name}
            </span>{" "}
            News
          </h1>
          <p className={styles.categorySubtitle}>
            <span className={styles.articleCount}>{totalCount}</span>{" "}
            {totalCount === 1 ? "article" : "articles"} in {category.name}
          </p>
        </div>

        {/* Category Bar */}
        <div className={styles.mainContent}>
          <CategoryBar activeCategory={category.slug} />

          {/* Article Grid */}
          <ArticleGrid
            initialArticles={articles as ArticleWithCategory[]}
            totalCount={totalCount}
            pageSize={ARTICLES_PER_PAGE}
            category={category.slug}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
