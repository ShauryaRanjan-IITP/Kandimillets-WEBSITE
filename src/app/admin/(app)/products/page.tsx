import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth/session";
import { getProductById, getProductsList } from "@/lib/products/queries";
import type { ProductSortField, SortDirection } from "@/lib/products/queries";
import ProductsToolbar from "@/components/admin/products/ProductsToolbar";
import ProductsTable from "@/components/admin/products/ProductsTable";
import ProductsPagination from "@/components/admin/products/ProductsPagination";
import ProductFormModalController from "@/components/admin/products/ProductFormModalController";
import ProductStatusDialogController from "@/components/admin/products/ProductStatusDialogController";

export const metadata: Metadata = {
  title: "Products",
};

interface AdminProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const VALID_SORT_FIELDS: ProductSortField[] = ["name", "sku", "category", "status", "sellingPrice", "createdAt"];

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Product Management module — the central source of truth for every item
// Kandimillets sells, per this task's objective. Server Component:
// search/sort/pagination all live in the URL and are resolved entirely
// server-side (src/lib/products/queries.ts), never fetched client-side.
// Session is re-verified here as defense-in-depth, matching the existing
// pattern on /admin/dashboard, /admin/sales, and /admin/retailers.
export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  await requireAdminSession();

  const params = await searchParams;
  const search = firstValue(params.search) ?? "";
  const rawSort = firstValue(params.sort);
  const sortBy: ProductSortField = VALID_SORT_FIELDS.includes(rawSort as ProductSortField)
    ? (rawSort as ProductSortField)
    : "name";
  const sortDir: SortDirection = firstValue(params.dir) === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(firstValue(params.page)) || 1);
  const pageSize = 25;

  const { rows, totalCount } = await getProductsList({ search, sortBy, sortDir, page, pageSize });

  const editId = firstValue(params.edit);
  const statusId = firstValue(params.status);
  const isCreateOpen = firstValue(params.create) === "1";

  const [editingProduct, statusProduct] = await Promise.all([
    editId ? getProductById(editId) : null,
    statusId ? getProductById(statusId) : null,
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-warm-200 pb-6">
        <h1 className="font-heading text-2xl font-bold text-brown-900">Products</h1>
        <p className="mt-1 text-sm text-brown-600">
          Every item Kandimillets sells — search, manage, and drill into each product&apos;s sales
          history below.
        </p>
      </header>

      <div className="mt-8 space-y-4">
        <ProductsToolbar initialSearch={search} />
        <ProductsTable
          rows={rows}
          search={search}
          sortBy={sortBy}
          sortDir={sortDir}
          hasAnyProductsAtAll={totalCount > 0 || Boolean(search)}
        />
        {rows.length > 0 && (
          <ProductsPagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            search={search}
            sortBy={sortBy}
            sortDir={sortDir}
          />
        )}
      </div>

      {(isCreateOpen || (editId && editingProduct)) && (
        <ProductFormModalController editingProduct={editId ? editingProduct : null} />
      )}

      {statusId && statusProduct && <ProductStatusDialogController product={statusProduct} />}
    </div>
  );
}
