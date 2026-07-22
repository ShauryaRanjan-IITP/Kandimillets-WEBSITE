/**
 * Converts a Prisma Sale row (with Retailer/Product relations included)
 * into the plain-JSON SaleRow shape the Sales Register UI already expects
 * (src/components/admin/sales/types.ts) — Decimal -> number, Date -> ISO
 * date string. Keeps Prisma types out of client-facing code.
 */
import type { Prisma } from "@/generated/prisma/client";

export type SaleWithRelations = Prisma.SaleGetPayload<{
  include: { retailer: true; product: true };
}>;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function serializeSale(sale: SaleWithRelations) {
  return {
    id: sale.id,
    saleNumber: sale.saleNumber,
    invoiceNumber: sale.invoiceNumber,
    invoiceDate: toIsoDate(sale.invoiceDate),
    dueDate: toIsoDate(sale.dueDate),
    retailerId: sale.retailerId,
    retailerName: sale.retailer.name,
    city: sale.retailer.city,
    state: sale.retailer.state,
    productId: sale.productId,
    productName: sale.product.name,
    category: sale.product.category,
    quantity: sale.quantity.toNumber(),
    unit: sale.unit,
    rate: sale.rate.toNumber(),
    gstIncluded: sale.gstIncluded,
    totalAmount: sale.totalAmount.toNumber(),
    paymentStatus: sale.paymentStatus,
    amountPaid: sale.amountPaid.toNumber(),
    outstandingAmount: sale.outstandingAmount.toNumber(),
    paymentDate: sale.paymentDate ? toIsoDate(sale.paymentDate) : null,
    paymentMethod: sale.paymentMethod,
    remarks: sale.remarks,
    isVoided: sale.isVoided,
    voidReason: sale.voidReason,
  };
}

export type SaleDTO = ReturnType<typeof serializeSale>;
