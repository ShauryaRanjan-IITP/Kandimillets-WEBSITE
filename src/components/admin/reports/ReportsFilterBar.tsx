"use client";

/**
 * Reports filter bar — Date Range (presets + Custom), Retailer, Product,
 * Payment Status, and Search (this task's §2 explicit filter set).
 * URL-as-source-of-truth, same convention used everywhere else in this
 * project (RetailersToolbar, DashboardDateFilterControl): every change
 * navigates immediately (search is debounced), never local-only state
 * that could drift from what the table/summary/export actually reflect.
 * Changing any filter drops `page`/`sort`/`dir` back to their defaults —
 * the same behavior RetailersToolbar/ProductsToolbar already have when
 * their search box changes.
 */
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PAYMENT_STATUS_OPTIONS } from "@/components/admin/sales/types";
import { REPORT_DATE_RANGE_OPTIONS } from "./types";
import type { ReportFiltersState, ReportOption } from "./types";

interface ReportsFilterBarProps {
  initialFilters: ReportFiltersState;
  retailerOptions: ReportOption[];
  productOptions: ReportOption[];
}

const selectClass =
  "rounded-xl border border-warm-300 bg-warm-50 px-3.5 py-2.5 text-sm font-medium text-brown-900 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30";

export default function ReportsFilterBar({ initialFilters, retailerOptions, productOptions }: ReportsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<ReportFiltersState>(initialFilters);
  const [search, setSearch] = useState(initialFilters.search);

  function navigate(next: ReportFiltersState) {
    const params = new URLSearchParams();
    params.set("range", next.rangeKey);
    if (next.rangeKey === "custom") {
      if (next.customFrom) params.set("from", next.customFrom);
      if (next.customTo) params.set("to", next.customTo);
    }
    if (next.retailerId) params.set("retailerId", next.retailerId);
    if (next.productId) params.set("productId", next.productId);
    if (next.paymentStatus) params.set("status", next.paymentStatus);
    if (next.search) params.set("search", next.search);
    router.push(`${pathname}?${params.toString()}`);
  }

  function update<K extends keyof ReportFiltersState>(key: K, value: ReportFiltersState[K]) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    if (key === "rangeKey" && value === "custom" && (!next.customFrom || !next.customTo)) {
      // Custom Range needs both dates before there's anything valid to
      // query — avoid navigating with a half-picked range.
      return;
    }
    navigate(next);
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      if (search === initialFilters.search) return;
      navigate({ ...filters, search });
    }, 350);
    return () => clearTimeout(handle);
    // Only re-run when the typed search text changes — same pattern as
    // RetailersToolbar/ProductsToolbar/InventoryToolbar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="premium-card flex flex-wrap items-end gap-3 p-4">
      <div>
        <label htmlFor="report-range" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brown-500">
          Date Range
        </label>
        <select
          id="report-range"
          value={filters.rangeKey}
          onChange={(e) => update("rangeKey", e.target.value as ReportFiltersState["rangeKey"])}
          className={selectClass}
        >
          {REPORT_DATE_RANGE_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {filters.rangeKey === "custom" && (
        <>
          <div>
            <label htmlFor="report-from" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brown-500">
              From
            </label>
            <input
              id="report-from"
              type="date"
              value={filters.customFrom}
              onChange={(e) => update("customFrom", e.target.value)}
              className={selectClass}
            />
          </div>
          <div>
            <label htmlFor="report-to" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brown-500">
              To
            </label>
            <input
              id="report-to"
              type="date"
              value={filters.customTo}
              onChange={(e) => update("customTo", e.target.value)}
              className={selectClass}
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="report-retailer" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brown-500">
          Retailer
        </label>
        <select
          id="report-retailer"
          value={filters.retailerId}
          onChange={(e) => update("retailerId", e.target.value)}
          className={selectClass}
        >
          <option value="">All Retailers</option>
          {retailerOptions.map((retailer) => (
            <option key={retailer.id} value={retailer.id}>
              {retailer.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="report-product" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brown-500">
          Product
        </label>
        <select
          id="report-product"
          value={filters.productId}
          onChange={(e) => update("productId", e.target.value)}
          className={selectClass}
        >
          <option value="">All Products</option>
          {productOptions.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="report-status" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brown-500">
          Payment Status
        </label>
        <select
          id="report-status"
          value={filters.paymentStatus}
          onChange={(e) => update("paymentStatus", e.target.value as ReportFiltersState["paymentStatus"])}
          className={selectClass}
        >
          <option value="">All Statuses</option>
          {PAYMENT_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[220px] flex-1">
        <label htmlFor="report-search" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brown-500">
          Search
        </label>
        <input
          id="report-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sale #, invoice, retailer, product…"
          className={`${selectClass} w-full`}
        />
      </div>
    </div>
  );
}
