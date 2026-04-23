// ─── Admin Scraper Page ─────────────────────────────
"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "../admin.module.css";

interface ScraperStatus {
  isActive: boolean;
  schedule: string;
  currentTimeIST: string;
  nextRunIST: string;
  autoScrapingEnabled: boolean;
  lastRun: {
    status: string;
    articlesFound: number;
    articlesAdded: number;
    duplicatesSkipped: number;
    duration: number;
    createdAt: string;
    errorMessage: string | null;
  } | null;
}

interface LogEntry {
  id: string;
  status: string;
  articlesFound: number;
  articlesAdded: number;
  duplicatesSkipped: number;
  duration: number;
  errorMessage: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

export default function AdminScraperPage() {
  const [status, setStatus] = useState<ScraperStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, totalPages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async (page = 1) => {
    try {
      const [statusRes, logsRes] = await Promise.all([
        fetch("/api/admin/scraper"),
        fetch(`/api/admin/logs?page=${page}&pageSize=15`),
      ]);
      const statusJson = await statusRes.json();
      const logsJson = await logsRes.json();

      if (statusJson.success) setStatus(statusJson.data);
      if (logsJson.success) {
        setLogs(logsJson.data);
        setPagination(logsJson.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch scraper data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const res = await fetch("/api/admin/scraper", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        showToast("Manual scrape triggered");
        fetchData();
      } else {
        showToast("Failed to trigger scrape", "error");
      }
    } catch {
      showToast("Failed to trigger scrape", "error");
    } finally {
      setTriggering(false);
    }
  };

  const handleToggleAutoScraping = async () => {
    const newValue = !status?.autoScrapingEnabled;
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auto_scraping_enabled: String(newValue) }),
      });
      setStatus((prev) => prev ? { ...prev, autoScrapingEnabled: newValue } : null);
      showToast(`Auto-scraping ${newValue ? "enabled" : "disabled"}`);
    } catch {
      showToast("Failed to toggle auto-scraping", "error");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "SUCCESS": return styles.badgeSuccess;
      case "PARTIAL": return styles.badgeWarning;
      case "FAILED": return styles.badgeError;
      default: return styles.badgeNeutral;
    }
  };

  if (loading) {
    return <div className={styles.loader}><div className={styles.spinner} /></div>;
  }

  return (
    <>
      {/* Scraper Controls */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardLabel}>Scraper Status</span>
            <div className={styles.statCardIcon} style={{
              background: status?.isActive ? "var(--admin-success-bg)" : "var(--admin-warning-bg)",
              color: status?.isActive ? "var(--admin-success)" : "var(--admin-warning)",
            }}>
              {status?.isActive ? "🟢" : "🟡"}
            </div>
          </div>
          <div className={styles.statCardValue} style={{ fontSize: "var(--text-lg)" }}>
            {status?.isActive ? "Active" : "Outside Hours"}
          </div>
          <div className={styles.statCardSub}>{status?.schedule}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardLabel}>Last Run</span>
          </div>
          <div className={styles.statCardValue} style={{ fontSize: "var(--text-lg)" }}>
            {status?.lastRun ? (
              <span className={`${styles.badge} ${statusBadge(status.lastRun.status)}`}>
                {status.lastRun.status}
              </span>
            ) : "Never"}
          </div>
          <div className={styles.statCardSub}>
            {status?.lastRun
              ? `${formatDate(status.lastRun.createdAt)} · +${status.lastRun.articlesAdded} · ${status.lastRun.duration}s`
              : "No scrape runs recorded"}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardLabel}>Auto-Scraping</span>
          </div>
          <div className={styles.settingsRow}>
            <span style={{ fontSize: "var(--text-sm)" }}>
              {status?.autoScrapingEnabled ? "Enabled" : "Disabled"}
            </span>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={status?.autoScrapingEnabled ?? true}
                onChange={handleToggleAutoScraping}
              />
              <span className={styles.toggleSlider} />
            </label>
          </div>
        </div>

        <div className={styles.statCard} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button
            className={`${styles.btn} ${styles.btnPrimary} ${triggering ? styles.btnDisabled : ""}`}
            onClick={handleTrigger}
            disabled={triggering}
            style={{ padding: "var(--space-3) var(--space-6)", fontSize: "var(--text-base)" }}
          >
            {triggering ? "Triggering..." : "🚀 Scrape Now"}
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Scrape Logs ({pagination.total} total)</span>
        </div>
        <div className={styles.tableWrap}>
          {logs.length === 0 ? (
            <div className={styles.emptyState}><p>No scrape logs yet</p></div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th>Found</th>
                  <th>Added</th>
                  <th>Skipped</th>
                  <th>Duration</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: "nowrap", fontSize: "var(--text-xs)", color: "var(--admin-text-tertiary)" }}>
                      {formatDate(log.createdAt)}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${statusBadge(log.status)}`}>{log.status}</span>
                    </td>
                    <td>{log.articlesFound}</td>
                    <td style={{ color: "var(--admin-success)" }}>+{log.articlesAdded}</td>
                    <td style={{ color: "var(--admin-text-tertiary)" }}>{log.duplicatesSkipped}</td>
                    <td>{log.duration}s</td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "var(--text-xs)", color: "var(--admin-error)" }}>
                      {log.errorMessage || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pageBtn} disabled={pagination.page <= 1} onClick={() => fetchData(pagination.page - 1)}>← Prev</button>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--admin-text-tertiary)" }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button className={styles.pageBtn} disabled={pagination.page >= pagination.totalPages} onClick={() => fetchData(pagination.page + 1)}>Next →</button>
          </div>
        )}
      </div>

      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
