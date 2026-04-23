import styles from "./loading.module.css";

export default function HomeLoading() {
  return (
    <div className={styles.loadingPage}>
      {/* Header skeleton */}
      <div className={styles.headerSkeleton}>
        <div className={`${styles.skeleton} ${styles.headerLogo}`} />
        <div className={styles.headerNav}>
          <div className={`${styles.skeleton} ${styles.headerNavItem}`} />
          <div className={`${styles.skeleton} ${styles.headerNavItem}`} />
          <div className={`${styles.skeleton} ${styles.headerNavItem}`} />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className={styles.heroSkeleton}>
        <div className={`${styles.skeleton} ${styles.heroTitle}`} />
        <div className={`${styles.skeleton} ${styles.heroSubtitle}`} />
      </div>

      {/* Category bar skeleton */}
      <div className={styles.catBarSkeleton}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${styles.skeleton} ${styles.catItem}`} />
        ))}
      </div>

      {/* Article grid skeleton */}
      <div className={styles.gridSkeleton}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.cardSkeleton}>
            <div className={`${styles.skeleton} ${styles.cardImage}`} />
            <div className={styles.cardBody}>
              <div className={`${styles.skeleton} ${styles.cardTitleLine}`} />
              <div className={`${styles.skeleton} ${styles.cardTitleLine}`} />
              <div className={`${styles.skeleton} ${styles.cardExcerpt}`} />
              <div className={styles.cardMeta}>
                <div className={`${styles.skeleton} ${styles.cardMetaItem}`} />
                <div className={`${styles.skeleton} ${styles.cardMetaItem}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
