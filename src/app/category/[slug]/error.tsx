"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "../../error.module.css";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CategoryError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Category page error:", error);
  }, [error]);

  return (
    <main className={styles.errorPage} id="category-error-page">
      <div className={`${styles.bgGlow} ${styles.bgGlowError}`} />
      <div className={`${styles.bgGlow} ${styles.bgGlowAccent}`} />

      <div className={styles.content}>
        <span className={styles.icon}>📂</span>
        <h1 className={styles.title}>Category Unavailable</h1>
        <p className={styles.description}>
          We couldn&apos;t load this category right now. Please try again or
          browse other categories from the homepage.
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
