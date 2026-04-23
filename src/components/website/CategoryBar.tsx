"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./CategoryBar.module.css";

const CATEGORIES = [
  { name: "All", slug: "", icon: "🔥" },
  { name: "Smartphones", slug: "smartphones", icon: "📱" },
  { name: "AI", slug: "ai", icon: "🤖" },
  { name: "Startups", slug: "startups", icon: "🚀" },
  { name: "Gadgets", slug: "gadgets", icon: "🎧" },
  { name: "Apps", slug: "apps", icon: "📲" },
  { name: "Gaming", slug: "gaming", icon: "🎮" },
];

interface CategoryBarProps {
  activeCategory?: string;
}

export default function CategoryBar({ activeCategory }: CategoryBarProps) {
  const pathname = usePathname();

  return (
    <div className={styles.wrapper} id="category-bar">
      <div className={styles.scrollContainer}>
        {CATEGORIES.map((cat) => {
          const href = cat.slug ? `/category/${cat.slug}` : "/";
          const isActive = cat.slug
            ? activeCategory === cat.slug
            : pathname === "/" && !activeCategory;

          return (
            <Link
              key={cat.slug}
              href={href}
              className={`${styles.chip} ${isActive ? styles.chipActive : ""}`}
            >
              <span className={styles.chipIcon}>{cat.icon}</span>
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
