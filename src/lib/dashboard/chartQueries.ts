/**
 * Dashboard chart data — see docs/DASHBOARD.md §5 and Appendix A.
 * Backend only (Phase 3A): these return normalized, chart-library-agnostic
 * datasets. No chart rendering or component wiring happens here.
 */
import prisma from "@/lib/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import type { PaymentStatus } from "@/generated/prisma/enums";
import { REVENUE_WHERE, decimalToNumber } from "./shared";
import type { DashboardDateRange } from "./dateRange";

export interface MonthlyRevenuePoint {
  year: number;
  month: number; // 1-12
  total: number;
}

interface RawMonthlyRevenueRow {
  month: Date;
  total: number;
}

/** Monthly Revenue — current-year bar chart, zero-filled January through
 * the current month (docs/DASHBOARD.md §5). `year` defaults to the
 * current year; pass a prior year for the documented "future filters"
 * year selector. */
export async function getMonthlyRevenue(year?: number): Promise<MonthlyRevenuePoint[]> {
  const now = new Date();
  const targetYear = year ?? now.getUTCFullYear();
  const start = new Date(Date.UTC(targetYear, 0, 1));
  const end = new Date(Date.UTC(targetYear, 11, 31));

  const rows = await prisma.$queryRaw<RawMonthlyRevenueRow[]>(Prisma.sql`
    SELECT date_trunc('month', "invoiceDate") AS month,
           COALESCE(SUM("totalAmount"), 0)::float8 AS total
    FROM "sale"
    WHERE "isVoided" = false
      AND "paymentStatus" != 'CANCELLED'
      AND "invoiceDate" >= ${start}
      AND "invoiceDate" <= ${end}
    GROUP BY month
    ORDER BY month ASC
  `);

  const totalsByMonth = new Map<number, number>();
  for (const row of rows) {
    totalsByMonth.set(new Date(row.month).getUTCMonth(), row.total);
  }

  const lastMonthIndex = targetYear === now.getUTCFullYear() ? now.getUTCMonth() : 11;
  const points: MonthlyRevenuePoint[] = [];
  for (let m = 0; m <= lastMonthIndex; m++) {
    points.push({ year: targetYear, month: m + 1, total: totalsByMonth.get(m) ?? 0 });
  }
  return points;
}

/** Revenue Trend — full recorded history, never scoped by the Global Date
 * Filter (docs/DASHBOARD.md §5/§6). Sparse: only months with at least one
 * recorded sale appear — unlike Monthly Revenue, zero-filling an unbounded
 * multi-year history isn't meaningful. */
export async function getRevenueTrend(): Promise<MonthlyRevenuePoint[]> {
  const rows = await prisma.$queryRaw<RawMonthlyRevenueRow[]>(Prisma.sql`
    SELECT date_trunc('month', "invoiceDate") AS month,
           COALESCE(SUM("totalAmount"), 0)::float8 AS total
    FROM "sale"
    WHERE "isVoided" = false
      AND "paymentStatus" != 'CANCELLED'
    GROUP BY month
    ORDER BY month ASC
  `);

  return rows.map((row) => {
    const d = new Date(row.month);
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, total: row.total };
  });
}

export interface PaymentStatusDistributionPoint {
  status: PaymentStatus;
  count: number;
  amount: number;
}

/** Payment Status Distribution — grouped by status within the selected
 * range. Returns both count and ₹ amount so a future "by count vs. by
 * amount" toggle (docs/DASHBOARD.md §5) needs no second query. */
export async function getPaymentStatusDistribution(
  range: DashboardDateRange
): Promise<PaymentStatusDistributionPoint[]> {
  const grouped = await prisma.sale.groupBy({
    by: ["paymentStatus"],
    where: { isVoided: false, invoiceDate: { gte: range.from, lte: range.to } },
    _count: { _all: true },
    _sum: { totalAmount: true },
  });

  return grouped.map((g) => ({
    status: g.paymentStatus,
    count: g._count._all,
    amount: decimalToNumber(g._sum.totalAmount),
  }));
}

export interface TopProductPoint {
  productId: string;
  name: string;
  category: string;
  revenue: number;
  quantity: number;
}

/** Top Products — ranked by revenue, within the selected range. Returns
 * quantity alongside revenue so the documented revenue/quantity ranking
 * toggle (docs/DASHBOARD.md §5) needs no second query. A single follow-up
 * lookup resolves product names — not one query per product (no N+1). */
export async function getTopProducts(range: DashboardDateRange, limit = 10): Promise<TopProductPoint[]> {
  const grouped = await prisma.sale.groupBy({
    by: ["productId"],
    where: { ...REVENUE_WHERE, invoiceDate: { gte: range.from, lte: range.to } },
    _sum: { totalAmount: true, quantity: true },
    orderBy: { _sum: { totalAmount: "desc" } },
    take: limit,
  });
  if (grouped.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: grouped.map((g) => g.productId) } },
    select: { id: true, name: true, category: true },
  });
  const productsById = new Map(products.map((p) => [p.id, p]));

  return grouped.map((g) => {
    const product = productsById.get(g.productId);
    return {
      productId: g.productId,
      name: product?.name ?? "Unknown product",
      category: product?.category ?? "unknown",
      revenue: decimalToNumber(g._sum.totalAmount),
      quantity: decimalToNumber(g._sum.quantity),
    };
  });
}

export interface TopRetailerPoint {
  retailerId: string;
  name: string;
  city: string;
  revenue: number;
  /** Reused by the Reports module's "Top Retailers" list (ranked by order
   * count rather than revenue) — additive field on the same groupBy, not
   * a second aggregation query. */
  orderCount: number;
}

/** Top Retailers — ranked by revenue, within the selected range. Same
 * single-follow-up-query shape as getTopProducts, no N+1. */
export async function getTopRetailers(range: DashboardDateRange, limit = 10): Promise<TopRetailerPoint[]> {
  const grouped = await prisma.sale.groupBy({
    by: ["retailerId"],
    where: { ...REVENUE_WHERE, invoiceDate: { gte: range.from, lte: range.to } },
    _sum: { totalAmount: true },
    _count: { _all: true },
    orderBy: { _sum: { totalAmount: "desc" } },
    take: limit,
  });
  if (grouped.length === 0) return [];

  const retailers = await prisma.retailer.findMany({
    where: { id: { in: grouped.map((g) => g.retailerId) } },
    select: { id: true, name: true, city: true },
  });
  const retailersById = new Map(retailers.map((r) => [r.id, r]));

  return grouped.map((g) => {
    const retailer = retailersById.get(g.retailerId);
    return {
      retailerId: g.retailerId,
      name: retailer?.name ?? "Unknown retailer",
      city: retailer?.city ?? "",
      revenue: decimalToNumber(g._sum.totalAmount),
      orderCount: g._count._all,
    };
  });
}
