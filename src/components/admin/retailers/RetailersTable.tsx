/**
 * Retailers list table — a plain, server-renderable component (no
 * "use client"): sortable headers and row actions are all plain `<Link>`s
 * that navigate with an updated query string (server-side sort/search per
 * this task's explicit requirement), never client state. This is what
 * "hydrate only interactive components" means in practice — this entire
 * table ships zero client JS of its own.
 */
import Link from "next/link";
import EmptyState from "@/components/admin/dashboard/EmptyState";
import { ClipboardEmptyIcon } from "@/components/admin/dashboard/icons";
import RetailerStatusBadge from "./RetailerStatusBadge";
import type { RetailerRow, RetailerSortField, SortDirection } from "./types";

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

interface RetailersTableProps {
  rows: RetailerRow[];
  search: string;
  sortBy: RetailerSortField;
  sortDir: SortDirection;
  hasAnyRetailersAtAll: boolean;
}

function buildHref(overrides: Record<string, string | undefined>, base: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  const merged = { ...base, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/admin/retailers?${query}` : "/admin/retailers";
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

export default function RetailersTable({ rows, search, sortBy, sortDir, hasAnyRetailersAtAll }: RetailersTableProps) {
  const base = { search: search || undefined, sort: sortBy, dir: sortDir };

  function sortHeaderHref(field: RetailerSortField) {
    const nextDir: SortDirection = sortBy === field && sortDir === "asc" ? "desc" : "asc";
    return buildHref({ sort: field, dir: nextDir, page: undefined }, base);
  }

  if (rows.length === 0) {
    return (
      <div className="premium-card">
        <EmptyState
          icon={<ClipboardEmptyIcon />}
          title={hasAnyRetailersAtAll ? "No retailers match your search" : "No retailers yet"}
          message={
            hasAnyRetailersAtAll
              ? "Try a different name, city, phone, or GST number."
              : "Add your first retailer to start recording sales against a real customer."
          }
          action={hasAnyRetailersAtAll ? undefined : { label: "Add Retailer", href: "/admin/retailers?create=1" }}
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
                label="Retailer Name"
                direction={sortBy === "name" ? sortDir : null}
              />
              <PlainHeader label="Contact Person" />
              <PlainHeader label="Phone" />
              <SortableHeader href={sortHeaderHref("city")} label="City" direction={sortBy === "city" ? sortDir : null} />
              <PlainHeader label="GST Number" />
              <SortableHeader
                href={sortHeaderHref("status")}
                label="Status"
                direction={sortBy === "status" ? sortDir : null}
              />
              <PlainHeader label="Outstanding" />
              <PlainHeader label="Last Purchase" />
              <PlainHeader label="Total Purchases" />
              <PlainHeader label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-100">
            {rows.map((retailer) => (
              <tr key={retailer.id} className="transition-colors duration-150 hover:bg-warm-50/60">
                <td className="whitespace-nowrap px-4 py-3">
                  <Link href={`/admin/retailers/${retailer.id}`} className="font-medium text-brown-900 hover:text-green-700">
                    {retailer.name}
                  </Link>
                  <div className="text-xs text-brown-500">{retailer.state}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">{retailer.contactPerson ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">{retailer.phone ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">{retailer.city}</td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-500">{retailer.gstin ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <RetailerStatusBadge isActive={retailer.isActive} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-brown-900">
                  ₹{rupee.format(retailer.outstandingAmount)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">{retailer.lastPurchaseDate ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">₹{rupee.format(retailer.totalSales)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={buildHref({ edit: retailer.id }, base)}
                      aria-label={`Edit ${retailer.name}`}
                      className="rounded-lg p-1.5 text-brown-500 transition-colors hover:bg-warm-100 hover:text-brown-800"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </Link>
                    <Link
                      href={buildHref({ status: retailer.id }, base)}
                      aria-label={`${retailer.isActive ? "Deactivate" : "Activate"} ${retailer.name}`}
                      className={`rounded-lg p-1.5 transition-colors ${
                        retailer.isActive
                          ? "text-brown-500 hover:bg-red-50 hover:text-red-600"
                          : "text-brown-500 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      {retailer.isActive ? (
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
