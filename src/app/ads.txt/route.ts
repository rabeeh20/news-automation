// ─── Dynamic ads.txt Route ──────────────────────────
// Serves ads.txt content from the database (SiteSetting).
// This allows the admin to update ads.txt from the settings panel.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "ads_txt_content" },
    });

    const content =
      setting?.value ||
      "# Google AdSense ads.txt\n# Configure via Admin Panel → Settings → ads.txt\n# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0";

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(
      "# ads.txt temporarily unavailable",
      {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }
    );
  }
}
