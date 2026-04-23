// ─── Duplicate Detection ─────────────────────────────
// Title hash + Levenshtein similarity checks to
// prevent duplicate article publishing.

import crypto from "crypto";
import { prisma } from "./db";

function log(message: string): void {
  console.log(`[${new Date().toISOString()}] [Duplicate] ${message}`);
}

/** Generate MD5 hash of normalized title */
export function generateTitleHash(title: string): string {
  const normalized = title.toLowerCase().trim().replace(/\s+/g, " ");
  return crypto.createHash("md5").update(normalized).digest("hex");
}

/** Levenshtein distance (Wagner–Fischer, two-row optimization) */
export function levenshteinDistance(a: string, b: string): number {
  const aL = a.toLowerCase().trim();
  const bL = b.toLowerCase().trim();
  if (aL === bL) return 0;
  if (aL.length === 0) return bL.length;
  if (bL.length === 0) return aL.length;

  let prev = Array.from({ length: bL.length + 1 }, (_, i) => i);
  let curr = new Array<number>(bL.length + 1);

  for (let i = 1; i <= aL.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= bL.length; j++) {
      const cost = aL[i - 1] === bL[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[bL.length];
}

/** Similarity ratio (0 to 1) */
export function calculateSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason?: string;
  matchedTitle?: string;
  similarity?: number;
}

/**
 * Two-stage duplicate check:
 * 1. Exact MD5 hash match on sourceHash
 * 2. Levenshtein fuzzy match (>80% = duplicate) against recent articles
 */
export async function checkDuplicate(
  title: string,
  recentHours: number = 72
): Promise<DuplicateCheckResult> {
  const hash = generateTitleHash(title);
  log(`Checking: "${title}" (hash: ${hash})`);

  try {
    // Stage 1: Exact hash match
    const exact = await prisma.article.findUnique({
      where: { sourceHash: hash },
      select: { title: true },
    });
    if (exact) {
      log(`🔴 Exact duplicate: "${exact.title}"`);
      return { isDuplicate: true, reason: "exact_hash_match", matchedTitle: exact.title, similarity: 1.0 };
    }

    // Stage 2: Fuzzy match against recent articles
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - recentHours);

    const recent = await prisma.article.findMany({
      where: { createdAt: { gte: cutoff } },
      select: { title: true, originalTitle: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    for (const article of recent) {
      const sim = Math.max(
        calculateSimilarity(title, article.title),
        calculateSimilarity(title, article.originalTitle)
      );
      if (sim > 0.8) {
        log(`🟡 Fuzzy duplicate (${(sim * 100).toFixed(1)}%): "${article.title}"`);
        return { isDuplicate: true, reason: "levenshtein_similarity", matchedTitle: article.title, similarity: sim };
      }
    }

    log(`🟢 No duplicate found`);
    return { isDuplicate: false };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    log(`❌ Error: ${errMsg}`);
    return { isDuplicate: false }; // Don't block pipeline on error
  }
}

/** Check if a source URL already exists in the DB */
export async function checkUrlExists(url: string): Promise<boolean> {
  try {
    const existing = await prisma.article.findUnique({
      where: { originalUrl: url },
      select: { id: true },
    });
    return existing !== null;
  } catch {
    return false;
  }
}
