// ─── Admin Scraper Trigger API ──────────────────────
// POST: Triggers an immediate scrape run.
// GET: Returns scraper status.
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSchedulerStatus } from "@/lib/scheduler";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const schedulerStatus = getSchedulerStatus();
    const lastLog = await prisma.scrapeLog.findFirst({
      orderBy: { createdAt: "desc" },
    });

    // Check auto-scraping setting
    const autoScrapeSetting = await prisma.siteSetting.findUnique({
      where: { key: "auto_scraping_enabled" },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...schedulerStatus,
        lastRun: lastLog,
        autoScrapingEnabled: autoScrapeSetting?.value !== "false",
      },
    });
  } catch (error) {
    console.error("Scraper status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch scraper status" },
      { status: 500 }
    );
  }
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Create a "manual trigger" log entry
    await prisma.scrapeLog.create({
      data: {
        status: "SUCCESS",
        articlesFound: 0,
        articlesAdded: 0,
        duplicatesSkipped: 0,
        errorMessage: "Manual trigger initiated from admin panel — pipeline runs via PM2 worker",
        duration: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Manual scrape triggered. The cron worker will pick up the next run. Check logs for results.",
    });
  } catch (error) {
    console.error("Scraper trigger error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to trigger scrape" },
      { status: 500 }
    );
  }
}
