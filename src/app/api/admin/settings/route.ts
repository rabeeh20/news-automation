// ─── Admin Settings API ─────────────────────────────
// GET: Fetch all site settings.
// PUT: Update site settings.
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Default settings keys and their default values
const DEFAULT_SETTINGS: Record<string, string> = {
  site_title: "Prisom",
  site_description: "Your daily dose of tech news — India-focused, AI-powered, always fresh.",
  rss_feed_url: "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pKVGlnQVAB?gl=IN&hl=en-IN",
  cron_start_hour: "6",
  cron_end_hour: "18",
  cron_interval_minutes: "30",
  gemini_api_key: "",
  adsense_publisher_id: "",
  adsense_enabled: "false",
  adsense_ad_slot_header: "",
  adsense_ad_slot_sidebar: "",
  adsense_ad_slot_in_article: "",
  adsense_ad_slot_footer: "",
  ads_txt_content: "",
  auto_scraping_enabled: "true",
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbSettings = await prisma.siteSetting.findMany();
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };

    for (const setting of dbSettings) {
      settingsMap[setting.key] = setting.value;
    }

    return NextResponse.json({
      success: true,
      data: settingsMap,
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates: Record<string, string> = body;

    // Upsert each setting
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value !== "string") continue;

      const existing = await prisma.siteSetting.findUnique({
        where: { key },
      });

      if (existing) {
        await prisma.siteSetting.update({
          where: { key },
          data: { value },
        });
      } else {
        await prisma.siteSetting.create({
          data: { key, value },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
