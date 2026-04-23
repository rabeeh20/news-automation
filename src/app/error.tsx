"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "./error.module.css";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <main className={styles.errorPage} id="error-page">
      <div className={`${styles.bgGlow} ${styles.bgGlowError}`} />
      <div className={`${styles.bgGlow} ${styles.bgGlowAccent}`} />

      <div className={styles.content}>
        <span className={styles.icon}>⚠️</span>
        <h1 className={styles.title}>Something Went Wrong</h1>
        <p className={styles.description}>
          We encountered an unexpected error while loading this page. Don&apos;t
          worry — our team has been notified. Please try again or head back to
          the homepage.
        </p>

        <div className={styles.actions}>
          <button className={styles.retryBtn} onClick={reset}>
            🔄 Try Again
          </button>
          <Link href="/" className={styles.homeLink}>
            🏠 Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
