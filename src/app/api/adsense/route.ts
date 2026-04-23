// ─── Public AdSense Settings API ─────────────────────
// Returns AdSense config for the client-side AdSlot component.
// No auth required — only exposes non-sensitive ad config.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "adsense_enabled",
            "adsense_publisher_id",
            "adsense_ad_slot_header",
            "adsense_ad_slot_sidebar",
            "adsense_ad_slot_in_article",
            "adsense_ad_slot_footer",
          ],
        },
      },
    });

    const config: Record<string, string> = {};
    for (const s of settings) {
      config[s.key] = s.value;
    }

    return NextResponse.json({
      success: true,
      data: {
        enabled: config.adsense_enabled === "true",
        publisherId: config.adsense_publisher_id || "",
        slots: {
          header: config.adsense_ad_slot_header || "",
          sidebar: config.adsense_ad_slot_sidebar || "",
          inArticle: config.adsense_ad_slot_in_article || "",
          footer: config.adsense_ad_slot_footer || "",
        },
      },
    });
  } catch (error) {
    console.error("AdSense config fetch error:", error);
    return NextResponse.json(
      { success: false, data: { enabled: false, publisherId: "", slots: {} } },
      { status: 500 }
    );
  }
}
