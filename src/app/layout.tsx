import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/website/ThemeProvider";
import "./globals.css";

/* ─── Font Configuration ─────────────────────────── */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

/* ─── Root Metadata ──────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: "Prisom — Latest Tech News, Reviews & Insights",
    template: "%s | Prisom",
  },
  description:
    "Your daily dose of tech news — India-focused, AI-powered, always fresh. Covering smartphones, AI, startups, gadgets, apps, and gaming.",
  keywords: [
    "tech news india",
    "indian tech news",
    "smartphone news",
    "AI news india",
    "startup news",
    "gadget reviews",
    "tech pulse india",
  ],
  authors: [{ name: "Prisom" }],
  creator: "Prisom",
  publisher: "Prisom",
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Prisom",
    title: "Prisom — Latest Tech News, Reviews & Insights",
    description:
      "Your daily dose of tech news — India-focused, AI-powered, always fresh.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prisom",
    description:
      "Your daily dose of tech news — India-focused, AI-powered, always fresh.",
    // creator: "@prisom", // Uncomment when Twitter handle is set up
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Search console verification — fill these when you get the codes
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    // yandex: process.env.YANDEX_VERIFICATION || undefined,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  category: "technology",
};

/* ─── Root Layout ────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
