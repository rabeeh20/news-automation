"use client";

import { useState } from "react";
import styles from "./ShareButtons.module.css";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * Use the native Web Share API on mobile devices for a native sharing UX.
   * Falls back silently if the API is unavailable (desktop browsers).
   */
  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled or share failed — do nothing
      }
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className={styles.wrapper} id="share-buttons">
      <span className={styles.label}>Share:</span>
      <div className={styles.buttons}>
        {/* Native Share (mobile only) */}
        {hasNativeShare && (
          <button
            onClick={nativeShare}
            className={`${styles.btn} ${styles.btnNative}`}
            aria-label="Share"
            title="Share"
          >
            📤
          </button>
        )}

        {/* WhatsApp — most popular on mobile in India */}
        <a
          href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.btn} ${styles.btnWhatsapp}`}
          aria-label="Share on WhatsApp"
          title="Share on WhatsApp"
        >
          💬
        </a>

        {/* Twitter/X */}
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.btn} ${styles.btnTwitter}`}
          aria-label="Share on Twitter"
          title="Share on Twitter"
        >
          𝕏
        </a>

        {/* LinkedIn */}
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.btn} ${styles.btnLinkedin}`}
          aria-label="Share on LinkedIn"
          title="Share on LinkedIn"
        >
          in
        </a>

        {/* Copy Link */}
        <div className={styles.tooltip}>
          <button
            onClick={copyLink}
            className={`${styles.btn} ${styles.btnCopy}`}
            aria-label="Copy link"
            title="Copy link"
          >
            {copied ? "✓" : "🔗"}
          </button>
          {copied && <span className={styles.tooltipText}>Copied!</span>}
        </div>
      </div>
    </div>
  );
}
