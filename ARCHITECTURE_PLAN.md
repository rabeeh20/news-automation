# 🚀 Prisom — Complete Architecture Plan

> Automated Tech News Platform for Indian Consumers

---

## 📋 Project Summary

| Item | Detail |
|------|--------|
| **Brand** | Prisom |
| **Domain** | `prisom.live` (to purchase) |
| **Niche** | Tech News (India-focused, English) |
| **Source** | Google News RSS (India, Tech) |
| **AI Engine** | Google Gemini API |
| **Publishing** | 24 articles/day, every 30 min, 6am–6pm IST |
| **Article Length** | 600–800 words (optimal for SEO + AdSense) |
| **Monetization** | Google AdSense |
| **Target** | Indian tech consumers |
| **Deploy** | AWS EC2 (cost-minimized) |
| **Admin** | Single admin, auto-publish |
| **Theme** | Dark + Light mode |

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend + Backend** | Next.js 14 (App Router) | SSR for SEO, single project, API routes built-in |
| **Language** | TypeScript | Type safety, AI-friendly for vibe coding |
| **Database** | PostgreSQL 16 | Reliable, free on EC2, great for structured news data |
| **ORM** | Prisma | Beginner-friendly, type-safe, auto-migrations |
| **Styling** | Vanilla CSS + CSS Modules | Full control, no dependencies |
| **Cron Scheduler** | node-cron | Lightweight, runs inside the same server |
| **RSS Parser** | rss-parser (npm) | Parses Google News RSS feeds |
| **Web Scraper** | cheerio + axios | Lightweight HTML parsing for article content |
| **AI Rewriting** | @google/generative-ai (Gemini SDK) | Article rewriting + SEO metadata generation |
| **Image Generation** | Gemini Imagen API | Auto-generate article thumbnails |
| **Auth (Admin)** | NextAuth.js (Credentials) | Simple admin login, JWT-based |
| **Process Manager** | PM2 | Keep Next.js + cron worker alive |
| **Reverse Proxy** | Nginx | SSL termination, caching, compression |
| **SSL** | Let's Encrypt (Certbot) | Free HTTPS |

---

