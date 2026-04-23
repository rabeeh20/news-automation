// ─── Admin Settings Page ────────────────────────────
"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "../admin.module.css";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success) setSettings(json.data);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateField = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Settings saved successfully");
      } else {
        showToast("Failed to save settings", "error");
      }
    } catch {
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loader}><div className={styles.spinner} /></div>;
  }

  return (
    <>
      <div className={styles.settingsGrid}>
        {/* General Settings */}
        <div className={styles.settingsSection}>
          <h3 className={styles.settingsSectionTitle}>🌐 General</h3>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Site Title</label>
            <input type="text" className={styles.formInput} value={settings.site_title || ""} onChange={(e) => updateField("site_title", e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Site Description</label>
            <textarea className={`${styles.formInput} ${styles.formTextarea}`} value={settings.site_description || ""} onChange={(e) => updateField("site_description", e.target.value)} style={{ minHeight: 80 }} />
          </div>
        </div>

        {/* RSS & Scraping */}
        <div className={styles.settingsSection}>
          <h3 className={styles.settingsSectionTitle}>📡 RSS & Scraping</h3>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>RSS Feed URL</label>
            <input type="url" className={styles.formInput} value={settings.rss_feed_url || ""} onChange={(e) => updateField("rss_feed_url", e.target.value)} />
            <p className={styles.formHint}>Google News RSS feed for Indian tech news</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)" }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Start Hour (IST)</label>
              <input type="number" className={styles.formInput} min={0} max={23} value={settings.cron_start_hour || "6"} onChange={(e) => updateField("cron_start_hour", e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>End Hour (IST)</label>
              <input type="number" className={styles.formInput} min={0} max={23} value={settings.cron_end_hour || "18"} onChange={(e) => updateField("cron_end_hour", e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Interval (min)</label>
              <input type="number" className={styles.formInput} min={5} max={120} value={settings.cron_interval_minutes || "30"} onChange={(e) => updateField("cron_interval_minutes", e.target.value)} />
            </div>
          </div>
        </div>

        {/* AI Configuration */}
        <div className={styles.settingsSection}>
          <h3 className={styles.settingsSectionTitle}>🤖 Gemini AI</h3>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Gemini API Key</label>
            <input type="password" className={styles.formInput} value={settings.gemini_api_key || ""} onChange={(e) => updateField("gemini_api_key", e.target.value)} placeholder="••••••••••••••••" />
            <p className={styles.formHint}>Your Google Gemini API key for article rewriting</p>
          </div>
        </div>

        {/* AdSense */}
        <div className={styles.settingsSection}>
          <h3 className={styles.settingsSectionTitle}>💰 Google AdSense</h3>
          <div className={styles.settingsRow}>
            <div>
              <span className={styles.settingsRowLabel}>Enable Ads</span>
              <p className={styles.formHint} style={{ marginTop: 2 }}>Show ads across the website</p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={settings.adsense_enabled === "true"}
                onChange={(e) => updateField("adsense_enabled", e.target.checked ? "true" : "false")}
              />
              <span className={styles.toggleSlider} />
            </label>
          </div>

          <div className={styles.formGroup} style={{ marginTop: "var(--space-4)" }}>
            <label className={styles.formLabel}>Publisher ID</label>
            <input type="text" className={styles.formInput} value={settings.adsense_publisher_id || ""} onChange={(e) => updateField("adsense_publisher_id", e.target.value)} placeholder="ca-pub-xxxxxxxxxx" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Header Ad Slot</label>
              <input type="text" className={styles.formInput} value={settings.adsense_ad_slot_header || ""} onChange={(e) => updateField("adsense_ad_slot_header", e.target.value)} placeholder="Ad slot code" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Sidebar Ad Slot</label>
              <input type="text" className={styles.formInput} value={settings.adsense_ad_slot_sidebar || ""} onChange={(e) => updateField("adsense_ad_slot_sidebar", e.target.value)} placeholder="Ad slot code" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>In-Article Ad Slot</label>
              <input type="text" className={styles.formInput} value={settings.adsense_ad_slot_in_article || ""} onChange={(e) => updateField("adsense_ad_slot_in_article", e.target.value)} placeholder="Ad slot code" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Footer Ad Slot</label>
              <input type="text" className={styles.formInput} value={settings.adsense_ad_slot_footer || ""} onChange={(e) => updateField("adsense_ad_slot_footer", e.target.value)} placeholder="Ad slot code" />
            </div>
          </div>
        </div>

        {/* ads.txt */}
        <div className={styles.settingsSection}>
          <h3 className={styles.settingsSectionTitle}>📄 ads.txt</h3>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>ads.txt Content</label>
            <textarea
              className={`${styles.formInput} ${styles.formTextarea}`}
              value={settings.ads_txt_content || ""}
              onChange={(e) => updateField("ads_txt_content", e.target.value)}
              placeholder="google.com, pub-xxxxxxxxxx, DIRECT, f08c47fec0942fa0"
              style={{ minHeight: 100, fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}
            />
            <p className={styles.formHint}>Content served at /ads.txt for AdSense verification</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: "var(--space-6)", display: "flex", justifyContent: "flex-end" }}>
        <button
          className={`${styles.btn} ${styles.btnPrimary} ${saving ? styles.btnDisabled : ""}`}
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "var(--space-3) var(--space-8)", fontSize: "var(--text-base)" }}
        >
          {saving ? "Saving..." : "💾 Save All Settings"}
        </button>
      </div>

      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
