/**
 * Product Stock List table — a plain, server-renderable component (no
 * "use client"): sortable headers and row actions are all plain `<Link>`s
 * that navigate with an updated query string (server-side sort/search per
 * this task's explicit requirement), never client state. Mirrors
 * ProductsTable.tsx/RetailersTable.tsx exactly, including hoisting the
 * header components to module scope (react-hooks/static-components was
 * hit and fixed once already for those tables).
 */
import Link from "next/link";
import EmptyState from "@/components/admin/dashboard/EmptyState";
import { ClipboardEmptyIcon } from "@/components/admin/dashboard/icons";
import StockStatusBadge from "./StockStatusBadge";
import type { InventorySortField, ProductStockRow, SortDirection } from "./types";

const numberFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

interface InventoryTableProps {
  rows: ProductStockRow[];
  search: string;
  sortBy: InventorySortField;
  sortDir: SortDirection;
  hasAnyProductsAtAll: boolean;
}

function buildHref(overrides: Record<string, string | undefined>, base: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  const merged = { ...base, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/admin/inventory?${query}` : "/admin/inventory";
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

export default function InventoryTable({ rows, search, sortBy, sortDir, hasAnyProductsAtAll }: InventoryTableProps) {
  const base = { search: search || undefined, sort: sortBy, dir: sortDir };

  function sortHeaderHref(field: InventorySortField) {
    const nextDir: SortDirection = sortBy === field && sortDir === "asc" ? "desc" : "asc";
    return buildHref({ sort: field, dir: nextDir, page: undefined }, base);
  }

  if (rows.length === 0) {
    return (
      <div className="premium-card">
        <EmptyState
          icon={<ClipboardEmptyIcon />}
          title={hasAnyProductsAtAll ? "No products match your search" : "No products yet"}
          message={
            hasAnyProductsAtAll
              ? "Try a different name, SKU, or category."
              : "Add a product in Product Management to start tracking its stock."
          }
          action={hasAnyProductsAtAll ? undefined : { label: "Go to Products", href: "/admin/products" }}
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
              <SortableHeader
                href={sortHeaderHref("name")}
                label="Product"
                direction={sortBy === "name" ? sortDir : null}
              />
              <SortableHeader href={sortHeaderHref("sku")} label="SKU" direction={sortBy === "sku" ? sortDir : null} />
              <SortableHeader
                href={sortHeaderHref("currentStock")}
                label="Current Stock"
                direction={sortBy === "currentStock" ? sortDir : null}
              />
              <PlainHeader label="Unit" />
              <SortableHeader
                href={sortHeaderHref("lowStockThreshold")}
                label="Low Stock Threshold"
                direction={sortBy === "lowStockThreshold" ? sortDir : null}
              />
              <PlainHeader label="Status" />
              <PlainHeader label="Last Stock Movement" />
              <PlainHeader label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-100">
            {rows.map((product) => (
              <tr key={product.id} className="transition-colors duration-150 hover:bg-warm-50/60">
                <td className="whitespace-nowrap px-4 py-3">
                  <Link href={`/admin/inventory/${product.id}`} className="font-medium text-brown-900 hover:text-green-700">
                    {product.name}
                  </Link>
                  <div className="text-xs text-brown-500">{product.category}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-500">{product.sku ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-brown-900">
                  {numberFmt.format(product.currentStock)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">{product.unit}</td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">
                  {product.lowStockThreshold !== null ? numberFmt.format(product.lowStockThreshold) : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StockStatusBadge status={product.stockStatus} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">
                  {product.lastMovementAt ? product.lastMovementAt.slice(0, 10) : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Link
                    href={buildHref({ adjust: product.id }, base)}
                    aria-label={`Adjust stock for ${product.name}`}
                    className="rounded-lg p-1.5 text-brown-500 transition-colors hover:bg-warm-100 hover:text-brown-800"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
