/**
 * Seeds sample Retailers and Products for the Sales Register data
 * foundation (Phase 2A — see docs/SALES_REGISTER.md).
 *
 * Deliberately does NOT seed any Sale rows — per Phase 2A scope, Sale rows
 * are only ever created through a validated, session-authenticated path
 * (a future phase's Server Actions), never as seed data.
 *
 * This is a separate script from prisma/seed.ts (which provisions the
 * three admin accounts) so the authentication seed remains untouched.
 *
 * Run with: npm run db:seed:catalog
 */
import "dotenv/config";
import prisma from "../src/lib/db/prisma";

const products = [
  {
    name: "Plain Makhana",
    category: "makhana",
    defaultUnit: "kg",
  },
  {
    name: "Salted Makhana",
    category: "makhana",
    defaultUnit: "kg",
  },
  {
    name: "Jaggery Makhana",
    category: "makhana",
    defaultUnit: "kg",
  },
  {
    name: "Chana Sattu",
    category: "sattu",
    defaultUnit: "kg",
  },
  {
    name: "Ragi Semiya",
    category: "millet",
    defaultUnit: "pack",
  },
  {
    name: "Jowar Pasta",
    category: "millet",
    defaultUnit: "pack",
  },
];

const retailers = [
  {
    name: "Sri Venkateswara Traders",
    city: "Hyderabad",
    state: "Telangana",
    phone: "9840011111",
  },
  {
    name: "Balaji General Store",
    city: "Hyderabad",
    state: "Telangana",
    phone: "9840022222",
  },
  {
    name: "New Ganesh Kirana Bhandar",
    city: "Patna",
    state: "Bihar",
    phone: "9840033333",
  },
  {
    name: "Madhubani Fresh Mart",
    city: "Madhubani",
    state: "Bihar",
    phone: "9840044444",
  },
  {
    name: "Healthy Bites Retail",
    city: "Secunderabad",
    state: "Telangana",
    phone: "9840055555",
  },
  {
    name: "Ananya Super Bazaar",
    city: "Patna",
    state: "Bihar",
    phone: "9840066666",
  },
];

async function main() {
  for (const product of products) {
    // Product has no unique constraint on name alone (matching the schema
    // design); look up by name+category as the practical dedupe key for a
    // re-runnable seed script.
    const existingProduct = await prisma.product.findFirst({
      where: { name: product.name, category: product.category },
      select: { id: true },
    });

    if (existingProduct) {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: { defaultUnit: product.defaultUnit, isActive: true },
      });
    } else {
      await prisma.product.create({
        data: { ...product, isActive: true },
      });
    }
    console.log(`Seeded product: ${product.name} [${product.category}]`);
  }

  for (const retailer of retailers) {
    const existing = await prisma.retailer.findFirst({
      where: { name: retailer.name, city: retailer.city },
      select: { id: true },
    });

    if (existing) {
      await prisma.retailer.update({
        where: { id: existing.id },
        data: { ...retailer, isActive: true },
      });
    } else {
      await prisma.retailer.create({
        data: { ...retailer, isActive: true },
      });
    }
    console.log(`Seeded retailer: ${retailer.name} (${retailer.city}, ${retailer.state})`);
  }

  console.log("No sample Sale rows were created — Sales are only ever created through the (future) validated Server Action path.");
}

main()
  .catch((error) => {
    console.error("Catalog seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
