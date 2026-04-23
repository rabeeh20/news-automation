import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { generateBreadcrumbJsonLd } from "@/lib/seo";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import styles from "../static.module.css";

const pageUrl = `${SITE_URL}/pages/privacy`;

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE_NAME}`,
  description: "Privacy Policy for Prisom. Learn how we collect, use, and protect your personal information.",
  openGraph: {
    title: `Privacy Policy — ${SITE_NAME}`,
    description: "Privacy Policy for Prisom. Learn how we collect, use, and protect your data.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: `Privacy Policy — ${SITE_NAME}`,
    description: "Learn how Prisom collects, uses, and protects your personal information.",
  },
  alternates: {
    canonical: pageUrl,
  },
};

export default function PrivacyPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Privacy Policy", url: pageUrl },
  ]);

  return (
    <>
      <Header />
      <main className={styles.page} id="privacy-page">
        {/* Breadcrumb JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />

        <div className={styles.pageHeader}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>Privacy Policy</span>
          </nav>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageGradient}>Privacy</span> Policy
          </h1>
          <p className={styles.pageSubtitle}>Your privacy matters to us.</p>
        </div>
        <div className={styles.content}>
          <p className={styles.lastUpdated}>Last updated: April 2026</p>

          <h2>1. Introduction</h2>
          <p>Welcome to Prisom. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit prisom.live. If you do not agree with the terms of this privacy policy, please do not access the Site.</p>

          <h2>2. Information We Collect</h2>
          <h3>Automatically Collected</h3>
          <ul>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>IP address (anonymized)</li>
            <li>Pages visited and time spent</li>
            <li>Referring website and device type</li>
          </ul>
          <h3>Information You Provide</h3>
          <p>We may collect information you voluntarily provide via our contact form, such as your name, email address, and message content.</p>

          <h2>3. Use of Your Information</h2>
          <ul>
            <li>Operate and maintain our website</li>
            <li>Improve user experience and site performance</li>
            <li>Analyze usage trends and gather demographic information</li>
            <li>Respond to inquiries and provide support</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Third-Party Services</h2>
          <h3>Google AdSense</h3>
          <p>We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior visits. You can opt out at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>
          <h3>Google Analytics</h3>
          <p>We may use Google Analytics to analyze site usage. It collects anonymized data to help us improve our Site.</p>

          <h2>5. Cookies</h2>
          <ul>
            <li><strong>Essential cookies</strong> — Required for website functionality</li>
            <li><strong>Analytics cookies</strong> — Help us understand visitor interactions</li>
            <li><strong>Advertising cookies</strong> — Used by Google AdSense for relevant ads</li>
          </ul>

          <h2>6. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>

          <h2>7. Your Rights</h2>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Object to data processing</li>
            <li>Withdraw consent at any time</li>
          </ul>

          <h2>8. Children&apos;s Privacy</h2>
          <p>Our Site is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>

          <h2>9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.</p>

          <h2>10. Contact Us</h2>
          <div className={styles.highlightBox}>
            <p><strong>Email:</strong> <a href="mailto:privacy@prisom.live">privacy@prisom.live</a><br /><strong>Website:</strong> <Link href="/pages/contact">Contact Form</Link></p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
