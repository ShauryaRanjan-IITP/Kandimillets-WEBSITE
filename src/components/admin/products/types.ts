/**
 * Product Management client-facing types — hand-authored and kept
 * independent of the Prisma client / src/lib/products/dto.ts, exactly
 * matching the reasoning already documented in
 * src/components/admin/retailers/types.ts: no server-only import should
 * ever leak into "use client" code.
 */

export interface ProductRow {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  unit: string;
  sellingPrice: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** Sum of totalAmount for non-voided, non-cancelled sales. */
  totalRevenue: number;
  /** Sum of quantity across non-voided sales. */
  unitsSold: number;
  /** Count of non-voided sales (any status). */
  saleCount: number;
  lastSoldDate: string | null;
}

export interface ProductFormValues {
  name: string;
  sku: string;
  category: string;
  unit: string;
  sellingPrice: string;
  description: string;
  isActive: boolean;
}

export function emptyProductFormValues(): ProductFormValues {
  return {
    name: "",
    sku: "",
    category: "",
    unit: "",
    sellingPrice: "",
    description: "",
    isActive: true,
  };
}

export function productToFormValues(product: ProductRow): ProductFormValues {
  return {
    name: product.name,
    sku: product.sku ?? "",
    category: product.category,
    unit: product.unit,
    sellingPrice: product.sellingPrice !== null ? String(product.sellingPrice) : "",
    description: product.description ?? "",
    isActive: product.isActive,
  };
}

export type ProductSortField = "name" | "sku" | "category" | "status" | "sellingPrice" | "createdAt";
export type SortDirection = "asc" | "desc";

export const ALLOWED_UNITS = ["kg", "g", "pack", "box", "litre", "pcs"];
