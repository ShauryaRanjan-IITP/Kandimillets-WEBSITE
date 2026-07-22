/** Server-side pagination footer — plain Links, no client JS. Mirrors
 * InventoryPagination.tsx, extended to preserve every active report
 * filter (not just search/sort) across page links. */
import Link from "next/link";

interface SalesReportPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  baseParams: Record<string, string | undefined>;
}

export default function SalesReportPagination({ page, pageSize, totalCount, baseParams }: SalesReportPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  function hrefForPage(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(baseParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(targetPage));
    return `/admin/reports?${params.toString()}`;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-warm-200 bg-warm-50 px-4 py-3 sm:flex-row">
      <p className="text-xs text-brown-500">
        {totalCount === 0 ? "No sales" : `Showing ${from}–${to} of ${totalCount} sales`}
      </p>
      <nav aria-label="Sales Report pagination" className="flex items-center gap-3 text-sm text-brown-600">
        {page > 1 ? (
          <Link
            href={hrefForPage(page - 1)}
            className="rounded-lg border border-warm-300 px-3 py-1.5 text-xs font-semibold text-brown-700 hover:bg-warm-100"
          >
            Prev
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-warm-200 px-3 py-1.5 text-xs font-semibold text-brown-300">
            Prev
          </span>
        )}
        <span className="text-xs">
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={hrefForPage(page + 1)}
            className="rounded-lg border border-warm-300 px-3 py-1.5 text-xs font-semibold text-brown-700 hover:bg-warm-100"
          >
            Next
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-warm-200 px-3 py-1.5 text-xs font-semibold text-brown-300">
            Next
          </span>
        )}
      </nav>
    </div>
  );
}
