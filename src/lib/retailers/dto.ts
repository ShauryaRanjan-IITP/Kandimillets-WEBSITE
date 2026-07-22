/**
 * Converts a Prisma Retailer row into the plain-JSON shape client
 * components expect — same purpose as src/lib/sales/dto.ts's
 * serializeSale, for the same reason (keep Prisma/Decimal types out of
 * "use client" code).
 */
import type { Retailer } from "@/generated/prisma/client";

export function serializeRetailer(retailer: Retailer) {
  return {
    id: retailer.id,
    name: retailer.name,
    contactPerson: retailer.contactPerson,
    phone: retailer.phone,
    alternatePhone: retailer.alternatePhone,
    email: retailer.email,
    gstin: retailer.gstin,
    address: retailer.address,
    city: retailer.city,
    state: retailer.state,
    pincode: retailer.pincode,
    notes: retailer.notes,
    isActive: retailer.isActive,
    createdAt: retailer.createdAt.toISOString(),
    updatedAt: retailer.updatedAt.toISOString(),
  };
}

export type RetailerDTO = ReturnType<typeof serializeRetailer>;

export interface RetailerSummary {
  totalSales: number;
  outstandingAmount: number;
  orderCount: number;
  lastPurchaseDate: string | null;
}

export type RetailerRowDTO = RetailerDTO & RetailerSummary;
