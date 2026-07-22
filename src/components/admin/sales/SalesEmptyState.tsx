interface SalesEmptyStateProps {
  /** True when zero rows exist at all (vs. zero rows matching a filter). */
  hasNoSalesWhatsoever: boolean;
  onAddSale: () => void;
  onClearFilters?: () => void;
}

export default function SalesEmptyState({
  hasNoSalesWhatsoever,
  onAddSale,
  onClearFilters,
}: SalesEmptyStateProps) {
  return (
    <div className="premium-card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 14.25h6m-6-3h6m-6-3h6M5.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25V6.75A2.25 2.25 0 015.25 4.5z"
          />
        </svg>
      </div>

      {hasNoSalesWhatsoever ? (
        <>
          <h3 className="mt-6 font-heading text-xl font-bold text-brown-900">
            No sales have been recorded yet
          </h3>
          <p className="mt-2 max-w-md text-sm text-brown-500">
            Once you add your first sale, it will show up here — organized by month, searchable,
            and ready to filter as your records grow.
          </p>
          <button
            type="button"
            onClick={onAddSale}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Your First Sale
          </button>
        </>
      ) : (
        <>
          <h3 className="mt-6 font-heading text-xl font-bold text-brown-900">
            No sales match these filters
          </h3>
          <p className="mt-2 max-w-md text-sm text-brown-500">
            Try widening the date range or clearing a filter — the sale you&apos;re looking for
            might just be outside the current view.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-brown-300 px-5 py-2.5 text-sm font-semibold text-brown-700 transition-all duration-200 hover:bg-brown-50"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={onAddSale}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg"
            >
              Add Sale
            </button>
          </div>
        </>
      )}
    </div>
  );
}