## 🔄 System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTOMATED PIPELINE                        │
│                                                             │
│  ⏰ Cron (Every 30 min, 6am-6pm IST)                       │
│    ↓                                                        │
│  📡 Fetch Google News RSS (India, Tech, English)            │
│    ↓                                                        │
│  🔍 Parse 10-15 RSS items                                  │
│    ↓                                                        │
│  🔎 Duplicate Check (title hash + Levenshtein similarity)  │
│    ↓                                                        │
│  📄 Scrape source article content (cheerio + axios)        │
│    ↓                                                        │
│  🤖 Gemini AI: Rewrite article (600-800 words)             │
│    ↓                                                        │
│  🤖 Gemini AI: Generate SEO metadata (title, desc, keys)   │
│    ↓                                                        │
│  🖼️ Gemini Imagen: Generate thumbnail image                │
│    ↓                                                        │
│  💾 Save to PostgreSQL (status: PUBLISHED)                  │
│    ↓                                                        │
│  ✅ Article live on website via SSR                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
news-automation/
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── seed.ts                    # Seed categories + admin user
│   └── migrations/                # Auto-generated
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout (fonts, theme)
│   │   ├── page.tsx               # Homepage (latest articles grid)
│   │   ├── globals.css            # Global styles + design tokens
│   │   │
│   │   ├── article/
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # Individual article page (SSR)
│   │   │
│   │   ├── category/
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # Category listing page
│   │   │
│   │   ├── pages/                 # Static pages
│   │   │   ├── about/page.tsx     # About Us (AdSense requirement)
│   │   │   ├── contact/page.tsx   # Contact (AdSense requirement)
│   │   │   ├── privacy/page.tsx   # Privacy Policy (AdSense requirement)
│   │   │   └── disclaimer/page.tsx
│   │   │
│   │   ├── admin/                 # Admin Panel
│   │   │   ├── layout.tsx         # Admin layout (sidebar, auth guard)
│   │   │   ├── page.tsx           # Dashboard (stats overview)
│   │   │   ├── login/page.tsx     # Admin login
│   │   │   ├── articles/
│   │   │   │   ├── page.tsx       # Article list (edit/delete/toggle)
│   │   │   │   └── [id]/page.tsx  # Edit single article
│   │   │   ├── categories/
│   │   │   │   └── page.tsx       # Manage categories
│   │   │   ├── scraper/
│   │   │   │   └── page.tsx       # Scraper status & logs
│   │   │   └── settings/
│   │   │       └── page.tsx       # Site settings, cron config, AdSense
│   │   │
│   │   ├── api/                   # API Routes
│   │   │   ├── articles/
│   │   │   │   ├── route.ts       # GET /api/articles (list)
│   │   │   │   └── [id]/route.ts  # GET/PUT/DELETE single article
│   │   │   ├── categories/
│   │   │   │   └── route.ts       # CRUD categories
│   │   │   ├── admin/
│   │   │   │   ├── stats/route.ts # Dashboard stats
│   │   │   │   └── logs/route.ts  # Scraper logs
│   │   │   └── auth/
│   │   │       └── [...nextauth]/route.ts
│   │   │
│   │   ├── sitemap.ts             # Dynamic sitemap for SEO
│   │   └── robots.ts              # robots.txt for SEO
│   │
│   ├── components/                # Reusable UI Components
│   │   ├── website/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── ArticleGrid.tsx
│   │   │   ├── CategoryBar.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── AdSlot.tsx         # Google AdSense ad placement
│   │   │   ├── ShareButtons.tsx
│   │   │   └── SEOHead.tsx
│   │   └── admin/
│   │       ├── Sidebar.tsx
│   │       ├── StatsCard.tsx
│   │       ├── ArticleTable.tsx
│   │       ├── LogViewer.tsx
│   │       └── StatusBadge.tsx
│   │
│   ├── lib/                       # Core Business Logic
│   │   ├── db.ts                  # Prisma client instance
│   │   ├── gemini.ts              # Gemini API client + prompts
│   │   ├── rss.ts                 # Google News RSS fetcher + parser
│   │   ├── scraper.ts             # Article content scraper (cheerio)
│   │   ├── duplicate.ts           # Duplicate detection logic
│   │   ├── image-gen.ts           # Thumbnail generation (Gemini Imagen)
│   │   ├── seo.ts                 # SEO utilities (slug, meta, JSON-LD)
│   │   ├── scheduler.ts           # Cron scheduling logic
│   │   └── constants.ts           # App-wide constants
│   │
│   ├── workers/
│   │   └── news-cron.ts           # Standalone cron worker process
│   │
│   └── types/
│       └── index.ts               # TypeScript type definitions
│
├── public/
│   ├── images/                    # Generated thumbnails
│   ├── ads.txt                    # AdSense ads.txt
│   └── favicon.ico
│
├── .env                           # Environment variables
├── .env.example                   # Template
├── next.config.ts                 # Next.js config
├── package.json
├── tsconfig.json
├── ecosystem.config.js            # PM2 config
├── nginx.conf                     # Nginx config template
└── README.md
```

---

## 🗃️ Database Schema (PostgreSQL + Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Admin {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  articles  Article[]
  createdAt DateTime  @default(now())
}

model Article {
  id              String   @id @default(cuid())
  title           String
  slug            String   @unique
  excerpt         String
  content         String
  originalTitle   String
  originalUrl     String   @unique
  sourceHash      String   @unique

  // SEO
  metaTitle       String
  metaDescription String
  keywords        String[]

  // Media
  thumbnailUrl    String?

  // Category
  category        Category @relation(fields: [categoryId], references: [id])
  categoryId      String

  // Status
  status          ArticleStatus @default(PUBLISHED)
  publishedAt     DateTime      @default(now())

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([publishedAt(sort: Desc)])
  @@index([categoryId])
  @@index([slug])
  @@index([status])
}

model ScrapeLog {
  id                String       @id @default(cuid())
  status            ScrapeStatus
  articlesFound     Int          @default(0)
  articlesAdded     Int          @default(0)
  duplicatesSkipped Int          @default(0)
  errorMessage      String?
  duration          Int
  createdAt         DateTime     @default(now())

  @@index([createdAt(sort: Desc)])
}

model SiteSetting {
  id    String @id @default(cuid())
  key   String @unique
  value String
}

enum ArticleStatus {
  PUBLISHED
  DRAFT
  ARCHIVED
}

enum ScrapeStatus {
  SUCCESS
  PARTIAL
  FAILED
}
```

---

## 🤖 Gemini AI Prompts

### Article Rewriting Prompt
```
You are a senior tech journalist writing for Prisom,
a popular Indian tech news website.

RULES:
1. Completely rewrite the article — NO plagiarism
2. Target: Indian tech enthusiasts (20-35 age group)
3. Length: 600-800 words
4. Tone: Informative, engaging, slightly conversational
5. Convert all prices to INR (₹) where applicable
6. Mention Indian availability/launch dates if relevant
7. Use HTML formatting: <h2>, <h3>, <p>, <strong>, <ul>/<li>
8. Include a compelling opening hook
9. Add a "Key Takeaways" section at the end
10. Naturally include relevant keywords for SEO

ORIGINAL ARTICLE:
{scraped_content}
```

