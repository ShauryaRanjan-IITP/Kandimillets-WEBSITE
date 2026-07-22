/**
 * Reports & Export client-facing types — hand-authored and kept
 * independent of the Prisma client, exactly matching the reasoning
 * already documented in src/components/admin/sales/types.ts /
 * src/components/admin/inventory/types.ts: no server-only import should
 * ever leak into "use client" code.
 */
import type { PaymentMethod, PaymentStatus } from "@/components/admin/sales/types";

export type { PaymentStatus, PaymentMethod };

export type ReportDateRangeKey = "today" | "thisWeek" | "thisMonth" | "thisYear" | "custom";

export interface ReportDateRangeOption {
  key: ReportDateRangeKey;
  label: string;
}

export const REPORT_DATE_RANGE_OPTIONS: ReportDateRangeOption[] = [
  { key: "today", label: "Today" },
  { key: "thisWeek", label: "This Week" },
  { key: "thisMonth", label: "This Month" },
  { key: "thisYear", label: "This Year" },
  { key: "custom", label: "Custom Range" },
];

export interface ReportOption {
  id: string;
  name: string;
}

export interface ReportFiltersState {
  rangeKey: ReportDateRangeKey;
  customFrom: string;
  customTo: string;
  retailerId: string;
  productId: string;
  paymentStatus: PaymentStatus | "";
  search: string;
}

export interface SalesReportRow {
  id: string;
  saleNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  retailerName: string;
  productName: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  dueDate: string;
  outstandingAmount: number;
}

export interface SalesReportSummary {
  totalRevenue: number;
  totalSales: number;
  unitsSold: number;
  outstandingAmount: number;
  averageOrderValue: number;
}

export interface TopProductPoint {
  productId: string;
  name: string;
  category: string;
  revenue: number;
  quantity: number;
}

export interface TopRetailerPoint {
  retailerId: string;
  name: string;
  city: string;
  revenue: number;
  orderCount: number;
}

export type ReportSortField = "invoiceDate" | "retailerName" | "productName" | "totalAmount" | "paymentStatus";
export type SortDirection = "asc" | "desc";
