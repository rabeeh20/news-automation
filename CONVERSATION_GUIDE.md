# 🗣️ TechPulse India — Conversation Guide

> Ready-to-use prompts for each phase. Copy-paste these when starting new conversations.

---

## 🔑 Golden Rules

1. **One conversation = One phase** (don't mix phases)
2. **Always start by pointing to the architecture plan**
3. **If AI gets confused → start a fresh conversation with context**
4. **After each phase → test → git commit → move to next phase**
5. **Keep conversations under 30 messages**

---

## Conversation 1 → Phase 1: Project Foundation

### Prompt:
```
I'm building "TechPulse India" — an automated tech news platform.

Read the architecture plan at: ARCHITECTURE_PLAN.md in this project.

We are starting Phase 1: Foundation. Here's what I need:

1. Initialize a Next.js 14 project with TypeScript and App Router in this directory
2. Install all dependencies from the architecture plan:
   - @prisma/client, prisma
   - @google/generative-ai
   - rss-parser, cheerio, axios
   - node-cron, next-auth, bcryptjs, next-themes
3. Setup Prisma with PostgreSQL — create the FULL schema from the architecture plan
   (Admin, Category, Article, ScrapeLog, SiteSetting tables)
4. Create the .env.example file with all environment variables
5. Create the complete folder structure from the architecture plan
6. Setup the design system in globals.css with:
   - CSS variables for light/dark theme
   - Inter font from Google Fonts
   - Base responsive breakpoints
7. Create the root layout.tsx with theme provider and font setup

Do NOT skip any tables or fields from the schema.
Do NOT build any pages yet — only the foundation.
After everything is set up, run prisma generate to verify the schema compiles.
```

---

## Conversation 2 → Phase 2: Core Scraping Engine

### Prompt:
```
I'm building "TechPulse India" — an automated tech news platform.

Read ARCHITECTURE_PLAN.md for full context.

Phase 1 is COMPLETE. We have:
- Next.js 14 + TypeScript project initialized
- Prisma schema with all 5 tables (Admin, Category, Article, ScrapeLog, SiteSetting)
- All dependencies installed
- Design system in globals.css
- Folder structure created

Now build Phase 2: Core Scraping Engine. Create these files:

1. src/lib/db.ts — Prisma client singleton
2. src/lib/rss.ts — Fetch and parse Google News RSS feed
   - URL: https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pKVGlnQVAB?gl=IN&hl=en-IN
   - Parse title, link, pubDate, source
3. src/lib/scraper.ts — Scrape article content from source URL
   - Use axios + cheerio
   - Extract main article text, strip ads/nav/footer
   - Handle errors gracefully
4. src/lib/duplicate.ts — Duplicate detection
   - MD5 hash of title → check sourceHash in DB
   - Levenshtein distance check (>80% similarity = duplicate)
5. src/lib/gemini.ts — Gemini API integration
   - Rewrite article function (use the prompt from ARCHITECTURE_PLAN.md)
   - Generate SEO metadata function (use the prompt from ARCHITECTURE_PLAN.md)
6. src/lib/image-gen.ts — Thumbnail generation using Gemini
7. src/workers/news-cron.ts — The main cron worker that:
   - Runs every 30 min between 6am-6pm IST
   - Executes the full pipeline: RSS → Duplicate Check → Scrape → Rewrite → Save
   - Logs results to ScrapeLog table
   - Handles all errors gracefully

Make each file modular and testable.
Add proper error handling and logging (console.log with timestamps).
```

---

## Conversation 3 → Phase 3: Website Frontend

### Prompt:
```
I'm building "TechPulse India" — an automated tech news platform.

Read ARCHITECTURE_PLAN.md for full context.

Phase 1 (Foundation) and Phase 2 (Scraping Engine) are COMPLETE.
The database has articles being scraped and stored.

Now build Phase 3: Website Frontend. Build these pages:

1. Homepage (src/app/page.tsx)
   - Display latest articles in a responsive grid (3 col desktop, 2 tablet, 1 mobile)
   - Each article shows: thumbnail, category badge, title, excerpt, date
   - Pagination or "Load More" button
   - Category filter bar at top

2. Article Page (src/app/article/[slug]/page.tsx)
   - Full SSR article with SEO metadata
   - JSON-LD NewsArticle structured data
   - Open Graph tags
   - Breadcrumbs
   - Share buttons
   - Related articles at bottom
   - Ad slots (placeholder component for now)

3. Category Page (src/app/category/[slug]/page.tsx)
   - Filtered articles grid by category
   - Pagination

4. Static Pages:
   - /about — About TechPulse India
   - /contact — Contact form
   - /privacy — Privacy Policy (AdSense compliant)
   - /disclaimer — AI content disclaimer

5. Components:
   - Header (logo, nav, category links, theme toggle)
   - Footer (links, copyright)
   - ArticleCard (thumbnail, title, excerpt, date, category)
   - ThemeToggle (dark/light switch)
   - AdSlot (placeholder for Google AdSense)
   - ShareButtons (copy link, Twitter, WhatsApp)

6. SEO files:
   - src/app/sitemap.ts (dynamic, includes all articles)
   - src/app/robots.ts

Design should be PREMIUM — modern, clean, dark/light mode.
Use the color palette from ARCHITECTURE_PLAN.md.
Make everything mobile-first and responsive.
```

---

## Conversation 4 → Phase 4: Admin Panel

### Prompt:
```
I'm building "TechPulse India" — an automated tech news platform.

Read ARCHITECTURE_PLAN.md for full context.

Phases 1-3 are COMPLETE. Website is working with articles displayed.

Now build Phase 4: Admin Panel.

1. Admin Auth:
   - Login page at /admin/login (email + password)
   - NextAuth.js with Credentials provider
   - Middleware to protect all /admin/* routes
   - Single admin user (seeded in DB)

2. Dashboard (/admin)
   - Total articles (today / this week / all time)
   - Scraper status (last run time, success/fail)
   - Articles per category (simple chart or stats)
   - Recent 10 scrape logs

3. Articles Management (/admin/articles)
   - Table with: title, category, status, date, actions
   - Search and filter (by category, status, date)
   - Edit article (title, content, meta, category, status)
   - Delete article
   - Toggle publish/draft/archive

4. Scraper Control (/admin/scraper)
   - View all scrape logs with pagination
   - Each log shows: timestamp, status, articles found/added/skipped, duration
   - "Scrape Now" manual trigger button
   - Enable/disable auto-scraping toggle

5. Settings (/admin/settings)
   - RSS feed URL configuration
   - Cron schedule (start hour, end hour, interval)
   - Gemini API key (masked input)
   - AdSense Publisher ID
   - AdSense enable/disable toggle
   - Per-slot ad code inputs
   - Site title, description
   - ads.txt content editor

6. Admin Layout:
   - Sidebar navigation (Dashboard, Articles, Scraper, Settings)
   - Top bar with admin name + logout
   - Dark theme only for admin (professional look)

Make the admin panel clean, functional, and professional.
Use a dark admin theme. Responsive for tablet use minimum.
```

---

## Conversation 5 → Phase 5: SEO & AdSense Polish

### Prompt:
```
I'm building "TechPulse India" — an automated tech news platform.

Read ARCHITECTURE_PLAN.md for full context.

Phases 1-4 are COMPLETE. Website + Admin Panel are working.

Now build Phase 5: SEO & AdSense Polish.

1. SEO Enhancements:
   - Verify all pages have proper <title> and <meta description>
   - JSON-LD on article pages (NewsArticle schema)
   - JSON-LD on homepage (WebSite schema with SearchAction)
   - Open Graph tags on all pages
   - Twitter Card meta tags
   - Canonical URLs on all pages
   - Breadcrumb structured data
   - Image alt tags auto-generated from article title
   - Verify sitemap.xml includes all published articles
   - Verify robots.txt is correct

2. AdSense Integration:
   - Build the AdSlot component that:
     - Reads AdSense code from SiteSetting in DB
     - Renders Google ad script
     - Supports different sizes (leaderboard, rectangle, in-article)
     - Only shows if AdSense is enabled in settings
     - Lazy loads for performance
   - Place ad slots in all positions from the architecture plan
   - Create /public/ads.txt route

3. Performance:
   - Image optimization (next/image with WebP)
   - Lazy loading for images below fold
   - Proper caching headers in next.config
   - Verify Core Web Vitals are good

4. Final touches:
   - 404 page (custom, on-brand)
   - Loading states for all pages
   - Error boundaries
```

---

## Conversation 6 → Phase 6: AWS Deployment

### Prompt:
```
I'm building "TechPulse India" — an automated tech news platform.

Read ARCHITECTURE_PLAN.md for full context.

Phases 1-5 are COMPLETE. Everything works locally.

Now help me with Phase 6: AWS EC2 Deployment.

Give me step-by-step commands for:

1. EC2 Setup:
   - Launch Ubuntu 22.04 t3.small (or t3.micro for free tier)
   - Security group: ports 22, 80, 443
   - Allocate Elastic IP

2. Server Setup:
   - Install Node.js 20
   - Install PostgreSQL 16
   - Create database + user
   - Install Nginx
   - Install PM2 globally

3. App Deployment:
   - Clone repo from GitHub
   - npm install
   - Setup .env with production values
   - Run prisma migrate deploy
   - Run prisma db seed (create admin user + categories)
   - npm run build

4. Nginx Config:
   - Reverse proxy to localhost:3000
   - Gzip compression
   - Static file caching
   - Security headers

5. SSL Setup:
   - Install Certbot
   - Get Let's Encrypt certificate for techpulseindia.in
   - Auto-renewal cron

6. PM2 Setup:
   - Create ecosystem.config.js for:
     - Next.js app (production mode)
     - Cron worker (news-cron.ts)
   - pm2 startup + pm2 save

7. Final Verification:
   - Test website loads via HTTPS
   - Test admin panel login
   - Test cron job runs correctly
   - Submit sitemap to Google Search Console

Also create a deployment script (deploy.sh) that I can run
for future updates: git pull → npm install → build → pm2 restart
```

---

## 🆘 Emergency Prompts

### When AI gets confused mid-conversation:
```
STOP. Let's reset context.

I'm building TechPulse India. Read ARCHITECTURE_PLAN.md.

Here's the current state of the project:
- [list what files exist and what works]
- [list what's broken or incomplete]

Continue from where we left off. The specific task is:
- [exactly what you need done]
```

### When you get a bug you can't fix:
```
I have a bug in my TechPulse India project.

File: [paste the file path]
Error: [paste the exact error message]

Here's the relevant code:
[paste the code]

Here's what I've already tried:
[list what you tried]

Fix this specific bug. Don't change anything else.
```

### When restarting after a break:
```
I'm continuing work on TechPulse India.

Read ARCHITECTURE_PLAN.md for the full plan.

Current project status:
- Phase 1: ✅ Done
- Phase 2: ✅ Done
- Phase 3: 🔄 In progress — homepage and article page done, need category page
- Phase 4: ❌ Not started

Continue Phase 3 from where we left off.
Build the category page (src/app/category/[slug]/page.tsx).
```

---

## 📊 Progress Tracker

Update this as you complete each phase:

| Phase | Status | Date Completed |
|-------|--------|----------------|
| Phase 1: Foundation | ⬜ Not Started | |
| Phase 2: Core Engine | ⬜ Not Started | |
| Phase 3: Website | ⬜ Not Started | |
| Phase 4: Admin Panel | ⬜ Not Started | |
| Phase 5: SEO & AdSense | ⬜ Not Started | |
| Phase 6: Deploy | ⬜ Not Started | |
