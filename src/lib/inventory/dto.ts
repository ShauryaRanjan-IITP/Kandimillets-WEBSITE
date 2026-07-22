/**
 * Converts Prisma Product/StockMovement rows into the plain-JSON shapes
 * client components expect — same purpose as src/lib/products/dto.ts's
 * serializeProduct, for the same reason (keep Prisma/Decimal types out of
 * "use client" code).
 */
import type { Product, StockMovement, User } from "@/generated/prisma/client";

/** "In Stock" / "Low Stock" / "Out of Stock" is a UI-computed display
 * state derived from currentStock + lowStockThreshold — never stored,
 * exactly the same pattern already used for Sales' "Overdue" status
 * (docs/SALES_REGISTER.md §3). */
export type StockStatus = "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK";

export function computeStockStatus(currentStock: number, lowStockThreshold: number | null): StockStatus {
  if (currentStock <= 0) return "OUT_OF_STOCK";
  if (lowStockThreshold !== null && currentStock <= lowStockThreshold) return "LOW_STOCK";
  return "IN_STOCK";
}

export function serializeProductStock(product: Product) {
  const currentStock = product.currentStock.toNumber();
  const lowStockThreshold = product.lowStockThreshold ? product.lowStockThreshold.toNumber() : null;
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category,
    unit: product.defaultUnit,
    isActive: product.isActive,
    currentStock,
    lowStockThreshold,
    stockStatus: computeStockStatus(currentStock, lowStockThreshold),
  };
}

export type ProductStockDTO = ReturnType<typeof serializeProductStock>;

export interface StockActivitySummary {
  lastMovementAt: string | null;
}

export type ProductStockRowDTO = ProductStockDTO & StockActivitySummary;

export function serializeStockMovement(movement: StockMovement & { createdByUser: User }) {
  return {
    id: movement.id,
    productId: movement.productId,
    direction: movement.direction,
    quantity: movement.quantity.toNumber(),
    reason: movement.reason,
    notes: movement.notes,
    reference: movement.reference,
    balanceAfter: movement.balanceAfter.toNumber(),
    createdByName: movement.createdByUser.name,
    createdAt: movement.createdAt.toISOString(),
  };
}

export type StockMovementDTO = ReturnType<typeof serializeStockMovement>;

export interface ProductStockDetail extends ProductStockDTO {
  totalStockAdded: number;
  totalStockRemoved: number;
  lastMovementAt: string | null;
}
