/**
 * Inventory reads — direct server-side data fetching, per the read path in
 * docs/API.md §3 (no Server Action, no client round-trip). Same layered
 * shape as src/lib/products/queries.ts: plain Prisma reads, serialized via
 * dto.ts, no validation/business logic duplicated here.
 *
 * Deliberately includes inactive products in the stock list/detail —
 * inventory tracks physical, on-hand stock independent of whether a
 * product is currently selectable for a new sale (that's Product
 * Management's `isActive` concern, a different question from "how much of
 * this do we physically have").
 */
import prisma from "@/lib/db/prisma";
import { serializeProductStock, serializeStockMovement } from "./dto";
import type { ProductStockDetail, ProductStockRowDTO, StockMovementDTO } from "./dto";

export type InventorySortField = "name" | "sku" | "category" | "currentStock" | "lowStockThreshold";
export type SortDirection = "asc" | "desc";

const SORT_FIELD_MAP: Record<InventorySortField, string> = {
  name: "name",
  sku: "sku",
  category: "category",
  currentStock: "currentStock",
  lowStockThreshold: "lowStockThreshold",
};

/** Batched "last movement" lookup — one `groupBy` covering every id
 * requested, never one query per product (avoids N+1), matching the same
 * multi-aggregate-query shape already used throughout
 * src/lib/retailers/queries.ts and src/lib/products/queries.ts. */
async function getLastMovementDates(productIds: string[]): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  if (productIds.length === 0) return result;

  const grouped = await prisma.stockMovement.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _max: { createdAt: true },
  });

  for (const id of productIds) {
    result.set(id, null);
  }
  for (const row of grouped) {
    result.set(row.productId, row._max.createdAt ? row._max.createdAt.toISOString() : null);
  }
  return result;
}

export interface GetInventoryListParams {
  search?: string;
  sortBy?: InventorySortField;
  sortDir?: SortDirection;
  page?: number;
  pageSize?: number;
}

export interface GetInventoryListResult {
  rows: ProductStockRowDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * Server-side paginated, searchable Product Stock List — this task's
 * explicit "server-side pagination" requirement. Sorting is restricted to
 * intrinsic Product columns; "Status" and "Last Stock Movement" are
 * UI-computed/aggregate-derived and not sortable server-side in this
 * phase — same documented, reasoned limitation already accepted for
 * Retailers/Products.
 */
export async function getInventoryList(params: GetInventoryListParams = {}): Promise<GetInventoryListResult> {
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

  const lastMovementByProduct = await getLastMovementDates(products.map((p) => p.id));

  const rows: ProductStockRowDTO[] = products.map((product) => ({
    ...serializeProductStock(product),
    lastMovementAt: lastMovementByProduct.get(product.id) ?? null,
  }));

  return { rows, totalCount, page, pageSize };
}

/** Product Stock Detail's summary cards (this task's "Inventory Detail"
 * §3) — one grouped aggregate over this product's full movement history,
 * split by direction, plus the most recent movement timestamp. */
export async function getProductStockDetail(productId: string): Promise<ProductStockDetail | null> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return null;

  const [totals, latest] = await Promise.all([
    prisma.stockMovement.groupBy({
      by: ["direction"],
      where: { productId },
      _sum: { quantity: true },
    }),
    prisma.stockMovement.findFirst({
      where: { productId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  const totalStockAdded = totals.find((t) => t.direction === "IN")?._sum.quantity?.toNumber() ?? 0;
  const totalStockRemoved = totals.find((t) => t.direction === "OUT")?._sum.quantity?.toNumber() ?? 0;

  return {
    ...serializeProductStock(product),
    totalStockAdded,
    totalStockRemoved,
    lastMovementAt: latest ? latest.createdAt.toISOString() : null,
  };
}

/** Inventory Detail's "Recent Stock Movements" / "Stock History" (this
 * task's §3/§7) — the full immutable ledger for one product, most recent
 * first. Never filtered/mutated; this is the read side of the "Never edit
 * history" ledger. */
export async function getStockMovementsForProduct(productId: string, limit = 50): Promise<StockMovementDTO[]> {
  const movements = await prisma.stockMovement.findMany({
    where: { productId },
    include: { createdByUser: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return movements.map(serializeStockMovement);
}

/** Dashboard's Low Stock exposure (this task's §6) — active products at or
 * below their own threshold. Products with no threshold set are never
 * evaluated (see computeStockStatus in dto.ts). Prisma's standard client
 * cannot compare two columns of the same row in a `where` filter, so the
 * threshold comparison happens in application code after a single narrow
 * fetch (active products with a threshold set) — an acceptable, documented
 * choice at this project's stated growth scale (a few hundred products;
 * see docs/SALES_REGISTER.md §4), not a raw-SQL query. */
/** Product options for the Stock Adjustment modal — every product,
 * active or inactive, since correcting/writing off stock for a since-
 * deactivated product is still a legitimate manual adjustment. */
export async function getProductOptionsForInventory() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, defaultUnit: true, currentStock: true, isActive: true },
    orderBy: { name: "asc" },
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    unit: p.defaultUnit,
    currentStock: p.currentStock.toNumber(),
    isActive: p.isActive,
  }));
}

export async function getLowStockProducts(limit = 10) {
  const candidates = await prisma.product.findMany({
    where: { isActive: true, lowStockThreshold: { not: null } },
  });

  return candidates
    .map(serializeProductStock)
    .filter((p) => p.stockStatus === "LOW_STOCK" || p.stockStatus === "OUT_OF_STOCK")
    .sort((a, b) => a.currentStock - b.currentStock)
    .slice(0, limit);
}
