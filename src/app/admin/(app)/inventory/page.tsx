import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth/session";
import { getInventoryList, getProductOptionsForInventory } from "@/lib/inventory/queries";
import type { InventorySortField, SortDirection } from "@/lib/inventory/queries";
import InventoryToolbar from "@/components/admin/inventory/InventoryToolbar";
import InventoryTable from "@/components/admin/inventory/InventoryTable";
import InventoryPagination from "@/components/admin/inventory/InventoryPagination";
import StockAdjustmentModalController from "@/components/admin/inventory/StockAdjustmentModalController";

export const metadata: Metadata = {
  title: "Inventory",
};

interface AdminInventoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const VALID_SORT_FIELDS: InventorySortField[] = ["name", "sku", "category", "currentStock", "lowStockThreshold"];

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Inventory & Stock Management module — reliable stock tracking for daily
// business operations, per this task's objective. Server Component:
// search/sort/pagination all live in the URL and are resolved entirely
// server-side (src/lib/inventory/queries.ts), never fetched client-side.
// Session is re-verified here as defense-in-depth, matching the existing
// pattern on /admin/dashboard, /admin/sales, /admin/retailers, and
// /admin/products.
export default async function AdminInventoryPage({ searchParams }: AdminInventoryPageProps) {
  await requireAdminSession();

  const params = await searchParams;
  const search = firstValue(params.search) ?? "";
  const rawSort = firstValue(params.sort);
  const sortBy: InventorySortField = VALID_SORT_FIELDS.includes(rawSort as InventorySortField)
    ? (rawSort as InventorySortField)
    : "name";
  const sortDir: SortDirection = firstValue(params.dir) === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(firstValue(params.page)) || 1);
  const pageSize = 25;

  const { rows, totalCount } = await getInventoryList({ search, sortBy, sortDir, page, pageSize });

  const adjustParam = firstValue(params.adjust);

  const productOptions = adjustParam ? await getProductOptionsForInventory() : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-warm-200 pb-6">
        <h1 className="font-heading text-2xl font-bold text-brown-900">Inventory</h1>
        <p className="mt-1 text-sm text-brown-600">
          Current stock for every product — Sales automatically deduct stock; use Adjust Stock for
          purchases, damage, samples, or corrections.
        </p>
      </header>

      <div className="mt-8 space-y-4">
        <InventoryToolbar initialSearch={search} />
        <InventoryTable
          rows={rows}
          search={search}
          sortBy={sortBy}
          sortDir={sortDir}
          hasAnyProductsAtAll={totalCount > 0 || Boolean(search)}
        />
        {rows.length > 0 && (
          <InventoryPagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            search={search}
            sortBy={sortBy}
            sortDir={sortDir}
          />
        )}
      </div>

      {adjustParam && <StockAdjustmentModalController products={productOptions} adjustParam={adjustParam} />}
    </div>
  );
}
