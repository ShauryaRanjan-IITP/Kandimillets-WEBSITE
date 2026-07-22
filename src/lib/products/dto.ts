/**
 * Converts a Prisma Product row into the plain-JSON shape client
 * components expect — same purpose as src/lib/retailers/dto.ts's
 * serializeRetailer, for the same reason (keep Prisma/Decimal types out of
 * "use client" code).
 */
import type { Product } from "@/generated/prisma/client";

export function serializeProduct(product: Product) {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category,
    unit: product.defaultUnit,
    sellingPrice: product.sellingPrice ? product.sellingPrice.toNumber() : null,
    description: product.description,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export type ProductDTO = ReturnType<typeof serializeProduct>;

export interface ProductSummary {
  totalRevenue: number;
  unitsSold: number;
  saleCount: number;
  lastSoldDate: string | null;
}

export type ProductRowDTO = ProductDTO & ProductSummary;

export interface TopRetailer {
  retailerId: string;
  retailerName: string;
  totalRevenue: number;
}
