import type { PaymentStatus, ProductOption, RetailerOption } from "./types";
import { monthName } from "./dateFilterUtils";

interface SalesTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;

  dateFrom: string | null;
  dateTo: string | null;
  onCustomRangeChange: (from: string | null, to: string | null) => void;

  years: number[];
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
  selectedMonth: number | null;
  onMonthChange: (month: number | null) => void;

  statusFilter: PaymentStatus | "ALL";
  onStatusFilterChange: (status: PaymentStatus | "ALL") => void;

  retailers: RetailerOption[];
  retailerFilter: string | "ALL";
  onRetailerFilterChange: (retailerId: string | "ALL") => void;

  products: ProductOption[];
  productFilter: string | "ALL";
  onProductFilterChange: (productId: string | "ALL") => void;

  onClearFilters: () => void;
  onAddSale: () => void;
}

const selectClass =
  "rounded-xl border border-warm-300 bg-warm-50 px-3 py-2 text-sm text-brown-900 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30";

export default function SalesTableToolbar({
  searchValue,
  onSearchChange,
  dateFrom,
  dateTo,
  onCustomRangeChange,
  years,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  statusFilter,
  onStatusFilterChange,
  retailers,
  retailerFilter,
  onRetailerFilterChange,
  products,
  productFilter,
  onProductFilterChange,
  onClearFilters,
  onAddSale,
}: SalesTableToolbarProps) {
  return (
    <div className="premium-card space-y-4 p-5">
      {/* Search + Add Sale */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search sale #, invoice #, retailer, remarks…"
            className="w-full rounded-xl border border-warm-300 bg-warm-50 py-2.5 pl-9 pr-4 text-sm text-brown-900 placeholder:text-brown-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30"
          />
        </div>

        <button
          type="button"
          onClick={onAddSale}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Sale
        </button>
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="sales-date-from" className="mb-1 block text-xs font-medium text-brown-500">
            From
          </label>
          <input
            id="sales-date-from"
            type="date"
            value={dateFrom ?? ""}
            onChange={(e) => onCustomRangeChange(e.target.value || null, dateTo)}
            className={selectClass}
          />
        </div>
        <div>
          <label htmlFor="sales-date-to" className="mb-1 block text-xs font-medium text-brown-500">
            To
          </label>
          <input
            id="sales-date-to"
            type="date"
            value={dateTo ?? ""}
            onChange={(e) => onCustomRangeChange(dateFrom, e.target.value || null)}
            className={selectClass}
          />
        </div>

        <div>
          <label htmlFor="sales-year" className="mb-1 block text-xs font-medium text-brown-500">
            Year
          </label>
          <select
            id="sales-year"
            value={selectedYear ?? ""}
            onChange={(e) => onYearChange(e.target.value ? Number(e.target.value) : null)}
            className={selectClass}
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sales-month" className="mb-1 block text-xs font-medium text-brown-500">
            Month
          </label>
          <select
            id="sales-month"
            value={selectedMonth ?? ""}
            onChange={(e) => onMonthChange(e.target.value ? Number(e.target.value) : null)}
            disabled={!selectedYear}
            className={`${selectClass} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {monthName(month)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sales-status" className="mb-1 block text-xs font-medium text-brown-500">
            Payment Status
          </label>
          <select
            id="sales-status"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as PaymentStatus | "ALL")}
            className={selectClass}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <label htmlFor="sales-retailer" className="mb-1 block text-xs font-medium text-brown-500">
            Retailer
          </label>
          <select
            id="sales-retailer"
            value={retailerFilter}
            onChange={(e) => onRetailerFilterChange(e.target.value)}
            className={selectClass}
          >
            <option value="ALL">All Retailers</option>
            {retailers.map((retailer) => (
              <option key={retailer.id} value={retailer.id}>
                {retailer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sales-product" className="mb-1 block text-xs font-medium text-brown-500">
            Product
          </label>
          <select
            id="sales-product"
            value={productFilter}
            onChange={(e) => onProductFilterChange(e.target.value)}
            className={selectClass}
          >
            <option value="ALL">All Products</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-1.5 rounded-xl border border-brown-300 px-4 py-2 text-sm font-semibold text-brown-700 transition-all duration-200 hover:bg-brown-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear Filters
        </button>
      </div>
    </div>
  );
}
