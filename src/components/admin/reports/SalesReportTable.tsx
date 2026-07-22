/**
 * Sales Report table — a plain, server-renderable component (no
 * "use client"): sortable headers are plain `<Link>`s that navigate with
 * an updated query string (server-side sort per this task's explicit
 * requirement), never client state. Mirrors InventoryTable.tsx /
 * ProductsTable.tsx exactly, including hoisting the header components to
 * module scope (react-hooks/static-components was hit and fixed once
 * already for those tables).
 */
import Link from "next/link";
import EmptyState from "@/components/admin/dashboard/EmptyState";
import { ClipboardEmptyIcon } from "@/components/admin/dashboard/icons";
import PaymentStatusBadge from "@/components/admin/sales/PaymentStatusBadge";
import type { ReportSortField, SalesReportRow, SortDirection } from "./types";

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

interface SalesReportTableProps {
  rows: SalesReportRow[];
  baseParams: Record<string, string | undefined>;
  sortBy: ReportSortField;
  sortDir: SortDirection;
  hasAnySalesAtAll: boolean;
}

function buildHref(overrides: Record<string, string | undefined>, base: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  const merged = { ...base, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/admin/reports?${query}` : "/admin/reports";
}

function SortIcon({ direction }: { direction: SortDirection | null }) {
  if (!direction) {
    return (
      <svg className="h-3.5 w-3.5 text-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
    );
  }
  return direction === "asc" ? (
    <svg className="h-3.5 w-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  ) : (
    <svg className="h-3.5 w-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function SortableHeader({ href, label, direction }: { href: string; label: string; direction: SortDirection | null }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left">
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brown-500 hover:text-brown-700"
      >
        {label}
        <SortIcon direction={direction} />
      </Link>
    </th>
  );
}

function PlainHeader({ label }: { label: string }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brown-500">
      {label}
    </th>
  );
}

export default function SalesReportTable({ rows, baseParams, sortBy, sortDir, hasAnySalesAtAll }: SalesReportTableProps) {
  function sortHeaderHref(field: ReportSortField) {
    const nextDir: SortDirection = sortBy === field && sortDir === "asc" ? "desc" : "asc";
    return buildHref({ sort: field, dir: nextDir, page: undefined }, baseParams);
  }

  if (rows.length === 0) {
    return (
      <div className="premium-card">
        <EmptyState
          icon={<ClipboardEmptyIcon />}
          title={hasAnySalesAtAll ? "No sales match these filters" : "No sales recorded yet"}
          message={
            hasAnySalesAtAll
              ? "Try a different date range, retailer, product, or payment status."
              : "Once sales are recorded in the Sales Register, they'll appear here."
          }
        />
      </div>
    );
  }

  return (
    <div className="premium-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-warm-200 bg-warm-50">
            <tr>
              <PlainHeader label="Invoice" />
              <SortableHeader
                href={sortHeaderHref("invoiceDate")}
                label="Date"
                direction={sortBy === "invoiceDate" ? sortDir : null}
              />
              <SortableHeader
                href={sortHeaderHref("retailerName")}
                label="Retailer"
                direction={sortBy === "retailerName" ? sortDir : null}
              />
              <SortableHeader
                href={sortHeaderHref("productName")}
                label="Product"
                direction={sortBy === "productName" ? sortDir : null}
              />
              <PlainHeader label="Quantity" />
              <SortableHeader
                href={sortHeaderHref("totalAmount")}
                label="Amount"
                direction={sortBy === "totalAmount" ? sortDir : null}
              />
              <SortableHeader
                href={sortHeaderHref("paymentStatus")}
                label="Payment Status"
                direction={sortBy === "paymentStatus" ? sortDir : null}
              />
              <PlainHeader label="Outstanding" />
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-100">
            {rows.map((sale) => (
              <tr key={sale.id} className="transition-colors duration-150 hover:bg-warm-50/60">
                <td className="whitespace-nowrap p-0">
                  <Link
                    href={`/admin/sales?sale=${sale.id}`}
                    className="block px-4 py-3 font-medium text-brown-900 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
                  >
                    {sale.invoiceNumber || sale.saleNumber}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">{sale.invoiceDate}</td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">{sale.retailerName}</td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">{sale.productName}</td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">
                  {sale.quantity} {sale.unit}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-brown-900">
                  ₹{rupee.format(sale.totalAmount)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <PaymentStatusBadge status={sale.paymentStatus} dueDate={sale.dueDate} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">₹{rupee.format(sale.outstandingAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