### SEO Metadata Prompt
```
Generate SEO metadata as JSON:
{
  "metaTitle": "max 60 chars, primary keyword first",
  "metaDescription": "max 160 chars, compelling + keyword-rich",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "category": "one of: smartphones|ai|startups|gadgets|apps|gaming",
  "slug": "url-friendly-slug-with-keywords"
}

ARTICLE TITLE: {title}
ARTICLE EXCERPT: {first_200_chars}
```

---

## 📢 Google AdSense Integration

### Ad Placement Zones
```
HOMEPAGE:
  - Leaderboard (728x90) — below header
  - In-feed ads — between article rows (every 6 articles)

ARTICLE PAGE:
  - Below title (300x250)
  - In-article (mid-content)
  - Bottom (300x250)
  - After related articles (728x90)

SIDEBAR (if applicable):
  - Sticky ad (300x600)
```

### AdSense Requirements Checklist
- [x] About Us page
- [x] Contact page
- [x] Privacy Policy page
- [x] Disclaimer page
- [x] Original content (Gemini rewrite)
- [x] 25+ articles before applying
- [x] Clean navigation
- [x] Mobile responsive
- [x] Fast page load (SSR)
- [x] ads.txt file
- [ ] Domain age: wait 1-3 months
- [ ] Apply for AdSense

### Admin Panel — AdSense Settings
- AdSense Publisher ID input
- Enable/Disable ads toggle
- Per-slot ad code input
- Auto Ads toggle
- ads.txt editor

---

## 🖥️ AWS Deployment

### Architecture (Single EC2)
```
Users → Nginx (SSL) → Next.js (Port 3000) → PostgreSQL (localhost)
                       PM2 manages → Cron Worker (news-cron.ts)
```

### Instance Specs
| Component | Detail |
|-----------|--------|
| Instance | t3.small (2 vCPU, 2GB RAM) |
| OS | Ubuntu 22.04 LTS |
| Storage | 20GB EBS gp3 |
| IP | Elastic IP (static) |
| SSL | Let's Encrypt via Certbot |

### Monthly Cost
| Item | Cost (₹/mo) |
|------|-------------|
| EC2 t3.small | ~₹1,200 |
| EBS 20GB | ~₹160 |
| Domain (.in/year) | ~₹50 |
| Gemini API | ₹0 (free tier) |
| SSL | ₹0 |
| **Total** | **~₹1,500** |

> With AWS Free Tier (first year): ~₹200/mo

---

## 🔐 Environment Variables

```env
DATABASE_URL="postgresql://techpulse:password@localhost:5432/techpulse_db"
GEMINI_API_KEY="your-gemini-api-key"
NEXTAUTH_SECRET="random-32-char-string"
NEXTAUTH_URL="https://prisom.live"
ADMIN_EMAIL="admin@prisom.live"
ADMIN_PASSWORD="secure-password"
NEXT_PUBLIC_ADSENSE_ID="ca-pub-xxxxxxxxxx"
CRON_START_HOUR=6
CRON_END_HOUR=18
CRON_INTERVAL_MINUTES=30
RSS_FEED_URL="https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pKVGlnQVAB?gl=IN&hl=en-IN"
```

---

## 📋 Implementation Phases

### Phase 1: Foundation (Day 1-2)
- Initialize Next.js + TypeScript project
- Setup Prisma + PostgreSQL schema
- Create design system (CSS variables, fonts)
- Build basic page layouts

### Phase 2: Core Engine (Day 3-4)
- RSS fetcher (Google News India Tech)
- Article scraper (cheerio)
- Gemini AI rewriter service
- Duplicate detection
- Cron worker with node-cron

### Phase 3: Website (Day 5-6)
- Homepage with article grid
- Article detail page with full SEO
- Category pages
- Dark/Light theme toggle
- Mobile responsive design
- Static pages (About, Contact, Privacy)

### Phase 4: Admin Panel (Day 7-8)
- Admin login + auth middleware
- Dashboard with stats
- Article management (CRUD)
- Scraper logs viewer
- Settings page (AdSense, cron, RSS)

### Phase 5: SEO & AdSense (Day 9)
- Dynamic sitemap.xml
- robots.txt
- JSON-LD structured data
- Open Graph tags
- AdSense component + ad slots
- ads.txt

### Phase 6: Deploy (Day 10)
- Purchase domain
- Setup AWS EC2
- Install dependencies
- Configure Nginx + SSL
- Deploy with PM2
- Submit sitemap to Google Search Console
