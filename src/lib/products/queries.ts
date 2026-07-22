/**
 * Product reads — direct server-side data fetching, per the read path in
 * docs/API.md §3 (no Server Action, no client round-trip). Same layered
 * shape as src/lib/retailers/queries.ts: plain Prisma reads, serialized via
 * dto.ts, no validation/business logic duplicated here.
 */
import prisma from "@/lib/db/prisma";
import { serializeProduct } from "./dto";
import type { ProductRowDTO, ProductSummary, TopRetailer } from "./dto";

export type ProductSortField = "name" | "sku" | "category" | "status" | "sellingPrice" | "createdAt";
export type SortDirection = "asc" | "desc";

const SORT_FIELD_MAP: Record<ProductSortField, string> = {
  name: "name",
  sku: "sku",
  category: "category",
  status: "isActive",
  sellingPrice: "sellingPrice",
  createdAt: "createdAt",
};

/**
 * Batched aggregate lookup — one set of `groupBy` queries covering every
 * id requested, never one query per product (avoids N+1), matching the
 * same multi-aggregate-query shape already used by
 * src/lib/retailers/queries.ts's getRetailerSummaries.
 */
async function getProductSummaries(productIds: string[]): Promise<Map<string, ProductSummary>> {
  const summaries = new Map<string, ProductSummary>();
  if (productIds.length === 0) return summaries;

  const [activity, revenue] = await Promise.all([
    prisma.sale.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds }, isVoided: false },
      _count: { _all: true },
      _sum: { quantity: true },
      _max: { invoiceDate: true },
    }),
    prisma.sale.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds }, isVoided: false, paymentStatus: { not: "CANCELLED" } },
      _sum: { totalAmount: true },
    }),
  ]);

  for (const id of productIds) {
    summaries.set(id, { totalRevenue: 0, unitsSold: 0, saleCount: 0, lastSoldDate: null });
  }
  for (const row of activity) {
    const existing = summaries.get(row.productId)!;
    existing.saleCount = row._count._all;
    existing.unitsSold = row._sum.quantity ? row._sum.quantity.toNumber() : 0;
    existing.lastSoldDate = row._max.invoiceDate ? row._max.invoiceDate.toISOString().slice(0, 10) : null;
  }
  for (const row of revenue) {
    summaries.get(row.productId)!.totalRevenue = row._sum.totalAmount ? row._sum.totalAmount.toNumber() : 0;
  }

  return summaries;
}

export interface GetProductsListParams {
  search?: string;
  sortBy?: ProductSortField;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
}

export interface GetProductsListResult {
  rows: ProductRowDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * Server-side paginated, searchable product list — this task's explicit
 * "server-side pagination" requirement. Sorting is restricted to intrinsic
 * Product columns; the aggregate-derived columns (Total Units Sold, Total
 * Revenue, Last Sold) are displayed but not sortable server-side in this
 * phase — same documented, reasoned limitation already accepted for
 * Retailers (see src/lib/retailers/queries.ts).
 */
export async function getProductsList(params: GetProductsListParams = {}): Promise<GetProductsListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 25));
  const sortBy = params.sortBy ?? "name";
  const sortDir = params.sortDir ?? "asc";
  const search = params.search?.trim();

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { sku: { contains: search, mode: "insensitive" as const } },
          { category: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { [SORT_FIELD_MAP[sortBy]]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  const summaries = await getProductSummaries(products.map((p) => p.id));

  const rows: ProductRowDTO[] = products.map((product) => ({
    ...serializeProduct(product),
    ...(summaries.get(product.id) ?? { totalRevenue: 0, unitsSold: 0, saleCount: 0, lastSoldDate: null }),
  }));

  return { rows, totalCount, page, pageSize };
}

export async function getProductById(id: string): Promise<ProductRowDTO | null> {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return null;

  const summaries = await getProductSummaries([id]);
  const summary = summaries.get(id) ?? { totalRevenue: 0, unitsSold: 0, saleCount: 0, lastSoldDate: null };

  return { ...serializeProduct(product), ...summary };
}

/** Business-rule check for Create/Update Product — duplicate prevention by
 * Product Name (case-insensitive) or SKU, this task's explicit "Unique SKU
 * / Unique Product Name / Prevent duplicate products" requirement.
 * Excludes `excludeId` so updating a product doesn't collide with itself. */
export async function findDuplicateProduct(name: string, sku: string, excludeId?: string) {
  return prisma.product.findFirst({
    where: {
      OR: [{ name: { equals: name, mode: "insensitive" } }, { sku: { equals: sku, mode: "insensitive" } }],
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

/** Product Detail's "Top Retailers" summary (this task's "Product Detail
 * Page" §6) — one batched aggregate over this product's non-voided sales,
 * grouped by retailer, ranked by revenue. */
export async function getTopRetailersForProduct(productId: string, limit = 5): Promise<TopRetailer[]> {
  const grouped = await prisma.sale.groupBy({
    by: ["retailerId"],
    where: { productId, isVoided: false, paymentStatus: { not: "CANCELLED" } },
    _sum: { totalAmount: true },
    orderBy: { _sum: { totalAmount: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const retailers = await prisma.retailer.findMany({
    where: { id: { in: grouped.map((row) => row.retailerId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(retailers.map((r) => [r.id, r.name]));

  return grouped.map((row) => ({
    retailerId: row.retailerId,
    retailerName: nameById.get(row.retailerId) ?? "Unknown Retailer",
    totalRevenue: row._sum.totalAmount ? row._sum.totalAmount.toNumber() : 0,
  }));
}
