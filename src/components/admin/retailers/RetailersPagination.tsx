/** Server-side pagination footer — plain Links, no client JS. */
import Link from "next/link";

interface RetailersPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  search: string;
  sortBy: string;
  sortDir: string;
}

export default function RetailersPagination({
  page,
  pageSize,
  totalCount,
  search,
  sortBy,
  sortDir,
}: RetailersPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  function hrefForPage(targetPage: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("sort", sortBy);
    params.set("dir", sortDir);
    params.set("page", String(targetPage));
    return `/admin/retailers?${params.toString()}`;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-warm-200 bg-warm-50 px-4 py-3 sm:flex-row">
      <p className="text-xs text-brown-500">
        {totalCount === 0 ? "No retailers" : `Showing ${from}–${to} of ${totalCount} retailers`}
      </p>
      <nav aria-label="Retailers pagination" className="flex items-center gap-3 text-sm text-brown-600">
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
