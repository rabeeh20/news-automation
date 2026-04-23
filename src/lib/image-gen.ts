// ─── Image Generation ────────────────────────────────
// Gemini Imagen API for auto-generating article
// thumbnail images. Saves to public/images/.

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

function log(message: string): void {
  console.log(`[${new Date().toISOString()}] [ImageGen] ${message}`);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Ensure the public/images directory exists
 */
function ensureImageDir(): string {
  const imageDir = path.join(process.cwd(), "public", "images");
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
    log(`Created image directory: ${imageDir}`);
  }
  return imageDir;
}

/**
 * Generate a thumbnail image for an article using Gemini Imagen.
 *
 * @param title - Article title (used to craft the image prompt)
 * @param slug - Article slug (used for the filename)
 * @returns URL path to the generated image (e.g., /images/my-article-slug.png)
 */
export async function generateThumbnail(
  title: string,
  slug: string
): Promise<string | null> {
  log(`Generating thumbnail for: "${title}"`);

  try {
    const imageDir = ensureImageDir();
    const filename = `${slug}.png`;
    const filepath = path.join(imageDir, filename);

    // Check if image already exists
    if (fs.existsSync(filepath)) {
      log(`⚡ Thumbnail already exists: ${filename}`);
      return `/images/${filename}`;
    }

    // Use Gemini Imagen model for image generation
    const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-002" });

    const imagePrompt = `Create a modern, professional tech news article thumbnail image.
Topic: ${title}
Style: Clean, minimalist tech illustration with vibrant gradient colors.
- Use a dark background with glowing accent elements
- Include subtle tech-related visual elements (circuits, devices, data visualization)
- Modern flat design aesthetic
- No text in the image
- Landscape orientation (16:9 ratio)
- Professional quality suitable for a tech news website`;

    const result = await model.generateContent(imagePrompt);
    const response = result.response;

    // Check if the response contains inline data (base64 image)
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          // Save base64 image to file
          const buffer = Buffer.from(part.inlineData.data, "base64");
          fs.writeFileSync(filepath, buffer);
          log(`✅ Thumbnail saved: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
          return `/images/${filename}`;
        }
      }
    }

    log(`⚠️ No image data in Gemini response, using placeholder`);
    return null;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    log(`❌ Image generation failed: ${errMsg}`);
    // Non-fatal: return null and article will have no thumbnail
    return null;
  }
}
