/**
 * Sales Register types — client-facing shapes.
 *
 * Hand-authored and kept independent of the Prisma client so this
 * component tree has no server-only import (Decimal, generated enums)
 * leaking into "use client" code. The live database (reconciled in
 * Phase 2C — see docs/SALES_REGISTER.md §14) now matches this shape
 * exactly; src/lib/sales/dto.ts is what converts a Prisma row into this
 * plain-JSON form.
 */

export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "CANCELLED";

export type PaymentMethod = "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE" | "OTHER";

export interface RetailerOption {
  id: string;
  name: string;
  city: string;
  state: string;
  /** Retailer Management module: an inactive retailer only ever appears
   * here if a sale already references it (see
   * getRetailerOptionsForSalesForm in src/lib/sales/queries.ts) — never
   * selectable for a brand-new sale. */
  isActive: boolean;
}

export interface ProductOption {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  /** Product Management module: an inactive product only ever appears
   * here if a sale already references it (see
   * getProductOptionsForSalesForm in src/lib/sales/queries.ts) — never
   * selectable for a brand-new sale. */
  isActive: boolean;
}

export interface SaleRow {
  id: string;
  /** Immutable, system-generated, unique. Never editable. e.g. "SAL-2026-000001" */
  saleNumber: string;
  /** User-editable business reference. Not unique, not the row's key. */
  invoiceNumber: string;
  /** ISO date string (yyyy-mm-dd) — the business date. */
  invoiceDate: string;
  /** ISO date string — defaults to invoiceDate if no credit term is given. */
  dueDate: string;
  retailerId: string;
  retailerName: string;
  city: string;
  state: string;
  productId: string;
  productName: string;
  category: string;
  /** Decimal — supports fractional quantities like 10.5, 2.75, 0.5. */
  quantity: number;
  unit: string;
  rate: number;
  gstIncluded: boolean;
  /** Always quantity * rate. Never entered directly. */
  totalAmount: number;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  /** Always totalAmount - amountPaid. Never entered directly. */
  outstandingAmount: number;
  paymentDate: string | null;
  paymentMethod: PaymentMethod | null;
  remarks: string | null;
}

/** Fields an admin actually fills in when adding or editing a sale.
 * Everything else on SaleRow (id, saleNumber, totalAmount,
 * outstandingAmount, retailer/product display fields) is derived or
 * server-assigned — see docs/SALES_REGISTER.md §6/§9. */
export interface AddSaleFormValues {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  retailerId: string;
  productId: string;
  quantity: string;
  unit: string;
  rate: string;
  gstIncluded: boolean;
  paymentMethod: PaymentMethod | "";
  paymentStatus: PaymentStatus;
  /** Only meaningful when paymentStatus is PARTIAL or PAID — see §10. */
  amountPaid: string;
  paymentDate: string;
  remarks: string;
}

export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["PENDING", "PARTIAL", "PAID", "CANCELLED"];

export const PAYMENT_METHOD_OPTIONS: PaymentMethod[] = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"];

export type QuickDateFilterKey =
  | "none"
  | "today"
  | "yesterday"
  | "thisWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom"
  | "archiveMonth";

export interface DateFilterState {
  key: QuickDateFilterKey;
  /** Inclusive ISO date bounds (yyyy-mm-dd). Null on both sides = no date filter. */
  from: string | null;
  to: string | null;
  /** Set only when key === "archiveMonth", for highlighting the active entry. */
  archiveYear?: number;
  archiveMonth?: number;
}

export const DEFAULT_DATE_FILTER: DateFilterState = {
  key: "none",
  from: null,
  to: null,
};
