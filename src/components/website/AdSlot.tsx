"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./AdSlot.module.css";

/* ─── Types ──────────────────────────────── */
interface AdSlotProps {
  slot: "leaderboard" | "rectangle" | "in-feed" | "in-article" | "sticky";
  className?: string;
}

interface AdSenseConfig {
  enabled: boolean;
  publisherId: string;
  slots: {
    header: string;
    sidebar: string;
    inArticle: string;
    footer: string;
  };
}

/* ─── Slot → AdSense format mapping ──────── */
const SLOT_FORMAT: Record<string, string> = {
  leaderboard: "horizontal",
  rectangle: "rectangle",
  "in-feed": "fluid",
  "in-article": "fluid",
  sticky: "vertical",
};

const SLOT_TO_CONFIG_KEY: Record<string, keyof AdSenseConfig["slots"]> = {
  leaderboard: "header",
  rectangle: "sidebar",
  "in-feed": "header",
  "in-article": "inArticle",
  sticky: "sidebar",
};

const SLOT_LABELS: Record<string, string> = {
  leaderboard: "Advertisement",
  rectangle: "Advertisement",
  "in-feed": "Sponsored",
  "in-article": "Advertisement",
  sticky: "Advertisement",
};

/* ─── Global AdSense cache ───────────────── */
let cachedConfig: AdSenseConfig | null = null;
let configPromise: Promise<AdSenseConfig> | null = null;

async function fetchAdConfig(): Promise<AdSenseConfig> {
  if (cachedConfig) return cachedConfig;
  if (configPromise) return configPromise;

  configPromise = fetch("/api/adsense")
    .then((res) => res.json())
    .then((json) => {
      cachedConfig = json.data || {
        enabled: false,
        publisherId: "",
        slots: {},
      };
      return cachedConfig!;
    })
    .catch(() => {
      cachedConfig = { enabled: false, publisherId: "", slots: {} as AdSenseConfig["slots"] };
      return cachedConfig;
    });

  return configPromise;
}

/* ─── Inject AdSense script once ─────────── */
let scriptInjected = false;
function injectAdSenseScript(publisherId: string) {
  if (scriptInjected || typeof window === "undefined") return;
  scriptInjected = true;

  const script = document.createElement("script");
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
  script.async = true;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}

/* ─── AdSlot Component ───────────────────── */
export default function AdSlot({ slot, className = "" }: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adInitialized = useRef(false);
  const [config, setConfig] = useState<AdSenseConfig | null>(cachedConfig);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch config
  useEffect(() => {
    fetchAdConfig().then(setConfig);
  }, []);

  // Intersection Observer for lazy loading
  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting) {
        setIsVisible(true);
      }
    },
    []
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "200px",
      threshold: 0,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [observerCallback]);

  // Initialize ad when visible and config is ready
  useEffect(() => {
    if (!isVisible || !config?.enabled || !config.publisherId || adInitialized.current) return;

    const slotKey = SLOT_TO_CONFIG_KEY[slot];
    const adSlotId = config.slots[slotKey];
    if (!adSlotId) return;

    injectAdSenseScript(config.publisherId);

    // Push ad
    try {
      adInitialized.current = true;
      ((window as unknown as Record<string, unknown[]>).adsbygoogle =
        (window as unknown as Record<string, unknown[]>).adsbygoogle || []).push({});
    } catch {
      // AdSense not ready yet; that's fine
    }
  }, [isVisible, config, slot]);

  const slotClass = {
    leaderboard: styles.leaderboard,
    rectangle: styles.rectangle,
    "in-feed": styles.inFeed,
    "in-article": styles.inArticle,
    sticky: styles.sticky,
  }[slot];

  // If ads disabled or no config yet, render a minimal placeholder (or nothing)
  if (config && !config.enabled) {
    return null; // No ads to show
  }

  const slotKey = SLOT_TO_CONFIG_KEY[slot];
  const adSlotId = config?.slots[slotKey];

  // If no ad slot configured, show placeholder in dev or nothing in prod
  if (config && !adSlotId) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div
          className={`${styles.adSlot} ${styles.placeholder} ${slotClass} ${className}`}
          role="complementary"
          aria-label="Advertisement"
          id={`ad-slot-${slot}`}
          ref={containerRef}
        >
          {SLOT_LABELS[slot]} — {slot}
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={`${styles.adSlot} ${slotClass} ${className}`}
      role="complementary"
      aria-label="Advertisement"
      id={`ad-slot-${slot}`}
      ref={containerRef}
    >
      {isVisible && config?.publisherId && adSlotId && (
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={config.publisherId}
          data-ad-slot={adSlotId}
          data-ad-format={SLOT_FORMAT[slot] || "auto"}
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
}
