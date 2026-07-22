/**
 * Dashboard KPI aggregations — see docs/DASHBOARD.md §4 and Appendix A.
 * Backend only (Phase 3A): no cards, no charts, no UI consume these yet.
 * Every function is a single server-side aggregate query (or two small,
 * independent ones where the KPI genuinely needs two numbers) — never a
 * fetch-all-then-reduce-in-JS, per docs/DASHBOARD.md §15.
 */
import prisma from "@/lib/db/prisma";
import type { PaymentStatus } from "@/generated/prisma/enums";
import { NOT_VOIDED, REVENUE_WHERE, decimalToNumber } from "./shared";
import type { DashboardDateRange } from "./dateRange";
import { resolveDashboardDateRange } from "./dateRange";

export interface RevenueSummary {
  total: number;
  count: number;
}

/** Today's Revenue — always "today," never scoped by the Global Date
 * Filter (docs/DASHBOARD.md §4/§6). */
export async function getTodaysRevenue(): Promise<RevenueSummary> {
  const today = resolveDashboardDateRange("today");
  return getRevenueForRange(today);
}

/** This Month Revenue (and the general "revenue in range" query behind
 * Sales This Month's ₹ counterpart) — follows the Global Date Filter. */
export async function getRevenueForRange(range: DashboardDateRange): Promise<RevenueSummary> {
  const result = await prisma.sale.aggregate({
    where: { ...REVENUE_WHERE, invoiceDate: { gte: range.from, lte: range.to } },
    _sum: { totalAmount: true },
    _count: { _all: true },
  });
  return { total: decimalToNumber(result._sum.totalAmount), count: result._count._all };
}

/** Outstanding Amount — a live snapshot of money currently owed, never
 * scoped by the Global Date Filter (docs/DASHBOARD.md §4/§6). */
export async function getOutstandingAmount(): Promise<{ total: number }> {
  const result = await prisma.sale.aggregate({
    where: { isVoided: false, paymentStatus: { in: ["PENDING", "PARTIAL"] } },
    _sum: { outstandingAmount: true },
  });
  return { total: decimalToNumber(result._sum.outstandingAmount) };
}

/** Pending Payments — count of unpaid/partially-paid sales, plus how many
 * of those are overdue (UI-computed elsewhere as "Due Date has passed" —
 * see docs/SALES_REGISTER.md §3). Live snapshot, not date-filter-scoped.
 *
 * "Overdue" is a calendar-day comparison, not a timestamp one — a sale
 * due *today* is not yet overdue, matching the exact convention already
 * established in PaymentStatusBadge.tsx (`dueDate < today`, both
 * date-only strings). Comparing a @db.Date column against a raw
 * `new Date()` (which carries the current time-of-day) would incorrectly
 * mark every same-day due date as overdue for the rest of that day. */
export async function getPendingPaymentsCount(): Promise<{ count: number; overdueCount: number }> {
  const now = new Date();
  const todayUtcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const baseWhere = { isVoided: false, paymentStatus: { in: ["PENDING", "PARTIAL"] as PaymentStatus[] } };
  const [count, overdueCount] = await Promise.all([
    prisma.sale.count({ where: baseWhere }),
    prisma.sale.count({ where: { ...baseWhere, dueDate: { lt: todayUtcMidnight } } }),
  ]);
  return { count, overdueCount };
}

/** Retailers — distinct retailers with at least one non-voided sale in
 * the selected range (an activity count, not the catalog size — see
 * docs/DASHBOARD.md §4). */
export async function getActiveRetailersCount(range: DashboardDateRange): Promise<number> {
  const rows = await prisma.sale.findMany({
    where: { ...NOT_VOIDED, invoiceDate: { gte: range.from, lte: range.to } },
    select: { retailerId: true },
    distinct: ["retailerId"],
  });
  return rows.length;
}

/** Products Sold — distinct products with at least one non-voided sale
 * in the selected range. */
export async function getProductsSoldCount(range: DashboardDateRange): Promise<number> {
  const rows = await prisma.sale.findMany({
    where: { ...NOT_VOIDED, invoiceDate: { gte: range.from, lte: range.to } },
    select: { productId: true },
    distinct: ["productId"],
  });
  return rows.length;
}

/** Sales Count — every non-voided sale in the range, INCLUDING cancelled
 * ones (a cancelled sale is still a real transaction that occurred — see
 * docs/DASHBOARD.md §4's distinction from the revenue KPIs). */
export async function getSalesCount(range: DashboardDateRange): Promise<number> {
  return prisma.sale.count({
    where: { ...NOT_VOIDED, invoiceDate: { gte: range.from, lte: range.to } },
  });
}

/** Cancelled Sales — count of non-voided sales with paymentStatus =
 * CANCELLED in the selected range (a data-quality/business-health signal,
 * not a revenue figure — docs/DASHBOARD.md §4). */
export async function getCancelledSalesCount(range: DashboardDateRange): Promise<number> {
  return prisma.sale.count({
    where: { ...NOT_VOIDED, paymentStatus: "CANCELLED", invoiceDate: { gte: range.from, lte: range.to } },
  });
}
