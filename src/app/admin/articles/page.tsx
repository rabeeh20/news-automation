// ─── Admin Articles Page ────────────────────────────
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "../admin.module.css";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string;
  category: { name: string; slug: string };
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const CATEGORIES = ["", "smartphones", "ai", "startups", "gadgets", "apps", "gaming"];
const STATUSES = ["", "PUBLISHED", "DRAFT", "ARCHIVED"];

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const fetchArticles = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (status) params.set("status", status);

      const res = await fetch(`/api/admin/articles?${params}`);
      const json = await res.json();
      if (json.success) {
        setArticles(json.data);
        setPagination(json.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  }, [search, category, status]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
        showToast(`Article ${newStatus.toLowerCase()}`);
      }
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        showToast("Article deleted");
      }
    } catch {
      showToast("Failed to delete article", "error");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "PUBLISHED": return styles.badgeSuccess;
      case "DRAFT": return styles.badgeWarning;
      case "ARCHIVED": return styles.badgeNeutral;
      default: return styles.badgeNeutral;
    }
  };

  return (
    <>
      {/* Filters */}
      <div className={styles.filterBar}>
        <input
          type="text"
          className={`${styles.formInput} ${styles.searchInput}`}
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchArticles(1)}
        />
        <select
          className={`${styles.formInput} ${styles.formSelect}`}
          value={category}
          onChange={(e) => { setCategory(e.target.value); }}
          style={{ maxWidth: 180 }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.filter(Boolean).map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <select
          className={`${styles.formInput} ${styles.formSelect}`}
          value={status}
          onChange={(e) => { setStatus(e.target.value); }}
          style={{ maxWidth: 160 }}
        >
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => fetchArticles(1)}>
          Search
        </button>
      </div>

      {/* Table */}
      <div className={styles.card}>
        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.loader}><div className={styles.spinner} /></div>
          ) : articles.length === 0 ? (
            <div className={styles.emptyState}><p>No articles found</p></div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <div className={styles.tableTitle}>{article.title}</div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgePrimary}`}>
                        {article.category.name}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${statusBadge(article.status)}`}>
                        {article.status}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap", color: "var(--admin-text-tertiary)", fontSize: "var(--text-xs)" }}>
                      {formatDate(article.publishedAt)}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                        >
                          Edit
                        </Link>
                        {article.status !== "PUBLISHED" && (
                          <button
                            className={`${styles.btn} ${styles.btnSm} ${styles.btnSuccess}`}
                            onClick={() => handleStatusChange(article.id, "PUBLISHED")}
                          >
                            Publish
                          </button>
                        )}
                        {article.status !== "DRAFT" && (
                          <button
                            className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`}
                            onClick={() => handleStatusChange(article.id, "DRAFT")}
                          >
                            Draft
                          </button>
                        )}
                        {article.status !== "ARCHIVED" && (
                          <button
                            className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`}
                            onClick={() => handleStatusChange(article.id, "ARCHIVED")}
                          >
                            Archive
                          </button>
                        )}
                        <button
                          className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                          onClick={() => handleDelete(article.id, article.title)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={pagination.page <= 1}
              onClick={() => fetchArticles(pagination.page - 1)}
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${pagination.page === p ? styles.pageBtnActive : ""}`}
                  onClick={() => fetchArticles(p)}
                >
                  {p}
                </button>
              );
            })}
            <button
              className={styles.pageBtn}
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchArticles(pagination.page + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
