// ─── Database Seed ───────────────────────────────────
// Seeds the database with default categories and
// the initial admin user.

import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Smartphones", slug: "smartphones" },
  { name: "AI", slug: "ai" },
  { name: "Startups", slug: "startups" },
  { name: "Gadgets", slug: "gadgets" },
  { name: "Apps", slug: "apps" },
  { name: "Gaming", slug: "gaming" },
];

async function main() {
  console.log("🌱 Seeding database...\n");

  // Seed categories
  for (const category of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    if (!existing) {
      await prisma.category.create({ data: category });
      console.log(`  ✅ Created category: ${category.name}`);
    } else {
      console.log(`  ⏭️  Category already exists: ${category.name}`);
    }
  }

  // Seed admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@prisom.live";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash,
      },
    });
    console.log(`\n  ✅ Created admin user: ${adminEmail}`);
  } else {
    console.log(`\n  ⏭️  Admin user already exists: ${adminEmail}`);
  }

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
