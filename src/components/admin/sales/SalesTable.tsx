"use client";

import { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import PaymentStatusBadge from "./PaymentStatusBadge";
import SalesEmptyState from "./SalesEmptyState";
import type { SaleRow } from "./types";

interface SalesTableProps {
  data: SaleRow[];
  hasAnyDataAtAll: boolean;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: (filters: ColumnFiltersState) => void;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  onAddSale: () => void;
  onClearFilters: () => void;
  onEditSale: (sale: SaleRow) => void;
  onVoidSale: (sale: SaleRow) => void;
}

const columnHelper = createColumnHelper<SaleRow>();

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

function buildColumns(onEditSale: (sale: SaleRow) => void, onVoidSale: (sale: SaleRow) => void) {
  return [
  columnHelper.accessor("saleNumber", {
    header: "Sale #",
    cell: (info) => (
      <span className="font-medium text-brown-900">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("invoiceDate", {
    header: "Invoice Date",
    cell: (info) => <span className="text-brown-700">{info.getValue()}</span>,
  }),
  columnHelper.accessor("retailerName", {
    header: "Retailer",
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue === "ALL") return true;
      return row.original.retailerId === filterValue;
    },
    cell: (info) => (
      <div>
        <div className="text-brown-900">{info.getValue()}</div>
        <div className="text-xs text-brown-500">{info.row.original.city}</div>
      </div>
    ),
  }),
  columnHelper.accessor("productName", {
    header: "Product",
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue === "ALL") return true;
      return row.original.productId === filterValue;
    },
    cell: (info) => <span className="text-brown-700">{info.getValue()}</span>,
  }),
  columnHelper.accessor("quantity", {
    header: "Qty",
    cell: (info) => (
      <span className="text-brown-700">
        {info.getValue()} {info.row.original.unit}
      </span>
    ),
  }),
  columnHelper.accessor("rate", {
    header: "Rate",
    cell: (info) => <span className="text-brown-700">₹{rupee.format(info.getValue())}</span>,
  }),
  columnHelper.accessor("totalAmount", {
    header: "Total",
    cell: (info) => (
      <span className="font-semibold text-brown-900">₹{rupee.format(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("paymentStatus", {
    header: "Payment Status",
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue === "ALL") return true;
      return row.original.paymentStatus === filterValue;
    },
    cell: (info) => (
      <PaymentStatusBadge status={info.getValue()} dueDate={info.row.original.dueDate} />
    ),
  }),
  columnHelper.accessor("invoiceNumber", {
    header: "Invoice #",
    cell: (info) => <span className="text-brown-500">{info.getValue()}</span>,
  }),
  columnHelper.accessor("remarks", {
    header: "Remarks",
    cell: (info) => (
      <span className="line-clamp-1 max-w-[160px] text-brown-500">{info.getValue() ?? "—"}</span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEditSale(info.row.original)}
          aria-label={`Edit sale ${info.row.original.saleNumber}`}
          className="rounded-lg p-1.5 text-brown-500 transition-colors hover:bg-warm-100 hover:text-brown-800"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onVoidSale(info.row.original)}
          aria-label={`Void sale ${info.row.original.saleNumber}`}
          className="rounded-lg p-1.5 text-brown-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    ),
  }),
  ];
}

function SortIcon({ direction }: { direction: "asc" | "desc" | false }) {
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

export default function SalesTable({
  data,
  hasAnyDataAtAll,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  pagination,
  onPaginationChange,
  onAddSale,
  onClearFilters,
  onEditSale,
  onVoidSale,
}: SalesTableProps) {
  const columns = useMemo(() => buildColumns(onEditSale, onVoidSale), [onEditSale, onVoidSale]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter, pagination },
    onSortingChange: (updater) =>
      onSortingChange(typeof updater === "function" ? updater(sorting) : updater),
    onColumnFiltersChange: (updater) =>
      onColumnFiltersChange(typeof updater === "function" ? updater(columnFilters) : updater),
    onGlobalFilterChange: (updater) =>
      onGlobalFilterChange(typeof updater === "function" ? updater(globalFilter) : updater),
    onPaginationChange: (updater) =>
      onPaginationChange(typeof updater === "function" ? updater(pagination) : updater),
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase();
      if (!search) return true;
      const sale = row.original;
      return [sale.saleNumber, sale.invoiceNumber, sale.retailerName, sale.productName, sale.remarks ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(search);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <SalesEmptyState
        hasNoSalesWhatsoever={!hasAnyDataAtAll}
        onAddSale={onAddSale}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="premium-card overflow-hidden">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-warm-200 bg-warm-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="whitespace-nowrap px-4 py-3">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brown-500 hover:text-brown-700"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <SortIcon direction={header.column.getIsSorted()} />
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-warm-100">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors duration-150 hover:bg-warm-50/60">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="divide-y divide-warm-100 md:hidden">
        {rows.map((row) => {
          const sale = row.original;
          return (
            <div key={row.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-brown-900">{sale.saleNumber}</p>
                  <p className="text-xs text-brown-500">{sale.invoiceDate}</p>
                </div>
                <PaymentStatusBadge status={sale.paymentStatus} dueDate={sale.dueDate} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-brown-400">Retailer</p>
                  <p className="text-brown-800">{sale.retailerName}</p>
                  <p className="text-xs text-brown-500">{sale.city}</p>
                </div>
                <div>
                  <p className="text-xs text-brown-400">Product</p>
                  <p className="text-brown-800">{sale.productName}</p>
                  <p className="text-xs text-brown-500">
                    {sale.quantity} {sale.unit} · ₹{rupee.format(sale.rate)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-brown-500">Invoice #{sale.invoiceNumber}</span>
                <span className="text-base font-bold text-brown-900">
                  ₹{rupee.format(sale.totalAmount)}
                </span>
              </div>
              {sale.remarks && <p className="mt-2 text-xs text-brown-500">{sale.remarks}</p>}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-warm-200 bg-warm-50 px-4 py-3 sm:flex-row">
        <div className="flex items-center gap-2 text-xs text-brown-500">
          <span>Rows per page</span>
          <select
            value={pagination.pageSize}
            onChange={(e) =>
              onPaginationChange({ ...pagination, pageIndex: 0, pageSize: Number(e.target.value) })
            }
            className="rounded-lg border border-warm-300 bg-white px-2 py-1 text-xs text-brown-700"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-sm text-brown-600">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg border border-warm-300 px-3 py-1.5 text-xs font-semibold text-brown-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs">
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
          </span>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg border border-warm-300 px-3 py-1.5 text-xs font-semibold text-brown-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
