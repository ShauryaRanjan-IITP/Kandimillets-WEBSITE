/**
 * Server-side validation for Business Settings — mirrors the exact
 * sanitize -> validate pattern established in src/lib/retailers/validation.ts
 * / src/lib/products/validation.ts, reused here rather than reinvented.
 */
import { ALLOWED_UNITS } from "@/lib/sales/validation";

export interface ValidationError {
  field: string;
  message: string;
}

export interface BusinessSettingsInput {
  businessName: string;
  gstNumber: string;
  address: string;
  phone: string;
  email: string;
  invoicePrefix: string;
  defaultCurrency: string;
  defaultUnit: string;
  defaultLowStockThreshold: string;
}

export interface SanitizedBusinessSettingsInput {
  businessName: string;
  gstNumber: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  invoicePrefix: string;
  defaultCurrency: string;
  defaultUnit: string;
  defaultLowStockThreshold: number | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GSTIN_REGEX = /^[0-9A-Z]{15}$/;
const CURRENCY_REGEX = /^[A-Z]{3}$/;
const INVOICE_PREFIX_REGEX = /^[A-Z0-9-]{1,10}$/;

export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'&]/g, "")
    .trim();
}

export function validateBusinessSettingsInput(
  raw: BusinessSettingsInput
): { errors: ValidationError[] } | { data: SanitizedBusinessSettingsInput } {
  const errors: ValidationError[] = [];

  const businessName = sanitize(raw.businessName).slice(0, 200);
  if (!businessName) {
    errors.push({ field: "businessName", message: "Business Name is required." });
  }

  const gstNumber = raw.gstNumber ? sanitize(raw.gstNumber).replace(/\s/g, "").toUpperCase() : "";
  if (gstNumber && !GSTIN_REGEX.test(gstNumber)) {
    errors.push({ field: "gstNumber", message: "GST Number must be 15 letters/digits (standard GSTIN format)." });
  }

  const address = sanitize(raw.address).slice(0, 500);
  const phone = sanitize(raw.phone).slice(0, 20);

  const email = sanitize(raw.email);
  if (email && !EMAIL_REGEX.test(email)) {
    errors.push({ field: "email", message: "Email must be a valid email address." });
  }

  const invoicePrefix = sanitize(raw.invoicePrefix).toUpperCase() || "INV";
  if (!INVOICE_PREFIX_REGEX.test(invoicePrefix)) {
    errors.push({ field: "invoicePrefix", message: "Invoice Prefix must be 1-10 letters, numbers, or hyphens." });
  }

  const defaultCurrency = sanitize(raw.defaultCurrency).toUpperCase() || "INR";
  if (!CURRENCY_REGEX.test(defaultCurrency)) {
    errors.push({ field: "defaultCurrency", message: "Default Currency must be a 3-letter code (e.g. INR)." });
  }

  const defaultUnit = sanitize(raw.defaultUnit) || "kg";
  if (!ALLOWED_UNITS.includes(defaultUnit)) {
    errors.push({ field: "defaultUnit", message: `Default Unit must be one of: ${ALLOWED_UNITS.join(", ")}.` });
  }

  let defaultLowStockThreshold: number | null = null;
  if (raw.defaultLowStockThreshold) {
    const parsed = Number(raw.defaultLowStockThreshold);
    if (!Number.isFinite(parsed) || parsed < 0) {
      errors.push({ field: "defaultLowStockThreshold", message: "Default Low Stock Threshold must be zero or greater." });
    } else {
      defaultLowStockThreshold = parsed;
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    data: {
      businessName,
      gstNumber: gstNumber || null,
      address: address || null,
      phone: phone || null,
      email: email || null,
      invoicePrefix,
      defaultCurrency,
      defaultUnit,
      defaultLowStockThreshold,
    },
  };
}
