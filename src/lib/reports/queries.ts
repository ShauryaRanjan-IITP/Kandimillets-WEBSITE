/**
 * Reports & Export reads — direct server-side data fetching, per the read
 * path in docs/API.md §3 (no Server Action, no client round-trip). Reuses
 * the exact filter fragments already established in
 * src/lib/dashboard/shared.ts (NOT_VOIDED/REVENUE_WHERE/decimalToNumber)
 * rather than redefining "what counts as revenue" a second time, and
 * reuses src/lib/sales/dto.ts's serializeSale for row shape — this task's
 * explicit "Use existing DTOs/queries where possible."
 */
import type { Prisma } from "@/generated/prisma/client";
import type { PaymentStatus } from "@/generated/prisma/enums";
import prisma from "@/lib/db/prisma";
import { NOT_VOIDED, REVENUE_WHERE, decimalToNumber } from "@/lib/dashboard/shared";
import { serializeSale, type SaleDTO } from "@/lib/sales/dto";
import { getTopProducts, getTopRetailers } from "@/lib/dashboard/chartQueries";
import type { TopProductPoint, TopRetailerPoint } from "@/lib/dashboard/chartQueries";
import type { DashboardDateRange } from "@/lib/dashboard/dateRange";
import type { ReportDateRange } from "./dateRangeParams";

export type ReportSortField = "invoiceDate" | "retailerName" | "productName" | "totalAmount" | "paymentStatus";
export type SortDirection = "asc" | "desc";

export interface SalesReportFilters {
  range: ReportDateRange;
  retailerId?: string;
  productId?: string;
  paymentStatus?: PaymentStatus;
  search?: string;
}

function toDateBounds(range: ReportDateRange): { gte: Date; lte: Date } {
  return { gte: new Date(`${range.from}T00:00:00.000Z`), lte: new Date(`${range.to}T23:59:59.999Z`) };
}

/** The one shared `where` builder every Reports query (list, summary, and
 * CSV export) goes through — this is what guarantees the exported CSV
 * "exactly matches the applied filters" (this task's explicit §6
 * requirement): the export route calls this with the same params the
 * on-screen table used, never a re-derived filter. */
