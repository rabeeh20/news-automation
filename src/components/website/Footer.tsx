import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} id="site-footer">
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.brandLogo}>
              <span className={styles.brandLogoIcon}>⚡</span>
              <span>
                Tech<span className={styles.brandPulse}>Pulse</span>
              </span>
            </Link>
            <p className={styles.brandDesc}>
              Your daily dose of tech news — India-focused, AI-powered, always
              fresh. Covering smartphones, AI, startups, gadgets, apps, and
              gaming.
            </p>
          </div>

          {/* Categories */}
          <div className={styles.linkColumn}>
            <h3 className={styles.linkTitle}>Categories</h3>
            <div className={styles.linkList}>
              <Link href="/category/smartphones" className={styles.linkItem}>Smartphones</Link>
              <Link href="/category/ai" className={styles.linkItem}>AI</Link>
              <Link href="/category/startups" className={styles.linkItem}>Startups</Link>
              <Link href="/category/gadgets" className={styles.linkItem}>Gadgets</Link>
              <Link href="/category/apps" className={styles.linkItem}>Apps</Link>
              <Link href="/category/gaming" className={styles.linkItem}>Gaming</Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.linkColumn}>
            <h3 className={styles.linkTitle}>Quick Links</h3>
            <div className={styles.linkList}>
              <Link href="/" className={styles.linkItem}>Home</Link>
              <Link href="/pages/about" className={styles.linkItem}>About Us</Link>
              <Link href="/pages/contact" className={styles.linkItem}>Contact</Link>
            </div>
          </div>

          {/* Legal */}
          <div className={styles.linkColumn}>
            <h3 className={styles.linkTitle}>Legal</h3>
            <div className={styles.linkList}>
              <Link href="/pages/privacy" className={styles.linkItem}>Privacy Policy</Link>
              <Link href="/pages/disclaimer" className={styles.linkItem}>Disclaimer</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {currentYear} Prisom. All rights reserved.
          </p>
          <div className={styles.bottomLinks}>
            <Link href="/pages/privacy" className={styles.bottomLink}>Privacy</Link>
            <Link href="/pages/disclaimer" className={styles.bottomLink}>Disclaimer</Link>
            <Link href="/sitemap.xml" className={styles.bottomLink}>Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
