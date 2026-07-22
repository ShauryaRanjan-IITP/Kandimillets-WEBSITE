import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth/session";
import { getRetailerById, getRetailersList } from "@/lib/retailers/queries";
import type { RetailerSortField, SortDirection } from "@/lib/retailers/queries";
import RetailersToolbar from "@/components/admin/retailers/RetailersToolbar";
import RetailersTable from "@/components/admin/retailers/RetailersTable";
import RetailersPagination from "@/components/admin/retailers/RetailersPagination";
import RetailerFormModalController from "@/components/admin/retailers/RetailerFormModalController";
import RetailerStatusDialogController from "@/components/admin/retailers/RetailerStatusDialogController";

export const metadata: Metadata = {
  title: "Retailers",
};

interface AdminRetailersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const VALID_SORT_FIELDS: RetailerSortField[] = ["name", "city", "status", "createdAt"];

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Retailer Management module — the central place for managing every
// business that purchases products, per this task's objective. Server
// Component: search/sort/pagination all live in the URL and are resolved
// entirely server-side (src/lib/retailers/queries.ts), never fetched
// client-side. Session is re-verified here as defense-in-depth, matching
// the existing pattern on /admin/dashboard and /admin/sales.
export default async function AdminRetailersPage({ searchParams }: AdminRetailersPageProps) {
  await requireAdminSession();

  const params = await searchParams;
  const search = firstValue(params.search) ?? "";
  const rawSort = firstValue(params.sort);
  const sortBy: RetailerSortField = VALID_SORT_FIELDS.includes(rawSort as RetailerSortField)
    ? (rawSort as RetailerSortField)
    : "name";
  const sortDir: SortDirection = firstValue(params.dir) === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(firstValue(params.page)) || 1);
  const pageSize = 25;

  const { rows, totalCount } = await getRetailersList({ search, sortBy, sortDir, page, pageSize });

  const editId = firstValue(params.edit);
  const statusId = firstValue(params.status);
  const isCreateOpen = firstValue(params.create) === "1";

  const [editingRetailer, statusRetailer] = await Promise.all([
    editId ? getRetailerById(editId) : null,
    statusId ? getRetailerById(statusId) : null,
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-warm-200 pb-6">
        <h1 className="font-heading text-2xl font-bold text-brown-900">Retailers</h1>
        <p className="mt-1 text-sm text-brown-600">
          Every business that purchases from Kandimillets — search, manage, and drill into each
          retailer&apos;s sales history below.
        </p>
      </header>

      <div className="mt-8 space-y-4">
        <RetailersToolbar initialSearch={search} />
        <RetailersTable
          rows={rows}
          search={search}
          sortBy={sortBy}
          sortDir={sortDir}
          hasAnyRetailersAtAll={totalCount > 0 || Boolean(search)}
        />
        {rows.length > 0 && (
          <RetailersPagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            search={search}
            sortBy={sortBy}
            sortDir={sortDir}
          />
        )}
      </div>

      {(isCreateOpen || (editId && editingRetailer)) && (
        <RetailerFormModalController editingRetailer={editId ? editingRetailer : null} />
      )}

      {statusId && statusRetailer && <RetailerStatusDialogController retailer={statusRetailer} />}
    </div>
  );
}