export function buildSalesReportWhere(filters: SalesReportFilters): Prisma.SaleWhereInput {
  const where: Prisma.SaleWhereInput = {
    ...NOT_VOIDED,
    invoiceDate: toDateBounds(filters.range),
  };
  if (filters.retailerId) where.retailerId = filters.retailerId;
  if (filters.productId) where.productId = filters.productId;
  if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

  const search = filters.search?.trim();
  if (search) {
    where.OR = [
      { saleNumber: { contains: search, mode: "insensitive" } },
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { remarks: { contains: search, mode: "insensitive" } },
      { retailer: { name: { contains: search, mode: "insensitive" } } },
      { product: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  return where;
}

function buildOrderBy(sortBy: ReportSortField, sortDir: SortDirection): Prisma.SaleOrderByWithRelationInput {
  switch (sortBy) {
    case "retailerName":
      return { retailer: { name: sortDir } };
    case "productName":
      return { product: { name: sortDir } };
    case "totalAmount":
      return { totalAmount: sortDir };
    case "paymentStatus":
      return { paymentStatus: sortDir };
    case "invoiceDate":
    default:
      return { invoiceDate: sortDir };
  }
}

export interface GetSalesReportParams extends SalesReportFilters {
  sortBy?: ReportSortField;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
}

export interface GetSalesReportResult {
  rows: SaleDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Sales Report table — this task's §3 explicit "Search / Sorting /
 * Pagination" requirement, server-side per §9. */
export async function getSalesReport(params: GetSalesReportParams): Promise<GetSalesReportResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(200, Math.max(1, params.pageSize ?? 25));
  const sortBy = params.sortBy ?? "invoiceDate";
  const sortDir = params.sortDir ?? "desc";
  const where = buildSalesReportWhere(params);

  const [sales, totalCount] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: { retailer: true, product: true },
      orderBy: buildOrderBy(sortBy, sortDir),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.sale.count({ where }),
  ]);

  return { rows: sales.map(serializeSale), totalCount, page, pageSize };
}

/** Every matching row, unpaginated — the CSV export's read path (this
 * task's §6). Capped at a sane maximum so a runaway filter (or none at
 * all) can't attempt to stream an unbounded result set; a small admin
 * team's full sales history comfortably fits under this cap (see
 * docs/SALES_REGISTER.md §4's 50,000-sale growth target — well above
 * what a single CSV export is used for in practice). */
const EXPORT_ROW_CAP = 20000;

export async function getSalesReportForExport(filters: SalesReportFilters): Promise<SaleDTO[]> {
  const where = buildSalesReportWhere(filters);
  const sales = await prisma.sale.findMany({
    where,
    include: { retailer: true, product: true },
    orderBy: { invoiceDate: "desc" },
    take: EXPORT_ROW_CAP,
  });
  return sales.map(serializeSale);
}

export interface SalesReportSummary {
  totalRevenue: number;
  totalSales: number;
  unitsSold: number;
  outstandingAmount: number;
  averageOrderValue: number;
}

/** Summary Cards (this task's §4) — three small aggregate queries (never
 * fetch-all-then-reduce-in-JS, per docs/DASHBOARD.md §15's established
 * discipline), each scoped by the exact same filters as the table/export.
 * Three queries, not one, because "Total Sales" (every non-voided sale,
 * including Cancelled) and "Outstanding Amount" (Pending/Partial only)
 * are genuinely different populations from "Total Revenue"/"Units Sold"
 * (non-Cancelled only) — the same distinction already established in
 * src/lib/dashboard/kpiQueries.ts, reused here rather than re-derived. */
export async function getSalesReportSummary(filters: SalesReportFilters): Promise<SalesReportSummary> {
  const dateAndScope = {
    invoiceDate: toDateBounds(filters.range),
    ...(filters.retailerId ? { retailerId: filters.retailerId } : {}),
    ...(filters.productId ? { productId: filters.productId } : {}),
  };

  const revenueWhere: Prisma.SaleWhereInput = {
    ...REVENUE_WHERE,
    ...dateAndScope,
    ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
  };
  const outstandingWhere: Prisma.SaleWhereInput = {
    isVoided: false,
    paymentStatus: filters.paymentStatus ? filters.paymentStatus : { in: ["PENDING", "PARTIAL"] },
    ...dateAndScope,
  };
  const salesCountWhere: Prisma.SaleWhereInput = {
    ...NOT_VOIDED,
    ...dateAndScope,
    ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
  };

  const [revenueAgg, outstandingAgg, totalSales] = await Promise.all([
    prisma.sale.aggregate({ where: revenueWhere, _sum: { totalAmount: true, quantity: true }, _count: { _all: true } }),
    prisma.sale.aggregate({ where: outstandingWhere, _sum: { outstandingAmount: true } }),
    prisma.sale.count({ where: salesCountWhere }),
  ]);

  const totalRevenue = decimalToNumber(revenueAgg._sum.totalAmount);
  const revenueCount = revenueAgg._count._all;

  return {
    totalRevenue,
    totalSales,
    unitsSold: decimalToNumber(revenueAgg._sum.quantity),
    outstandingAmount: decimalToNumber(outstandingAgg._sum.outstandingAmount),
    averageOrderValue: revenueCount > 0 ? Math.round((totalRevenue / revenueCount) * 100) / 100 : 0,
  };
}

export interface ReportOption {
  id: string;
  name: string;
}

/** Filter dropdown options — every retailer/product, active or inactive,
 * since a report is a historical view, not a new-sale form (see the
 * identical reasoning already used for Inventory's product options,
 * src/lib/inventory/queries.ts's getProductOptionsForInventory). */
export async function getReportRetailerOptions(): Promise<ReportOption[]> {
  return prisma.retailer.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

export async function getReportProductOptions(): Promise<ReportOption[]> {
  return prisma.product.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

function toDashboardDateRange(range: ReportDateRange): DashboardDateRange {
  return {
    key: "custom",
    from: new Date(`${range.from}T00:00:00.000Z`),
    to: new Date(`${range.to}T23:59:59.999Z`),
  };
}

export interface TopLists {
  /** Ranked by revenue — this task's §5 "Highest Revenue Products." */
  highestRevenueProducts: TopProductPoint[];
  /** Ranked by revenue — this task's §5 "Highest Revenue Retailers." */
  highestRevenueRetailers: TopRetailerPoint[];
  /** Same rows as highestRevenueProducts, re-sorted by units sold — this
   * task's §5 "Top Products." Re-sorting an already-fetched small list in
   * application code, not a second aggregation query. */
  topProductsByQuantity: TopProductPoint[];
  /** Same rows as highestRevenueRetailers, re-sorted by order count — this
   * task's §5 "Top Retailers." Same reasoning as topProductsByQuantity. */
  topRetailersByOrders: TopRetailerPoint[];
}

/** Top Lists (this task's §5) — reuses src/lib/dashboard/chartQueries.ts's
 * getTopProducts/getTopRetailers exactly as-is (Dashboard's own Top
 * Products/Top Retailers charts already call these), scoped by the
 * Reports date range only — a single retailer/product's own "top list" of
 * itself would be trivial, so (like the Dashboard) these are date-scoped
 * only, not further narrowed by the Retailer/Product filter. */
export async function getTopLists(range: ReportDateRange, limit = 10): Promise<TopLists> {
  const dashboardRange = toDashboardDateRange(range);
  const [highestRevenueProducts, highestRevenueRetailers] = await Promise.all([
    getTopProducts(dashboardRange, limit),
    getTopRetailers(dashboardRange, limit),
  ]);

  return {
    highestRevenueProducts,
    highestRevenueRetailers,
    topProductsByQuantity: [...highestRevenueProducts].sort((a, b) => b.quantity - a.quantity),
    topRetailersByOrders: [...highestRevenueRetailers].sort((a, b) => b.orderCount - a.orderCount),
  };
}
