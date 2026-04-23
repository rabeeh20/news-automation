import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { generateBreadcrumbJsonLd } from "@/lib/seo";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import styles from "../static.module.css";

const pageUrl = `${SITE_URL}/pages/about`;

export const metadata: Metadata = {
  title: `About Us — ${SITE_NAME}`,
  description:
    "Learn about Prisom — your daily source for India-focused tech news covering smartphones, AI, startups, gadgets, apps, and gaming.",
  openGraph: {
    title: `About Us — ${SITE_NAME}`,
    description: "Learn about Prisom — your daily source for India-focused tech news.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: `About Us — ${SITE_NAME}`,
    description: "Learn about Prisom — your daily source for India-focused tech news.",
  },
  alternates: {
    canonical: pageUrl,
  },
};

export default function AboutPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "About Us", url: pageUrl },
  ]);

  return (
    <>
      <Header />
      <main className={styles.page} id="about-page">
        {/* Breadcrumb JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />

        {/* Header */}
        <div className={styles.pageHeader}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>About Us</span>
          </nav>
          <h1 className={styles.pageTitle}>
            About <span className={styles.pageGradient}>Prisom</span>
          </h1>
          <p className={styles.pageSubtitle}>
            Your daily dose of tech news — India-focused, AI-powered, always fresh.
          </p>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h2>Who We Are</h2>
          <p>
            Prisom is a modern tech news platform built for Indian tech
            enthusiasts. We deliver the latest news, reviews, and insights across
            smartphones, artificial intelligence, startups, gadgets, apps, and
            gaming — all curated and presented with the Indian consumer in mind.
          </p>

          <h2>Our Mission</h2>
          <p>
            In a world overflowing with information, our mission is simple: deliver
            the most relevant, accurate, and timely tech news to India&apos;s growing
            community of tech-savvy consumers. We believe that technology shapes
            our daily lives, and staying informed about the latest developments
            should be easy, accessible, and enjoyable.
          </p>

          <div className={styles.featureGrid}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>🇮🇳 India-Focused</h3>
              <p className={styles.infoCardText}>
                Every story is curated with Indian consumers in mind — prices in
                INR, local availability, and India launch dates.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>⚡ Always Fresh</h3>
              <p className={styles.infoCardText}>
                We publish fresh content throughout the day, ensuring you never
                miss a breaking tech story.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>🤖 AI-Enhanced</h3>
              <p className={styles.infoCardText}>
                We leverage cutting-edge AI to curate, summarize, and present
                news in an engaging and accessible format.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>📱 All Categories</h3>
              <p className={styles.infoCardText}>
                From smartphones and gadgets to AI, startups, apps, and gaming —
                we cover the full spectrum of tech.
              </p>
            </div>
          </div>

          <h2>What We Cover</h2>
          <ul>
            <li><strong>Smartphones</strong> — Latest launches, reviews, comparisons, and deals</li>
            <li><strong>Artificial Intelligence</strong> — AI developments, tools, and their impact on India</li>
            <li><strong>Startups</strong> — Indian startup ecosystem, funding rounds, and success stories</li>
            <li><strong>Gadgets</strong> — Wearables, accessories, smart home devices, and more</li>
            <li><strong>Apps</strong> — New app launches, updates, tips, and recommendations</li>
            <li><strong>Gaming</strong> — Mobile gaming, PC gaming, consoles, and eSports</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            Have a tip, suggestion, or feedback? We&apos;d love to hear from you.
            Visit our <Link href="/pages/contact">Contact page</Link> to get in touch.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
