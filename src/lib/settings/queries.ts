/**
 * Business Settings reads — direct server-side data fetching, per the
 * read path in docs/API.md §3.
 */
import prisma from "@/lib/db/prisma";
import { serializeBusinessSettings, type BusinessSettingsDTO } from "./dto";

/** A deliberate singleton — always the same fixed id, so "get or create
 * the one settings row" is a single idempotent upsert rather than a
 * race-prone find-then-create. First call in a fresh database seeds
 * sane defaults; every call after that just returns the existing row. */
const SETTINGS_ID = "singleton";

export async function getBusinessSettings(): Promise<BusinessSettingsDTO> {
  const settings = await prisma.businessSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: {
      id: SETTINGS_ID,
      businessName: "Kandimillets",
      invoicePrefix: "INV",
      defaultCurrency: "INR",
      defaultUnit: "kg",
    },
  });
  return serializeBusinessSettings(settings);
}

export { SETTINGS_ID };
