/** Server-side pagination footer — plain Links, no client JS. Mirrors
 * RetailersPagination.tsx exactly. */
import Link from "next/link";

interface ProductsPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  search: string;
  sortBy: string;
  sortDir: string;
}

export default function ProductsPagination({
  page,
  pageSize,
  totalCount,
  search,
  sortBy,
  sortDir,
}: ProductsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  function hrefForPage(targetPage: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("sort", sortBy);
    params.set("dir", sortDir);
    params.set("page", String(targetPage));
    return `/admin/products?${params.toString()}`;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-warm-200 bg-warm-50 px-4 py-3 sm:flex-row">
      <p className="text-xs text-brown-500">
        {totalCount === 0 ? "No products" : `Showing ${from}–${to} of ${totalCount} products`}
      </p>
      <nav aria-label="Products pagination" className="flex items-center gap-3 text-sm text-brown-600">
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
