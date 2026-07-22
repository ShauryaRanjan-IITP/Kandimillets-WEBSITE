import type { BusinessSettings } from "@/generated/prisma/client";

export function serializeBusinessSettings(settings: BusinessSettings) {
  return {
    id: settings.id,
    businessName: settings.businessName,
    gstNumber: settings.gstNumber,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    invoicePrefix: settings.invoicePrefix,
    defaultCurrency: settings.defaultCurrency,
    defaultUnit: settings.defaultUnit,
    defaultLowStockThreshold: settings.defaultLowStockThreshold ? settings.defaultLowStockThreshold.toNumber() : null,
    updatedAt: settings.updatedAt.toISOString(),
  };
}

export type BusinessSettingsDTO = ReturnType<typeof serializeBusinessSettings>;
