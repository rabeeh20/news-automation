"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className={styles.toggle} aria-label="Toggle theme" id="theme-toggle">
        <span className={styles.icon}>🌙</span>
      </button>
    );
  }

  return (
    <button
      className={styles.toggle}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      id="theme-toggle"
    >
      <span className={styles.icon}>
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
