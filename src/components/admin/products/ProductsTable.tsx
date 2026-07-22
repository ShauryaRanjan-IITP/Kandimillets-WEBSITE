/**
 * Products list table — a plain, server-renderable component (no
 * "use client"): sortable headers and row actions are all plain `<Link>`s
 * that navigate with an updated query string (server-side sort/search per
 * this task's explicit requirement), never client state. Mirrors
 * RetailersTable.tsx exactly, including hoisting the header components to
 * module scope (react-hooks/static-components — "Cannot create components
 * during render" — was hit and fixed once already for that table).
 */
import Link from "next/link";
import EmptyState from "@/components/admin/dashboard/EmptyState";
import { ClipboardEmptyIcon } from "@/components/admin/dashboard/icons";
import ProductStatusBadge from "./ProductStatusBadge";
import type { ProductRow, ProductSortField, SortDirection } from "./types";

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

interface ProductsTableProps {
  rows: ProductRow[];
  search: string;
  sortBy: ProductSortField;
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
  return query ? `/admin/products?${query}` : "/admin/products";
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

export default function ProductsTable({ rows, search, sortBy, sortDir, hasAnyProductsAtAll }: ProductsTableProps) {
  const base = { search: search || undefined, sort: sortBy, dir: sortDir };

  function sortHeaderHref(field: ProductSortField) {
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
              : "Add your first product to start recording sales against it."
          }
          action={hasAnyProductsAtAll ? undefined : { label: "Add Product", href: "/admin/products?create=1" }}
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
                label="Product Name"
                direction={sortBy === "name" ? sortDir : null}
              />
              <SortableHeader href={sortHeaderHref("sku")} label="SKU" direction={sortBy === "sku" ? sortDir : null} />
              <SortableHeader
                href={sortHeaderHref("category")}
                label="Category"
                direction={sortBy === "category" ? sortDir : null}
              />
              <PlainHeader label="Unit" />
              <SortableHeader
                href={sortHeaderHref("status")}
                label="Status"
                direction={sortBy === "status" ? sortDir : null}
              />
              <SortableHeader
                href={sortHeaderHref("sellingPrice")}
                label="Selling Price"
                direction={sortBy === "sellingPrice" ? sortDir : null}
              />
              <PlainHeader label="Total Units Sold" />
              <PlainHeader label="Total Revenue" />
              <PlainHeader label="Last Sold" />
              <PlainHeader label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-100">
            {rows.map((product) => (
              <tr key={product.id} className="transition-colors duration-150 hover:bg-warm-50/60">
                <td className="whitespace-nowrap px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="font-medium text-brown-900 hover:text-green-700">
                    {product.name}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-500">{product.sku ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">{product.category}</td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">{product.unit}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <ProductStatusBadge isActive={product.isActive} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-brown-900">
                  {product.sellingPrice !== null ? `₹${rupee.format(product.sellingPrice)}` : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">{rupee.format(product.unitsSold)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">₹{rupee.format(product.totalRevenue)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">{product.lastSoldDate ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={buildHref({ edit: product.id }, base)}
                      aria-label={`Edit ${product.name}`}
                      className="rounded-lg p-1.5 text-brown-500 transition-colors hover:bg-warm-100 hover:text-brown-800"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </Link>
                    <Link
                      href={buildHref({ status: product.id }, base)}
                      aria-label={`${product.isActive ? "Deactivate" : "Activate"} ${product.name}`}
                      className={`rounded-lg p-1.5 transition-colors ${
                        product.isActive
                          ? "text-brown-500 hover:bg-red-50 hover:text-red-600"
                          : "text-brown-500 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      {product.isActive ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
