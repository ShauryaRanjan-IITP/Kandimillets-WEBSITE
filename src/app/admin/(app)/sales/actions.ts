"use server";

/**
 * Sales Register Server Actions — Phase 2C. Implements the Create/Update/
 * Void Sale contracts from docs/API.md §5, following the same
 * sanitize -> validate -> business logic -> Prisma chain already
 * established by submitInquiry (src/app/(site)/actions.ts) and mandated
 * by docs/API.md §3's standard write-path flow.
 *
 * Every action independently re-verifies the caller's session server-side
 * (docs/API.md §2/§12) — the proxy's cookie check is a fast gate, not the
 * sole authority.
 */
import { revalidatePath } from "next/cache";
import { getSessionSafe } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { serializeSale, type SaleDTO } from "@/lib/sales/dto";
import { generateSaleNumber } from "@/lib/sales/saleNumber";
import { getSaleById } from "@/lib/sales/queries";
import {
  validateSaleInput,
  validateVoidReason,
  type SaleInput,
  type ValidationError,
} from "@/lib/sales/validation";
import { applyStockMovement, InsufficientStockError } from "@/lib/inventory/stockMovement";
import { writeAuditLog } from "@/lib/audit/log";

export type SaleActionState =
  | { status: "success"; sale: SaleDTO }
  | { status: "validation_error"; message: string; errors: ValidationError[] }
  | { status: "auth_error"; message: string }
  | { status: "business_rule_error"; message: string }
  | { status: "error"; message: string };

async function requireSession() {
  return getSessionSafe();
}

const MAX_SALE_NUMBER_RETRIES = 3;

export async function createSale(input: SaleInput): Promise<SaleActionState> {
  const session = await requireSession();
  if (!session) {
    return { status: "auth_error", message: "You must be signed in to record a sale." };
  }

  const result = validateSaleInput(input);
  if ("errors" in result) {
    return { status: "validation_error", message: "Please fix the errors below.", errors: result.errors };
  }
  const data = result.data;

  const [retailer, product] = await Promise.all([
    prisma.retailer.findUnique({ where: { id: data.retailerId } }),
    prisma.product.findUnique({ where: { id: data.productId } }),
  ]);
  if (!retailer || !retailer.isActive) {
    return {
      status: "validation_error",
      message: "Please fix the errors below.",
      errors: [{ field: "retailerId", message: "Selected Retailer does not exist or is inactive." }],
    };
  }
  if (!product || !product.isActive) {
    return {
      status: "validation_error",
      message: "Please fix the errors below.",
      errors: [{ field: "productId", message: "Selected Product does not exist or is inactive." }],
    };
  }

  const year = Number(data.invoiceDate.slice(0, 4));
  const outstandingAmount = Math.round((data.totalAmount - data.amountPaid) * 100) / 100;

  for (let attempt = 1; attempt <= MAX_SALE_NUMBER_RETRIES; attempt++) {
    try {
      const sale = await prisma.$transaction(async (tx) => {
        const saleNumber = await generateSaleNumber(tx, year);
        const created = await tx.sale.create({
          data: {
            saleNumber,
            invoiceNumber: data.invoiceNumber,
            invoiceDate: new Date(data.invoiceDate),
            dueDate: new Date(data.dueDate),
            retailerId: data.retailerId,
            productId: data.productId,
            quantity: new Prisma.Decimal(data.quantity),
            unit: data.unit,
            rate: new Prisma.Decimal(data.rate),
            gstIncluded: data.gstIncluded,
            totalAmount: new Prisma.Decimal(data.totalAmount),
            paymentStatus: data.paymentStatus,
            amountPaid: new Prisma.Decimal(data.amountPaid),
            outstandingAmount: new Prisma.Decimal(outstandingAmount),
            paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
            paymentMethod: data.paymentMethod,
            remarks: data.remarks,
            createdByUserId: session.user.id,
          },
          include: { retailer: true, product: true },
        });

        // Inventory & Stock Management: a Sale is the source of truth for
        // stock movement — creating one deducts stock atomically with the
        // row itself (same transaction), never as a separate write.
        await applyStockMovement(tx, {
          productId: data.productId,
          direction: "OUT",
          quantity: data.quantity,
          reason: "SALE",
          reference: saleNumber,
          userId: session.user.id,
        });

        await writeAuditLog(
          {
            userId: session.user.id,
            userName: session.user.name,
            action: "CREATE",
            entityType: "SALE",
            entityId: created.id,
            reference: saleNumber,
            summary: `${session.user.name} recorded sale ${saleNumber} for ${created.retailer.name}.`,
          },
          tx
        );

        return created;
      });
      revalidatePath("/admin/inventory");
      revalidatePath(`/admin/inventory/${data.productId}`);
      return { status: "success", sale: serializeSale(sale) };
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        return {
          status: "business_rule_error",
          message: `Not enough stock to record this sale — only ${error.available} ${data.unit} available.`,
        };
      }
      const isUniqueClash =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        Array.isArray(error.meta?.target) &&
        (error.meta.target as string[]).includes("saleNumber");
      if (isUniqueClash && attempt < MAX_SALE_NUMBER_RETRIES) {
        continue;
      }
      console.error("createSale failed:", error);
      return { status: "error", message: "Could not save the sale. Please try again." };
    }
  }

  return { status: "error", message: "Could not save the sale. Please try again." };
}

