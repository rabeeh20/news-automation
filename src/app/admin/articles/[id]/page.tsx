// ─── Admin Edit Article Page ────────────────────────
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../../admin.module.css";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  thumbnailUrl: string | null;
  categoryId: string;
  status: string;
  category: Category;
}

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchArticle = useCallback(async () => {
    try {
      const [artRes, catRes] = await Promise.all([
        fetch(`/api/admin/articles/${articleId}`),
        fetch("/api/categories"),
      ]);
      const artJson = await artRes.json();
      const catJson = await catRes.json();

      if (artJson.success) {
        const a = artJson.data;
        setArticle(a);
        setTitle(a.title);
        setExcerpt(a.excerpt);
        setContent(a.content);
        setMetaTitle(a.metaTitle);
        setMetaDescription(a.metaDescription);
        setKeywords(a.keywords.join(", "));
        setCategoryId(a.categoryId);
        setStatus(a.status);
        setThumbnailUrl(a.thumbnailUrl || "");
      }

      if (catJson.success) {
        setCategories(catJson.data);
      }
    } catch (err) {
      console.error("Failed to fetch article:", err);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          metaTitle,
          metaDescription,
          keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
          categoryId,
          status,
          thumbnailUrl: thumbnailUrl || null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast("Article saved successfully");
      } else {
        showToast("Failed to save article", "error");
      }
    } catch {
      showToast("Failed to save article", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loader}><div className={styles.spinner} /></div>;
  }

  if (!article) {
    return <div className={styles.emptyState}><p>Article not found</p></div>;
  }

  return (
    <>
      <div style={{ marginBottom: "var(--space-5)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => router.push("/admin/articles")}>
          ← Back
        </button>
        <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Edit Article</h2>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-5)" }}>
          {/* Left Column - Content */}
          <div className={styles.settingsGrid}>
            <div className={styles.settingsSection}>
              <h3 className={styles.settingsSectionTitle}>📝 Content</h3>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Title</label>
                <input type="text" className={styles.formInput} value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Excerpt</label>
                <textarea className={`${styles.formInput} ${styles.formTextarea}`} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} style={{ minHeight: 80 }} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Content (HTML)</label>
                <textarea className={`${styles.formInput} ${styles.formTextarea}`} value={content} onChange={(e) => setContent(e.target.value)} style={{ minHeight: 300, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }} required />
              </div>
            </div>

            <div className={styles.settingsSection}>
              <h3 className={styles.settingsSectionTitle}>🔍 SEO Metadata</h3>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Meta Title ({metaTitle.length}/60)</label>
                <input type="text" className={styles.formInput} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} maxLength={60} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Meta Description ({metaDescription.length}/160)</label>
                <textarea className={`${styles.formInput} ${styles.formTextarea}`} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} maxLength={160} style={{ minHeight: 60 }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Keywords (comma separated)</label>
                <input type="text" className={styles.formInput} value={keywords} onChange={(e) => setKeywords(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className={styles.settingsGrid}>
            <div className={styles.settingsSection}>
              <h3 className={styles.settingsSectionTitle}>⚙️ Settings</h3>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select className={`${styles.formInput} ${styles.formSelect}`} value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category</label>
                <select className={`${styles.formInput} ${styles.formSelect}`} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Thumbnail URL</label>
                <input type="url" className={styles.formInput} value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary} ${saving ? styles.btnDisabled : ""}`}
              style={{ width: "100%", justifyContent: "center", padding: "var(--space-3)" }}
              disabled={saving}
            >
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
