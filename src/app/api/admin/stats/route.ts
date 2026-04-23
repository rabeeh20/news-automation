// ─── Admin Dashboard Stats API ──────────────────────
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      totalArticles,
      articlesToday,
      articlesThisWeek,
      articlesByCategory,
      lastScrapeLog,
      recentLogs,
      totalPublished,
      totalDraft,
      totalArchived,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      prisma.article.count({
        where: { createdAt: { gte: startOfWeek } },
      }),
      prisma.category.findMany({
        select: {
          name: true,
          slug: true,
          _count: { select: { articles: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.scrapeLog.findFirst({
        orderBy: { createdAt: "desc" },
      }),
      prisma.scrapeLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({ where: { status: "DRAFT" } }),
      prisma.article.count({ where: { status: "ARCHIVED" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalArticles,
        articlesToday,
        articlesThisWeek,
        totalPublished,
        totalDraft,
        totalArchived,
        articlesByCategory: articlesByCategory.map((c) => ({
          name: c.name,
          slug: c.slug,
          count: c._count.articles,
        })),
        lastScrapeLog,
        recentLogs,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
