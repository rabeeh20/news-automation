import styles from "../../loading.module.css";

export default function ArticleLoading() {
  return (
    <div className={styles.loadingPage}>
      {/* Header skeleton */}
      <div className={styles.headerSkeleton}>
        <div className={`${styles.skeleton} ${styles.headerLogo}`} />
        <div className={styles.headerNav}>
          <div className={`${styles.skeleton} ${styles.headerNavItem}`} />
          <div className={`${styles.skeleton} ${styles.headerNavItem}`} />
        </div>
      </div>

      {/* Article skeleton */}
      <div className={styles.articleSkeleton}>
        <div className={`${styles.skeleton} ${styles.articleBreadcrumb}`} />
        <div className={`${styles.skeleton} ${styles.articleCategory}`} />
        <div className={`${styles.skeleton} ${styles.articleTitleSk}`} />
        <div className={`${styles.skeleton} ${styles.articleTitleSk}`} />

        <div className={styles.articleMetaSk}>
          <div className={`${styles.skeleton} ${styles.articleMetaItem}`} />
          <div className={`${styles.skeleton} ${styles.articleMetaItem}`} />
          <div className={`${styles.skeleton} ${styles.articleMetaItem}`} />
        </div>

        <div className={`${styles.skeleton} ${styles.articleImage}`} />

        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`${styles.skeleton} ${styles.articleLine}`} />
        ))}
      </div>
    </div>
  );
}