export async function updateSale(id: string, input: SaleInput): Promise<SaleActionState> {
  const session = await requireSession();
  if (!session) {
    return { status: "auth_error", message: "You must be signed in to edit a sale." };
  }

  const existing = await getSaleById(id);
  if (!existing) {
    return { status: "error", message: "This sale could not be found." };
  }
  if (existing.isVoided) {
    return { status: "business_rule_error", message: "A voided sale cannot be edited." };
  }

  const result = validateSaleInput(input);
  if ("errors" in result) {
    return { status: "validation_error", message: "Please fix the errors below.", errors: result.errors };
  }
  const data = result.data;

  const [retailer, product] = await Promise.all([
    prisma.retailer.findUnique({ where: { id: data.retailerId } }),
    prisma.product.findUnique({ where: { id: data.productId } }),
  ]);
  if (!retailer || !retailer.isActive) {
    return {
      status: "validation_error",
      message: "Please fix the errors below.",
      errors: [{ field: "retailerId", message: "Selected Retailer does not exist or is inactive." }],
    };
  }
  if (!product || !product.isActive) {
    return {
      status: "validation_error",
      message: "Please fix the errors below.",
      errors: [{ field: "productId", message: "Selected Product does not exist or is inactive." }],
    };
  }

  const outstandingAmount = Math.round((data.totalAmount - data.amountPaid) * 100) / 100;

  // Inventory & Stock Management: editing a sale's Product/Quantity moves
  // stock by the delta, never by re-deriving it from scratch — reverse the
  // original movement's effect (restore the old product/quantity), then
  // reapply for the new product/quantity, both tagged SALE_EDIT so the
  // ledger reads clearly. Skipped entirely when neither changed, so a
  // pure Payment Status/Remarks edit never writes noise into the ledger.
  const stockUnchanged = existing.productId === data.productId && existing.quantity === data.quantity;

  try {
    const sale = await prisma.$transaction(async (tx) => {
      if (!stockUnchanged) {
        await applyStockMovement(tx, {
          productId: existing.productId,
          direction: "IN",
          quantity: existing.quantity,
          reason: "SALE_EDIT",
          reference: existing.saleNumber,
          userId: session.user.id,
        });
        await applyStockMovement(tx, {
          productId: data.productId,
          direction: "OUT",
          quantity: data.quantity,
          reason: "SALE_EDIT",
          reference: existing.saleNumber,
          userId: session.user.id,
        });
      }

      const updatedSale = await tx.sale.update({
        where: { id },
        data: {
          invoiceNumber: data.invoiceNumber,
          invoiceDate: new Date(data.invoiceDate),
          dueDate: new Date(data.dueDate),
          retailerId: data.retailerId,
          productId: data.productId,
          quantity: new Prisma.Decimal(data.quantity),
          unit: data.unit,
          rate: new Prisma.Decimal(data.rate),
          gstIncluded: data.gstIncluded,
          totalAmount: new Prisma.Decimal(data.totalAmount),
          paymentStatus: data.paymentStatus,
          amountPaid: new Prisma.Decimal(data.amountPaid),
          outstandingAmount: new Prisma.Decimal(outstandingAmount),
          paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
          paymentMethod: data.paymentMethod,
          remarks: data.remarks,
          updatedByUserId: session.user.id,
        },
        include: { retailer: true, product: true },
      });

      await writeAuditLog(
        {
          userId: session.user.id,
          userName: session.user.name,
          action: "UPDATE",
          entityType: "SALE",
          entityId: updatedSale.id,
          reference: existing.saleNumber,
          summary: `${session.user.name} updated sale ${existing.saleNumber}.`,
        },
        tx
      );

      return updatedSale;
    });
    revalidatePath("/admin/inventory");
    revalidatePath(`/admin/inventory/${existing.productId}`);
    if (data.productId !== existing.productId) revalidatePath(`/admin/inventory/${data.productId}`);
    return { status: "success", sale: serializeSale(sale) };
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return {
        status: "business_rule_error",
        message: `Not enough stock to apply this change — only ${error.available} ${data.unit} available.`,
      };
    }
    console.error("updateSale failed:", error);
    return { status: "error", message: "Could not save the changes. Please try again." };
  }
}

export async function voidSale(id: string, reason: string): Promise<SaleActionState> {
  const session = await requireSession();
  if (!session) {
    return { status: "auth_error", message: "You must be signed in to void a sale." };
  }

  const reasonResult = validateVoidReason(reason);
  if ("error" in reasonResult) {
    return { status: "validation_error", message: "Please fix the errors below.", errors: [reasonResult.error] };
  }

  const existing = await getSaleById(id);
  if (!existing) {
    return { status: "error", message: "This sale could not be found." };
  }
  if (existing.isVoided) {
    return { status: "business_rule_error", message: "This sale has already been voided." };
  }

  try {
    const sale = await prisma.$transaction(async (tx) => {
      // Inventory & Stock Management: voiding a sale restores the stock it
      // had deducted — atomically with the void itself, same transaction.
      await applyStockMovement(tx, {
        productId: existing.productId,
        direction: "IN",
        quantity: existing.quantity,
        reason: "SALE_VOID",
        reference: existing.saleNumber,
        userId: session.user.id,
      });

      const voided = await tx.sale.update({
        where: { id },
        data: {
          isVoided: true,
          voidReason: reasonResult.reason,
          updatedByUserId: session.user.id,
        },
        include: { retailer: true, product: true },
      });

      await writeAuditLog(
        {
          userId: session.user.id,
          userName: session.user.name,
          action: "VOID",
          entityType: "SALE",
          entityId: voided.id,
          reference: existing.saleNumber,
          summary: `${session.user.name} voided sale ${existing.saleNumber}: ${reasonResult.reason}`,
        },
        tx
      );

      return voided;
    });
    revalidatePath("/admin/inventory");
    revalidatePath(`/admin/inventory/${existing.productId}`);
    return { status: "success", sale: serializeSale(sale) };
  } catch (error) {
    console.error("voidSale failed:", error);
    return { status: "error", message: "Could not void the sale. Please try again." };
  }
}
