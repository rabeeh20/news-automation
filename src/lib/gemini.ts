// ─── Gemini AI Client ────────────────────────────────
// Google Generative AI SDK wrapper for article rewriting
// and SEO metadata generation.
//
// OPTIMIZED: Single API call returns both the rewritten
// article AND SEO metadata (was 2 separate calls before).

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ArticleAIResult } from "@/types";

function log(message: string): void {
  console.log(`[${new Date().toISOString()}] [Gemini] ${message}`);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Rewrite a scraped article AND generate SEO metadata in a single Gemini call.
 *
 * Previously this was split into two functions (rewriteArticle + generateSEOMetadata),
 * consuming 2 API calls per article. Now it's 1 combined call — 50% reduction in
 * Gemini text API usage.
 */
export async function rewriteArticle(
  originalContent: string,
  originalTitle: string
): Promise<ArticleAIResult> {
  log(`Rewriting article + generating SEO: "${originalTitle}"`);

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are a senior tech journalist writing for Prisom,
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

IMPORTANT: Return ONLY a JSON object with these EXACT fields:
{
  "title": "Your catchy rewritten headline",
  "content": "Full HTML article content (600-800 words)",
  "excerpt": "A compelling 2-3 sentence summary (max 200 chars)",
  "metaTitle": "SEO title, max 60 chars, primary keyword first",
  "metaDescription": "SEO description, max 160 chars, compelling + keyword-rich",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "category": "one of: smartphones|ai|startups|gadgets|apps|gaming",
  "slug": "url-friendly-slug-with-keywords"
}

ORIGINAL TITLE: ${originalTitle}

ORIGINAL ARTICLE:
${originalContent.substring(0, 5000)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response (handle markdown code blocks)
    const jsonStr = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(jsonStr) as ArticleAIResult;

    // Validate required article fields
    if (!parsed.title || !parsed.content || !parsed.excerpt) {
      throw new Error("Missing required article fields in Gemini response");
    }

    // Validate and enforce SEO field constraints
    if (!parsed.metaTitle || !parsed.slug || !parsed.category) {
      throw new Error("Missing required SEO fields in Gemini response");
    }

    parsed.metaTitle = parsed.metaTitle.substring(0, 60);
    parsed.metaDescription = (parsed.metaDescription || "").substring(0, 160);
    parsed.keywords = (parsed.keywords || []).slice(0, 5);
    parsed.slug = parsed.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Validate category is one of the allowed values
    const validCategories = ["smartphones", "ai", "startups", "gadgets", "apps", "gaming"];
    if (!validCategories.includes(parsed.category.toLowerCase())) {
      parsed.category = "gadgets"; // safe fallback
    }
    parsed.category = parsed.category.toLowerCase();

    log(`✅ Article rewritten + SEO generated: "${parsed.title}" (${parsed.content.split(/\s+/).length} words)`);
    log(`   → slug: ${parsed.slug} | category: ${parsed.category} | keywords: ${parsed.keywords.join(", ")}`);
    return parsed;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    log(`❌ Rewrite failed: ${errMsg}`);
    throw new Error(`Article rewrite failed: ${errMsg}`);
  }
}
