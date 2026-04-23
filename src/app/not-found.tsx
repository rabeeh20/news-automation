import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page Not Found — Prisom",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className={styles.notFoundPage} id="not-found-page">
        {/* Background glow effects */}
        <div className={`${styles.bgGlow} ${styles.bgGlowPrimary}`} />
        <div className={`${styles.bgGlow} ${styles.bgGlowAccent}`} />

        <div className={styles.content}>
          <div className={styles.glitchCode}>404</div>
          <h1 className={styles.title}>Page Not Found</h1>
          <p className={styles.description}>
            Oops! The page you&apos;re looking for seems to have wandered off into
            the digital void. It may have been moved, deleted, or never existed.
          </p>

          <div className={styles.actions}>
            <Link href="/" className={styles.homeBtn}>
              🏠 Go Home
            </Link>
          </div>

          <div className={styles.pulseRow}>
            <div className={styles.pulseDot} />
            <div className={styles.pulseDot} />
            <div className={styles.pulseDot} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
