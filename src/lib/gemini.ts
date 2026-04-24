// ─── Gemini AI Client ────────────────────────────────
// Google Generative AI SDK wrapper for article rewriting
// and SEO metadata generation.

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { RewrittenArticle, SEOMetadata } from "@/types";

function log(message: string): void {
  console.log(`[${new Date().toISOString()}] [Gemini] ${message}`);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Rewrite a scraped article using Gemini AI.
 * Uses the Prisom editorial prompt from the architecture plan.
 */
export async function rewriteArticle(
  originalContent: string,
  originalTitle: string
): Promise<RewrittenArticle> {
  log(`Rewriting article: "${originalTitle}"`);

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

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

IMPORTANT: Return ONLY a JSON object with these exact fields:
{
  "title": "Your catchy rewritten headline",
  "content": "Full HTML article content (600-800 words)",
  "excerpt": "A compelling 2-3 sentence summary (max 200 chars)"
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

    const parsed = JSON.parse(jsonStr) as RewrittenArticle;

    if (!parsed.title || !parsed.content || !parsed.excerpt) {
      throw new Error("Missing required fields in Gemini response");
    }

    log(`✅ Article rewritten: "${parsed.title}" (${parsed.content.split(/\s+/).length} words)`);
    return parsed;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    log(`❌ Rewrite failed: ${errMsg}`);
    throw new Error(`Article rewrite failed: ${errMsg}`);
  }
}

/**
 * Generate SEO metadata for an article using Gemini AI.
 * Returns metaTitle, metaDescription, keywords, category, and slug.
 */
export async function generateSEOMetadata(
  title: string,
  excerpt: string
): Promise<SEOMetadata> {
  log(`Generating SEO metadata for: "${title}"`);

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `Generate SEO metadata as JSON:
{
  "metaTitle": "max 60 chars, primary keyword first",
  "metaDescription": "max 160 chars, compelling + keyword-rich",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "category": "one of: smartphones|ai|startups|gadgets|apps|gaming",
  "slug": "url-friendly-slug-with-keywords"
}

Return ONLY the JSON object, no markdown or explanation.

ARTICLE TITLE: ${title}
ARTICLE EXCERPT: ${excerpt.substring(0, 200)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonStr = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(jsonStr) as SEOMetadata;

    if (!parsed.metaTitle || !parsed.slug || !parsed.category) {
      throw new Error("Missing required fields in SEO metadata response");
    }

    // Enforce constraints
    parsed.metaTitle = parsed.metaTitle.substring(0, 60);
    parsed.metaDescription = (parsed.metaDescription || "").substring(0, 160);
    parsed.keywords = (parsed.keywords || []).slice(0, 5);
    parsed.slug = parsed.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    log(`✅ SEO metadata generated for: "${parsed.metaTitle}"`);
    return parsed;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    log(`❌ SEO generation failed: ${errMsg}`);
    throw new Error(`SEO metadata generation failed: ${errMsg}`);
  }
}
