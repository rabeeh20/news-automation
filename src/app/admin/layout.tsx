// ─── Admin Layout ───────────────────────────────────
// Sidebar + Topbar layout wrapper for all admin pages.
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import styles from "./admin.module.css";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/articles", label: "Articles", icon: "📝" },
  { href: "/admin/scraper", label: "Scraper", icon: "🔄" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't show shell on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className={styles.adminRoot}>
      <div className={styles.adminLayout}>
        {/* Sidebar Overlay (mobile) */}
        <div
          className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.sidebarOverlayVisible : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarLogo}>
            <h2>⚡ Prisom</h2>
            <span>Admin</span>
          </div>

          <nav className={styles.sidebarNav}>
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={styles.sidebarIcon}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.sidebarFooter}>
            <Link href="/" className={styles.sidebarLink} target="_blank">
              <span className={styles.sidebarIcon}>🌐</span>
              View Website
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <div className={styles.adminMain}>
          {/* Topbar */}
          <header className={styles.topbar}>
            <h1 className={styles.topbarTitle}>
              {NAV_ITEMS.find((i) =>
                i.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(i.href)
              )?.label || "Admin"}
            </h1>

            <div className={styles.topbarRight}>
              <div className={styles.topbarUser}>
                <div className={styles.topbarAvatar}>A</div>
                <span>{session?.user?.email || "Admin"}</span>
              </div>
              <button
                className={styles.logoutBtn}
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
              >
                Logout
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className={styles.adminContent}>
            {children}
          </main>
        </div>

        {/* Mobile Toggle */}
        <button
          className={styles.mobileToggle}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
