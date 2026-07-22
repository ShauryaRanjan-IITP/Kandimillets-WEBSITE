/**
 * Inventory & Stock Management client-facing types — hand-authored and
 * kept independent of the Prisma client / src/lib/inventory/dto.ts,
 * exactly matching the reasoning already documented in
 * src/components/admin/products/types.ts: no server-only import should
 * ever leak into "use client" code.
 */

export type StockStatus = "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK";

export type StockDirection = "IN" | "OUT";

export type StockReason =
  | "INITIAL_STOCK"
  | "PURCHASE"
  | "SALE"
  | "SALE_EDIT"
  | "SALE_VOID"
  | "DAMAGE"
  | "SAMPLE"
  | "MANUAL_CORRECTION"
  | "EXPIRY";

export const MANUAL_ADJUSTMENT_REASONS: StockReason[] = [
  "INITIAL_STOCK",
  "PURCHASE",
  "DAMAGE",
  "SAMPLE",
  "MANUAL_CORRECTION",
  "EXPIRY",
];

export const REASON_LABELS: Record<StockReason, string> = {
  INITIAL_STOCK: "Initial Stock",
  PURCHASE: "Purchase",
  SALE: "Sale",
  SALE_EDIT: "Sale Edit",
  SALE_VOID: "Sale Void",
  DAMAGE: "Damage",
  SAMPLE: "Sample",
  MANUAL_CORRECTION: "Manual Correction",
  EXPIRY: "Expiry",
};

export interface ProductStockRow {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  unit: string;
  isActive: boolean;
  currentStock: number;
  lowStockThreshold: number | null;
  stockStatus: StockStatus;
  lastMovementAt: string | null;
}

export interface ProductStockDetail extends ProductStockRow {
  totalStockAdded: number;
  totalStockRemoved: number;
}

export interface StockMovementRow {
  id: string;
  productId: string;
  direction: StockDirection;
  quantity: number;
  reason: StockReason;
  notes: string | null;
  reference: string | null;
  balanceAfter: number;
  createdByName: string;
  createdAt: string;
}

export interface ProductStockOption {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  currentStock: number;
  isActive: boolean;
}

export interface StockAdjustmentFormValues {
  productId: string;
  direction: StockDirection;
  quantity: string;
  reason: StockReason;
  notes: string;
}

export function emptyStockAdjustmentFormValues(productId = ""): StockAdjustmentFormValues {
  return {
    productId,
    direction: "IN",
    quantity: "",
    reason: "PURCHASE",
    notes: "",
  };
}

export type InventorySortField = "name" | "sku" | "category" | "currentStock" | "lowStockThreshold";
export type SortDirection = "asc" | "desc";
