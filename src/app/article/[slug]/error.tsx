"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "../../error.module.css";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ArticleError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Article page error:", error);
  }, [error]);

  return (
    <main className={styles.errorPage} id="article-error-page">
      <div className={`${styles.bgGlow} ${styles.bgGlowError}`} />
      <div className={`${styles.bgGlow} ${styles.bgGlowAccent}`} />

      <div className={styles.content}>
        <span className={styles.icon}>📰</span>
        <h1 className={styles.title}>Article Unavailable</h1>
        <p className={styles.description}>
          We couldn&apos;t load this article right now. It may have been moved
          or there&apos;s a temporary issue. Please try again.
        </p>

        <div className={styles.actions}>
          <button className={styles.retryBtn} onClick={reset}>
            🔄 Try Again
          </button>
          <Link href="/" className={styles.homeLink}>
            🏠 Browse Articles
          </Link>
        </div>
      </div>
    </main>
  );
}
