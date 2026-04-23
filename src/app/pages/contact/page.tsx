import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { generateBreadcrumbJsonLd } from "@/lib/seo";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import styles from "../static.module.css";

const pageUrl = `${SITE_URL}/pages/contact`;

export const metadata: Metadata = {
  title: `Contact Us — ${SITE_NAME}`,
  description:
    "Get in touch with Prisom. Send us tips, feedback, advertising inquiries, or partnership proposals.",
  openGraph: {
    title: `Contact Us — ${SITE_NAME}`,
    description: "Get in touch with Prisom for tips, feedback, or inquiries.",
    url: pageUrl,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: `Contact Us — ${SITE_NAME}`,
    description: "Get in touch with Prisom for tips, feedback, or inquiries.",
  },
  alternates: {
    canonical: pageUrl,
  },
};

export default function ContactPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: "Contact", url: pageUrl },
  ]);

  return (
    <>
      <Header />
      <main className={styles.page} id="contact-page">
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
            <span className={styles.breadcrumbCurrent}>Contact</span>
          </nav>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageGradient}>Contact</span> Us
          </h1>
          <p className={styles.pageSubtitle}>
            Have a tip, feedback, or inquiry? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.featureGrid}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>📧 Email</h3>
              <p className={styles.infoCardText}>
                For general inquiries and feedback:
                <br />
                <a href="mailto:contact@prisom.live">
                  contact@prisom.live
                </a>
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>📰 News Tips</h3>
              <p className={styles.infoCardText}>
                Got a breaking tech story?
                <br />
                <a href="mailto:tips@prisom.live">
                  tips@prisom.live
                </a>
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>💼 Advertising</h3>
              <p className={styles.infoCardText}>
                For advertising and partnership inquiries:
                <br />
                <a href="mailto:ads@prisom.live">
                  ads@prisom.live
                </a>
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoCardTitle}>🐛 Report an Issue</h3>
              <p className={styles.infoCardText}>
                Found a bug or inaccuracy?
                <br />
                <a href="mailto:support@prisom.live">
                  support@prisom.live
                </a>
              </p>
            </div>
          </div>

          <h2>Send Us a Message</h2>
          <form className={styles.form} id="contact-form">
            <div className={styles.formGroup}>
              <label htmlFor="contact-name" className={styles.formLabel}>
                Your Name
              </label>
              <input
                type="text"
                id="contact-name"
                name="name"
                className={styles.formInput}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contact-email" className={styles.formLabel}>
                Email Address
              </label>
              <input
                type="email"
                id="contact-email"
                name="email"
                className={styles.formInput}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contact-subject" className={styles.formLabel}>
                Subject
              </label>
              <input
                type="text"
                id="contact-subject"
                name="subject"
                className={styles.formInput}
                placeholder="What's this about?"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contact-message" className={styles.formLabel}>
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                className={`${styles.formInput} ${styles.formTextarea}`}
                placeholder="Your message..."
                required
              />
            </div>

            <button type="submit" className={styles.formSubmit} id="contact-submit">
              Send Message ✉️
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
