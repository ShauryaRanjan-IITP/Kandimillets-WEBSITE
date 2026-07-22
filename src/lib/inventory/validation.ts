/**
 * Server-side validation for manual Stock Adjustments — mirrors the exact
 * sanitize -> validate pattern established in src/lib/retailers/validation.ts
 * / src/lib/products/validation.ts, reused here rather than reinvented.
 */
import type { StockMovementDirection, StockMovementReason } from "@/generated/prisma/enums";

export interface ValidationError {
  field: string;
  message: string;
}

export interface StockAdjustmentInput {
  productId: string;
  direction: StockMovementDirection;
  quantity: string;
  reason: StockMovementReason;
  notes: string;
}

export interface SanitizedStockAdjustmentInput {
  productId: string;
  direction: StockMovementDirection;
  quantity: number;
  reason: StockMovementReason;
  notes: string | null;
}

/** Manual adjustments may only ever be entered by a human for one of
 * these reasons — SALE / SALE_EDIT / SALE_VOID are system-only reasons
 * written exclusively by the Sales Register integration
 * (src/lib/inventory/stockMovement.ts callers in sales/actions.ts), never
 * selectable here. */
export const MANUAL_ADJUSTMENT_REASONS: StockMovementReason[] = [
  "INITIAL_STOCK",
  "PURCHASE",
  "DAMAGE",
  "SAMPLE",
  "MANUAL_CORRECTION",
  "EXPIRY",
];

const DIRECTION_VALUES: StockMovementDirection[] = ["IN", "OUT"];

export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'&]/g, "")
    .trim();
}

export function validateStockAdjustmentInput(
  raw: StockAdjustmentInput
): { errors: ValidationError[] } | { data: SanitizedStockAdjustmentInput } {
  const errors: ValidationError[] = [];

  if (!raw.productId) {
    errors.push({ field: "productId", message: "Product is required." });
  }

  if (!DIRECTION_VALUES.includes(raw.direction)) {
    errors.push({ field: "direction", message: "Direction must be Increase or Decrease." });
  }

  const quantity = Number(raw.quantity);
  if (!raw.quantity || !Number.isFinite(quantity) || quantity <= 0) {
    errors.push({ field: "quantity", message: "Quantity is required and must be greater than zero." });
  }

  if (!MANUAL_ADJUSTMENT_REASONS.includes(raw.reason)) {
    errors.push({
      field: "reason",
      message: `Reason is required and must be one of: ${MANUAL_ADJUSTMENT_REASONS.join(", ")}.`,
    });
  }

  const notes = sanitize(raw.notes).slice(0, 500);

  if (errors.length > 0) {
    return { errors };
  }

  return {
    data: {
      productId: raw.productId,
      direction: raw.direction,
      quantity,
      reason: raw.reason,
      notes: notes || null,
    },
  };
}
