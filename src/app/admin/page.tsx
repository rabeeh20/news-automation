// ─── Admin Dashboard Page ───────────────────────────
"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./admin.module.css";

interface DashboardData {
  totalArticles: number;
  articlesToday: number;
  articlesThisWeek: number;
  totalPublished: number;
  totalDraft: number;
  totalArchived: number;
  articlesByCategory: { name: string; slug: string; count: number }[];
  lastScrapeLog: {
    id: string;
    status: string;
    articlesFound: number;
    articlesAdded: number;
    duplicatesSkipped: number;
    errorMessage: string | null;
    duration: number;
    createdAt: string;
  } | null;
  recentLogs: {
    id: string;
    status: string;
    articlesFound: number;
    articlesAdded: number;
    duration: number;
    createdAt: string;
  }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.emptyState}>
        <p>Failed to load dashboard data</p>
      </div>
    );
  }

  const maxCategoryCount = Math.max(...data.articlesByCategory.map((c) => c.count), 1);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "SUCCESS": return styles.badgeSuccess;
      case "PARTIAL": return styles.badgeWarning;
      case "FAILED": return styles.badgeError;
      default: return styles.badgeNeutral;
    }
  };

  const dotColor = (status: string) => {
    switch (status) {
      case "SUCCESS": return "var(--admin-success)";
      case "PARTIAL": return "var(--admin-warning)";
      case "FAILED": return "var(--admin-error)";
      default: return "var(--admin-text-tertiary)";
    }
  };

  return (
    <>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardLabel}>Total Articles</span>
            <div className={styles.statCardIcon} style={{ background: "var(--admin-primary-bg)", color: "var(--admin-primary)" }}>📰</div>
          </div>
          <div className={styles.statCardValue}>{data.totalArticles}</div>
          <div className={styles.statCardSub}>{data.totalPublished} published · {data.totalDraft} draft · {data.totalArchived} archived</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardLabel}>Today</span>
            <div className={styles.statCardIcon} style={{ background: "var(--admin-success-bg)", color: "var(--admin-success)" }}>📈</div>
          </div>
          <div className={styles.statCardValue}>{data.articlesToday}</div>
          <div className={styles.statCardSub}>articles published today</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardLabel}>This Week</span>
            <div className={styles.statCardIcon} style={{ background: "var(--admin-warning-bg)", color: "var(--admin-warning)" }}>📅</div>
          </div>
          <div className={styles.statCardValue}>{data.articlesThisWeek}</div>
          <div className={styles.statCardSub}>articles this week</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardLabel}>Last Scrape</span>
            <div className={styles.statCardIcon} style={{ background: data.lastScrapeLog?.status === "SUCCESS" ? "var(--admin-success-bg)" : "var(--admin-error-bg)", color: data.lastScrapeLog?.status === "SUCCESS" ? "var(--admin-success)" : "var(--admin-error)" }}>🔄</div>
          </div>
          <div className={styles.statCardValue} style={{ fontSize: "var(--text-lg)" }}>
            {data.lastScrapeLog ? (
              <span className={`${styles.badge} ${statusColor(data.lastScrapeLog.status)}`}>
                {data.lastScrapeLog.status}
              </span>
            ) : (
              "No runs"
            )}
          </div>
          <div className={styles.statCardSub}>
            {data.lastScrapeLog
              ? `${formatDate(data.lastScrapeLog.createdAt)} · ${data.lastScrapeLog.duration}s`
              : "Scraper has not run yet"}
          </div>
        </div>
      </div>

      {/* Two-column Grid */}
      <div className={styles.dashboardGrid}>
        {/* Articles by Category */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Articles by Category</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.categoryStats}>
              {data.articlesByCategory.map((cat) => (
                <div key={cat.slug} className={styles.categoryStat}>
                  <span className={styles.categoryStatName}>{cat.name}</span>
                  <div className={styles.categoryStatBar}>
                    <div
                      className={styles.categoryStatFill}
                      style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                  <span className={styles.categoryStatCount}>{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Scrape Logs */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Recent Scrape Logs</span>
          </div>
          <div className={styles.cardBody}>
            {data.recentLogs.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No scrape logs yet</p>
              </div>
            ) : (
              data.recentLogs.map((log) => (
                <div key={log.id} className={styles.logEntry}>
                  <div className={styles.logDot} style={{ background: dotColor(log.status) }} />
                  <span className={styles.logTime}>{formatDate(log.createdAt)}</span>
                  <span className={styles.logDetails}>
                    +{log.articlesAdded} added · {log.articlesFound} found · {log.duration}s
                  </span>
                  <span className={`${styles.badge} ${styles.btnSm} ${statusColor(log.status)}`}>
                    {log.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
