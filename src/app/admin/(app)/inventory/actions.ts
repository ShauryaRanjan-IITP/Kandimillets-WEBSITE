"use server";

/**
 * Inventory & Stock Management Server Actions — follows the exact
 * sanitize -> validate -> business logic -> Prisma chain and response
 * shape already established by src/app/admin/(app)/products/actions.ts
 * (itself mandated by docs/API.md §3/§4), reused rather than reinvented.
 *
 * `adjustStock` is the only mutation this module owns — it is a thin
 * wrapper around the shared `applyStockMovement` engine
 * (src/lib/inventory/stockMovement.ts), the same engine the Sales
 * Register's Create/Update/Void Sale actions call, so stock logic is
 * never duplicated (this task's explicit requirement).
 *
 * Every action independently re-verifies the caller's session server-side
 * (docs/API.md §2/§12) — the proxy's cookie check is a fast gate, not the
 * sole authority.
 */
import { revalidatePath } from "next/cache";
import { getSessionSafe } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { applyStockMovement, InsufficientStockError } from "@/lib/inventory/stockMovement";
import { serializeProductStock, type ProductStockDTO } from "@/lib/inventory/dto";
import {
  validateStockAdjustmentInput,
  type StockAdjustmentInput,
  type ValidationError,
} from "@/lib/inventory/validation";
import { writeAuditLog } from "@/lib/audit/log";

export type InventoryActionState =
  | { status: "success"; product: ProductStockDTO }
  | { status: "validation_error"; message: string; errors: ValidationError[] }
  | { status: "auth_error"; message: string }
  | { status: "business_rule_error"; message: string }
  | { status: "error"; message: string };

async function requireSession() {
  return getSessionSafe();
}

export async function adjustStock(input: StockAdjustmentInput): Promise<InventoryActionState> {
  const session = await requireSession();
  if (!session) {
    return { status: "auth_error", message: "You must be signed in to adjust stock." };
  }

  const result = validateStockAdjustmentInput(input);
  if ("errors" in result) {
    return { status: "validation_error", message: "Please fix the errors below.", errors: result.errors };
  }
  const data = result.data;

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) {
    return {
      status: "validation_error",
      message: "Please fix the errors below.",
      errors: [{ field: "productId", message: "Selected Product does not exist." }],
    };
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      await applyStockMovement(tx, {
        productId: data.productId,
        direction: data.direction,
        quantity: data.quantity,
        reason: data.reason,
        notes: data.notes,
        reference: null,
        userId: session.user.id,
      });
      await writeAuditLog(
        {
          userId: session.user.id,
          userName: session.user.name,
          action: "ADJUSTMENT",
          entityType: "STOCK_MOVEMENT",
          entityId: data.productId,
          reference: product.name,
          summary: `${session.user.name} ${data.direction === "IN" ? "increased" : "decreased"} stock for "${product.name}" by ${data.quantity} (${data.reason}).`,
        },
        tx
      );
      return tx.product.findUniqueOrThrow({ where: { id: data.productId } });
    });

    revalidatePath("/admin/inventory");
    revalidatePath(`/admin/inventory/${data.productId}`);
    revalidatePath("/admin/dashboard");
    return { status: "success", product: serializeProductStock(updated) };
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return {
        status: "business_rule_error",
        message: `This would take stock negative — only ${error.available} ${product.defaultUnit} currently in stock.`,
      };
    }
    console.error("adjustStock failed:", error);
    return { status: "error", message: "Could not save this stock adjustment. Please try again." };
  }
}
