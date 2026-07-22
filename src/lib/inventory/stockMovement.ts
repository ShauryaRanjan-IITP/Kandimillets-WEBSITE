/**
 * Shared stock movement engine — the single place that ever writes to
 * Product.currentStock or the StockMovement ledger. Every caller (Sales
 * Register's Create/Update/Void Sale actions, and this module's manual
 * Stock Adjustment action) goes through `applyStockMovement`, so stock
 * logic is never duplicated (this task's explicit "Never duplicate logic.
 * Reuse shared stock movement functions" requirement).
 *
 * Must always be called inside the caller's own `prisma.$transaction`,
 * passing the transaction client (`tx`) through — reading currentStock,
 * writing the new balance, and appending the ledger row must land
 * atomically with whatever business event caused them (a sale being
 * created, a sale being voided, an adjustment being saved), exactly as
 * docs/API.md §14 requires for any multi-table write representing one
 * logical event.
 */
import type { Prisma, StockMovementDirection, StockMovementReason } from "@/generated/prisma/client";
import { Prisma as PrismaRuntime } from "@/generated/prisma/client";

export class InsufficientStockError extends Error {
  constructor(
    public readonly productId: string,
    public readonly available: number,
    public readonly requested: number
  ) {
    super(`Insufficient stock: requested ${requested}, only ${available} available.`);
    this.name = "InsufficientStockError";
  }
}

export interface ApplyStockMovementInput {
  productId: string;
  direction: StockMovementDirection;
  /** Always positive — `direction` carries the sign, never a negative quantity. */
  quantity: number;
  reason: StockMovementReason;
  notes?: string | null;
  /** Free-text pointer back to the originating Sale (its saleNumber), null for manual adjustments. */
  reference?: string | null;
  userId: string;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Applies one stock movement: reads the product's current balance,
 * computes the new balance, guards against it ever going negative (this
 * task's explicit "Never allow stock to become negative" rule — enforced
 * here once, for every caller, rather than re-checked ad hoc), persists
 * the new balance on Product.currentStock, and appends one immutable
 * StockMovement row recording the resulting balance. Throws
 * InsufficientStockError (a distinguishable, catchable type) rather than
 * a generic Error so callers can surface it as a business-rule error
 * instead of an unexpected one.
 */
export async function applyStockMovement(tx: Prisma.TransactionClient, input: ApplyStockMovementInput) {
  const product = await tx.product.findUnique({
    where: { id: input.productId },
    select: { currentStock: true },
  });
  if (!product) {
    throw new Error(`Product ${input.productId} not found for stock movement.`);
  }

  const current = product.currentStock.toNumber();
  const delta = input.direction === "IN" ? input.quantity : -input.quantity;
  const newBalance = round3(current + delta);

  if (newBalance < 0) {
    throw new InsufficientStockError(input.productId, current, input.quantity);
  }

  await tx.product.update({
    where: { id: input.productId },
    data: { currentStock: new PrismaRuntime.Decimal(newBalance) },
  });

  return tx.stockMovement.create({
    data: {
      productId: input.productId,
      direction: input.direction,
      quantity: new PrismaRuntime.Decimal(input.quantity),
      reason: input.reason,
      notes: input.notes ?? null,
      reference: input.reference ?? null,
      balanceAfter: new PrismaRuntime.Decimal(newBalance),
      createdByUserId: input.userId,
    },
  });
}
