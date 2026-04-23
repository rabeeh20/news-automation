import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { generateBreadcrumbJsonLd } from "@/lib/seo";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import styles from "../static.module.css";

const pageUrl = `${SITE_URL}/pages/disclaimer`;

export const metadata: Metadata = {
  title: `Disclaimer — ${SITE_NAME}`,
  description: "Disclaimer for Prisom. Understand our AI-powered content process and editorial transparency.",
  openGraph: {
    title: `Disclaimer — ${SITE_NAME}`,
    description: "Disclaimer for Prisom. Understand our AI-powered content process.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: `Disclaimer — ${SITE_NAME}`,
    description: "Understand Prisom's AI-powered content process and editorial transparency.",
  },
  alternates: {
    canonical: pageUrl,
  },
};

export default function DisclaimerPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Disclaimer", url: pageUrl },
  ]);

  return (
    <>
      <Header />
      <main className={styles.page} id="disclaimer-page">
        {/* Breadcrumb JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />

        <div className={styles.pageHeader}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>Disclaimer</span>
          </nav>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageGradient}>Disclaimer</span>
          </h1>
          <p className={styles.pageSubtitle}>
            Transparency about our content and editorial process.
          </p>
        </div>
        <div className={styles.content}>
          <p className={styles.lastUpdated}>Last updated: April 2026</p>

          <div className={styles.highlightBox}>
            <p><strong>⚠️ Important:</strong> Prisom uses AI-powered technology to curate, rewrite, and present tech news. While we strive for accuracy, please verify critical information from original sources.</p>
          </div>

          <h2>1. AI-Generated Content</h2>
          <p>Prisom utilizes artificial intelligence (Google Gemini) to process, rewrite, and present tech news articles. Our AI system:</p>
          <ul>
            <li>Sources news from reputable RSS feeds and publications</li>
            <li>Rewrites articles to provide unique, original content</li>
            <li>Generates SEO-optimized titles, descriptions, and metadata</li>
            <li>Creates thumbnail images for articles</li>
          </ul>
          <p>While our AI is designed to produce accurate and informative content, it may occasionally contain errors, outdated information, or inaccuracies.</p>

          <h2>2. Editorial Disclaimer</h2>
          <p>The information provided on Prisom is for general informational purposes only. We make no representations or warranties about the completeness, accuracy, reliability, or suitability of any information on the Site.</p>

          <h2>3. Not Financial or Professional Advice</h2>
          <p>Content on this Site should not be construed as financial, investment, legal, or professional advice. Always consult qualified professionals before making decisions based on information found here.</p>

          <h2>4. Product Information</h2>
          <p>Product specifications, prices (including INR conversions), availability, and launch dates mentioned in our articles are based on information available at the time of writing and may change without notice.</p>

          <h2>5. Third-Party Links</h2>
          <p>Our Site may contain links to third-party websites. We have no control over the content or practices of these sites and are not responsible for their privacy policies or content.</p>

          <h2>6. Affiliate Disclaimer</h2>
          <p>Some links on our Site may be affiliate links. If you make a purchase through these links, we may earn a commission at no additional cost to you. This does not influence our editorial content.</p>

          <h2>7. Copyright</h2>
          <p>All content on Prisom is original, AI-rewritten content. We respect intellectual property rights. If you believe any content infringes your copyright, please contact us at <a href="mailto:legal@prisom.live">legal@prisom.live</a>.</p>

          <h2>8. Contact</h2>
          <p>Questions about this disclaimer? <Link href="/pages/contact">Contact us</Link>.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
