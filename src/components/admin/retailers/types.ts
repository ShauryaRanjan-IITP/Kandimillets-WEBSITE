/**
 * Retailer Management client-facing types — hand-authored and kept
 * independent of the Prisma client / src/lib/retailers/dto.ts, exactly
 * matching the reasoning already documented in
 * src/components/admin/sales/types.ts: no server-only import should ever
 * leak into "use client" code.
 */

export interface RetailerRow {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  alternatePhone: string | null;
  email: string | null;
  gstin: string | null;
  address: string | null;
  city: string;
  state: string;
  pincode: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** Sum of totalAmount for non-voided, non-cancelled sales. */
  totalSales: number;
  /** Sum of outstandingAmount for non-voided Pending/Partial sales. */
  outstandingAmount: number;
  /** Count of non-voided sales (any status). */
  orderCount: number;
  lastPurchaseDate: string | null;
}

export interface RetailerFormValues {
  name: string;
  contactPerson: string;
  phone: string;
  alternatePhone: string;
  email: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
  isActive: boolean;
}

export function emptyRetailerFormValues(): RetailerFormValues {
  return {
    name: "",
    contactPerson: "",
    phone: "",
    alternatePhone: "",
    email: "",
    gstin: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
    isActive: true,
  };
}

export function retailerToFormValues(retailer: RetailerRow): RetailerFormValues {
  return {
    name: retailer.name,
    contactPerson: retailer.contactPerson ?? "",
    phone: retailer.phone ?? "",
    alternatePhone: retailer.alternatePhone ?? "",
    email: retailer.email ?? "",
    gstin: retailer.gstin ?? "",
    address: retailer.address ?? "",
    city: retailer.city,
    state: retailer.state,
    pincode: retailer.pincode ?? "",
    notes: retailer.notes ?? "",
    isActive: retailer.isActive,
  };
}

export type RetailerSortField = "name" | "city" | "status" | "createdAt";
export type SortDirection = "asc" | "desc";
