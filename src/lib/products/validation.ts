/**
 * Server-side validation for Product create/update — mirrors the exact
 * sanitize -> validate pattern established in src/lib/retailers/validation.ts
 * (itself following src/lib/sales/validation.ts), reused here rather than
 * reinvented. Unit is restricted to the same known set already enforced on
 * Sale.unit (ALLOWED_UNITS), so a product's default unit can never be a
 * value a sale could never actually use.
 */
import { ALLOWED_UNITS } from "@/lib/sales/validation";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ProductInput {
  name: string;
  sku: string;
  category: string;
  unit: string;
  sellingPrice: string;
  description: string;
  isActive: boolean;
}

export interface SanitizedProductInput {
  name: string;
  sku: string;
  category: string;
  defaultUnit: string;
  sellingPrice: number;
  description: string | null;
  isActive: boolean;
}

const DEFAULT_CATEGORY = "Uncategorized";
const SKU_REGEX = /^[A-Z0-9-]+$/;

export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'&]/g, "")
    .trim();
}

/** Uppercase, trimmed — this task's explicit "Normalize SKU (uppercase +
 * trim)" requirement. */
export function normalizeSku(raw: string): string {
  return raw.trim().toUpperCase();
}

export function validateProductInput(
  raw: ProductInput
): { errors: ValidationError[] } | { data: SanitizedProductInput } {
  const errors: ValidationError[] = [];

  const name = sanitize(raw.name).slice(0, 200);
  if (!name) {
    errors.push({ field: "name", message: "Product Name is required." });
  }

  const sku = normalizeSku(sanitize(raw.sku)).slice(0, 50);
  if (!sku) {
    errors.push({ field: "sku", message: "SKU is required." });
  } else if (!SKU_REGEX.test(sku)) {
    errors.push({ field: "sku", message: "SKU may only contain letters, numbers, and hyphens." });
  }

  const category = sanitize(raw.category).slice(0, 100) || DEFAULT_CATEGORY;

  const defaultUnit = sanitize(raw.unit);
  if (!defaultUnit || !ALLOWED_UNITS.includes(defaultUnit)) {
    errors.push({ field: "unit", message: `Unit is required and must be one of: ${ALLOWED_UNITS.join(", ")}.` });
  }

  const sellingPrice = Number(raw.sellingPrice);
  if (!raw.sellingPrice || !Number.isFinite(sellingPrice) || sellingPrice <= 0) {
    errors.push({ field: "sellingPrice", message: "Selling Price is required and must be greater than zero." });
  }

  const description = sanitize(raw.description).slice(0, 1000);

  if (errors.length > 0) {
    return { errors };
  }

  return {
    data: {
      name,
      sku,
      category,
      defaultUnit,
      sellingPrice,
      description: description || null,
      isActive: Boolean(raw.isActive),
    },
  };
}
