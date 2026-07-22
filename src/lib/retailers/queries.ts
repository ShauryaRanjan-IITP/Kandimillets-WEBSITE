/**
 * Retailer reads — direct server-side data fetching, per the read path in
 * docs/API.md §3 (no Server Action, no client round-trip). Same layered
 * shape as src/lib/sales/queries.ts: plain Prisma reads, serialized via
 * dto.ts, no validation/business logic duplicated here.
 */
import prisma from "@/lib/db/prisma";
import { serializeRetailer } from "./dto";
import type { RetailerRowDTO, RetailerSummary } from "./dto";

export type RetailerSortField = "name" | "city" | "status" | "createdAt";
export type SortDirection = "asc" | "desc";

const SORT_FIELD_MAP: Record<RetailerSortField, string> = {
  name: "name",
  city: "city",
  status: "isActive",
  createdAt: "createdAt",
};

/**
 * Batched aggregate lookup — one set of `groupBy` queries covering every
 * id requested, never one query per retailer (avoids N+1). Three
 * queries because "Total Purchases" (revenue, excluding cancelled),
 * "Outstanding Amount" (Pending/Partial only), and "Last Purchase" +
 * order count (every non-voided sale, any status) are three genuinely
 * different filters — matching the same multi-aggregate-query shape
 * already used by src/lib/dashboard/kpiQueries.ts.
 */
async function getRetailerSummaries(retailerIds: string[]): Promise<Map<string, RetailerSummary>> {
  const summaries = new Map<string, RetailerSummary>();
  if (retailerIds.length === 0) return summaries;

  const [activity, revenue, outstanding] = await Promise.all([
    prisma.sale.groupBy({
      by: ["retailerId"],
      where: { retailerId: { in: retailerIds }, isVoided: false },
      _count: { _all: true },
      _max: { invoiceDate: true },
    }),
    prisma.sale.groupBy({
      by: ["retailerId"],
      where: { retailerId: { in: retailerIds }, isVoided: false, paymentStatus: { not: "CANCELLED" } },
      _sum: { totalAmount: true },
    }),
    prisma.sale.groupBy({
      by: ["retailerId"],
      where: { retailerId: { in: retailerIds }, isVoided: false, paymentStatus: { in: ["PENDING", "PARTIAL"] } },
      _sum: { outstandingAmount: true },
    }),
  ]);

  for (const id of retailerIds) {
    summaries.set(id, { totalSales: 0, outstandingAmount: 0, orderCount: 0, lastPurchaseDate: null });
  }
  for (const row of activity) {
    const existing = summaries.get(row.retailerId)!;
    existing.orderCount = row._count._all;
    existing.lastPurchaseDate = row._max.invoiceDate ? row._max.invoiceDate.toISOString().slice(0, 10) : null;
  }
  for (const row of revenue) {
    summaries.get(row.retailerId)!.totalSales = row._sum.totalAmount ? row._sum.totalAmount.toNumber() : 0;
  }
  for (const row of outstanding) {
    summaries.get(row.retailerId)!.outstandingAmount = row._sum.outstandingAmount
      ? row._sum.outstandingAmount.toNumber()
      : 0;
  }

  return summaries;
}

export interface GetRetailersListParams {
  search?: string;
  sortBy?: RetailerSortField;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
}

export interface GetRetailersListResult {
  rows: RetailerRowDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * Server-side paginated, searchable retailer list — this task's explicit
 * "pagination server-side" requirement. Sorting is restricted to
 * intrinsic Retailer columns (name/city/status/createdAt); the
 * aggregate-derived columns (Outstanding Amount, Last Purchase, Total
 * Purchases) are displayed but not sortable server-side in this phase —
 * doing so would need a raw-SQL join+aggregate+ORDER BY, which isn't
 * justified at the retailer counts this module is built for (see
 * docs/SALES_REGISTER.md §4's own "500 retailers" growth target).
 */
export async function getRetailersList(params: GetRetailersListParams = {}): Promise<GetRetailersListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 25));
  const sortBy = params.sortBy ?? "name";
  const sortDir = params.sortDir ?? "asc";
  const search = params.search?.trim();

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
          { gstin: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [retailers, totalCount] = await Promise.all([
    prisma.retailer.findMany({
      where,
      orderBy: { [SORT_FIELD_MAP[sortBy]]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.retailer.count({ where }),
  ]);

  const summaries = await getRetailerSummaries(retailers.map((r) => r.id));

  const rows: RetailerRowDTO[] = retailers.map((retailer) => ({
    ...serializeRetailer(retailer),
    ...(summaries.get(retailer.id) ?? {
      totalSales: 0,
      outstandingAmount: 0,
      orderCount: 0,
      lastPurchaseDate: null,
    }),
  }));

  return { rows, totalCount, page, pageSize };
}

export async function getRetailerById(id: string): Promise<RetailerRowDTO | null> {
  const retailer = await prisma.retailer.findUnique({ where: { id } });
  if (!retailer) return null;

  const summaries = await getRetailerSummaries([id]);
  const summary = summaries.get(id) ?? { totalSales: 0, outstandingAmount: 0, orderCount: 0, lastPurchaseDate: null };

  return { ...serializeRetailer(retailer), ...summary };
}

/** Business-rule check for Create/Update Retailer — duplicate prevention
 * by Business Name + Phone (this task's explicit requirement). Excludes
 * `excludeId` so updating a retailer doesn't collide with itself. */
export async function findDuplicateRetailer(name: string, phone: string, excludeId?: string) {
  return prisma.retailer.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      phone,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}
