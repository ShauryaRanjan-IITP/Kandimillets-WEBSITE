"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table";
import { createSale, updateSale, voidSale } from "@/app/admin/(app)/sales/actions";
import AddSaleModal from "./AddSaleModal";
import VoidSaleDialog from "./VoidSaleDialog";
import MonthlyArchive from "./MonthlyArchive";
import QuickDateFilters from "./QuickDateFilters";
import SalesTable from "./SalesTable";
import SalesTableToolbar from "./SalesTableToolbar";
import {
  buildMonthlyArchive,
  dateFilterForArchiveMonth,
  dateFilterForYear,
  filterRowsByDate,
  resolveQuickDateFilter,
} from "./dateFilterUtils";
import type {
  AddSaleFormValues,
  DateFilterState,
  PaymentStatus,
  ProductOption,
  RetailerOption,
  SaleRow,
} from "./types";
import { DEFAULT_DATE_FILTER } from "./types";

interface SalesRegisterViewProps {
  initialSales: SaleRow[];
  retailers: RetailerOption[];
  products: ProductOption[];
}

function pad(n: number): string {
  return String(n).padStart(6, "0");
}

/** Client-side preview only — the server assigns the real Sale Number
 * atomically at save time (see src/lib/sales/saleNumber.ts). This mirrors
 * that logic against the currently loaded rows purely for display. */
function previewNextSaleNumber(rows: SaleRow[], year: number): string {
  const prefix = `SAL-${year}-`;
  const maxSequence = rows
    .filter((row) => row.saleNumber.startsWith(prefix))
    .reduce((max, row) => {
      const seq = Number(row.saleNumber.slice(prefix.length));
      return Number.isFinite(seq) && seq > max ? seq : max;
    }, 0);
  return `${prefix}${pad(maxSequence + 1)}`;
}

function saleToFormValues(sale: SaleRow): AddSaleFormValues {
  return {
    invoiceNumber: sale.invoiceNumber,
    invoiceDate: sale.invoiceDate,
    dueDate: sale.dueDate,
    retailerId: sale.retailerId,
    productId: sale.productId,
    quantity: String(sale.quantity),
    unit: sale.unit,
    rate: String(sale.rate),
    gstIncluded: sale.gstIncluded,
    paymentMethod: sale.paymentMethod ?? "",
    paymentStatus: sale.paymentStatus,
    amountPaid: String(sale.amountPaid),
    paymentDate: sale.paymentDate ?? "",
    remarks: sale.remarks ?? "",
  };
}

export default function SalesRegisterView({ initialSales, retailers, products }: SalesRegisterViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sales, setSales] = useState<SaleRow[]>(initialSales);

  // Whether the Add/Edit modal is open lives entirely in the URL
  // (`?addSale=1` / `?sale=<id>`), not local state — the same "URL is the
  // source of truth" convention already used for the Admin Dashboard's
  // Global Date Filter. This is what lets the Admin Shell's sidebar "Add
  // Sale" shortcut (docs: "reuse the existing implementation") and the
  // Dashboard's "Click row → open Sale" links (docs/DASHBOARD.md §7/§8)
  // open this exact modal from anywhere, including when already on this
  // page — a one-time lazy-state initializer wouldn't react to a second
  // navigation to the same mounted page, but reading searchParams on
  // every render does.
  const isAddModalOpen = searchParams.get("addSale") === "1";
  const editingSaleId = searchParams.get("sale");
  const editingSale = editingSaleId ? sales.find((sale) => sale.id === editingSaleId) ?? null : null;

  const [voidingSale, setVoidingSale] = useState<SaleRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [dateFilter, setDateFilter] = useState<DateFilterState>(DEFAULT_DATE_FILTER);
  const [sorting, setSorting] = useState<SortingState>([{ id: "invoiceDate", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });

  const archive = useMemo(() => buildMonthlyArchive(sales), [sales]);
  const years = useMemo(() => archive.map((entry) => entry.year), [archive]);

  const dateFilteredRows = useMemo(() => filterRowsByDate(sales, dateFilter), [sales, dateFilter]);

  function resetToFirstPage() {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  function handleQuickDateSelect(key: Parameters<typeof resolveQuickDateFilter>[0]) {
    setDateFilter(resolveQuickDateFilter(key));
    resetToFirstPage();
  }

  function handleCustomRangeChange(from: string | null, to: string | null) {
    setDateFilter({ key: "custom", from, to });
    resetToFirstPage();
  }

  function handleYearChange(year: number | null) {
    if (year === null) {
      setDateFilter(DEFAULT_DATE_FILTER);
    } else if (dateFilter.archiveMonth) {
      setDateFilter(dateFilterForArchiveMonth(year, dateFilter.archiveMonth));
    } else {
      setDateFilter(dateFilterForYear(year));
    }
    resetToFirstPage();
  }

  function handleMonthChange(month: number | null) {
    if (!dateFilter.archiveYear) return;
    if (month === null) {
      setDateFilter(dateFilterForYear(dateFilter.archiveYear));
    } else {
      setDateFilter(dateFilterForArchiveMonth(dateFilter.archiveYear, month));
    }
    resetToFirstPage();
  }

  function handleArchiveMonthSelect(year: number, month: number) {
    setDateFilter(dateFilterForArchiveMonth(year, month));
    resetToFirstPage();
  }

  function getColumnFilterValue(columnId: string): string {
    return (columnFilters.find((f) => f.id === columnId)?.value as string) ?? "ALL";
  }

  function setColumnFilterValue(columnId: string, value: string) {
    setColumnFilters((prev) => {
      const withoutColumn = prev.filter((f) => f.id !== columnId);
      if (value === "ALL") return withoutColumn;
      return [...withoutColumn, { id: columnId, value }];
    });
    resetToFirstPage();
  }

  function handleClearFilters() {
    setDateFilter(DEFAULT_DATE_FILTER);
    setColumnFilters([]);
    setGlobalFilter("");
    resetToFirstPage();
  }

  /** Navigates to this same page with the given param removed — closes
   * whichever URL-driven modal (`addSale`/`sale`) is currently open. */
  function closeUrlModal(paramToRemove: string) {
    const params = new URLSearchParams(searchParams);
    params.delete(paramToRemove);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  async function handleAddSaleSubmit(values: AddSaleFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await createSale(values);
    setIsSubmitting(false);

    if (result.status === "success") {
      setSales((prev) => [result.sale, ...prev]);
      closeUrlModal("addSale");
      return;
    }
    setSubmitError(result.message);
  }

  async function handleEditSaleSubmit(values: AddSaleFormValues) {
    if (!editingSale) return;
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await updateSale(editingSale.id, values);
    setIsSubmitting(false);

    if (result.status === "success") {
      setSales((prev) => prev.map((row) => (row.id === result.sale.id ? result.sale : row)));
      closeUrlModal("sale");
      return;
    }
    setSubmitError(result.message);
  }

  async function handleVoidConfirm(reason: string) {
    if (!voidingSale) return;
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await voidSale(voidingSale.id, reason);
    setIsSubmitting(false);

    if (result.status === "success") {
      // Voided rows are excluded from the default view (docs/SALES_REGISTER.md §6).
      setSales((prev) => prev.filter((row) => row.id !== voidingSale.id));
      setVoidingSale(null);
      return;
    }
    setSubmitError(result.message);
  }

  function openAddModal() {
    setSubmitError(null);
    const params = new URLSearchParams(searchParams);
    params.set("addSale", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function openEditModal(sale: SaleRow) {
    setSubmitError(null);
    const params = new URLSearchParams(searchParams);
    params.set("sale", sale.id);
    router.push(`${pathname}?${params.toString()}`);
  }

  function openVoidDialog(sale: SaleRow) {
    setSubmitError(null);
    setVoidingSale(sale);
  }

  const nextSaleNumberPreview = useMemo(
    () => previewNextSaleNumber(sales, new Date().getFullYear()),
    [sales]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-warm-200 pb-6">
        <h1 className="font-heading text-2xl font-bold text-brown-900">Sales Register</h1>
        <p className="mt-1 text-sm text-brown-600">
          Every sale, organized month by month. Search, filter, and browse the archive below.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="order-2 lg:order-1">
          <MonthlyArchive
            archive={archive}
            activeYear={dateFilter.archiveYear}
            activeMonth={dateFilter.archiveMonth}
            onSelectMonth={handleArchiveMonthSelect}
          />
        </aside>

        <div className="order-1 space-y-4 lg:order-2">
          <SalesTableToolbar
            searchValue={globalFilter}
            onSearchChange={(value) => {
              setGlobalFilter(value);
              resetToFirstPage();
            }}
            dateFrom={dateFilter.from}
            dateTo={dateFilter.to}
            onCustomRangeChange={handleCustomRangeChange}
            years={years}
            selectedYear={dateFilter.archiveYear ?? null}
            onYearChange={handleYearChange}
            selectedMonth={dateFilter.archiveMonth ?? null}
            onMonthChange={handleMonthChange}
            statusFilter={getColumnFilterValue("paymentStatus") as PaymentStatus | "ALL"}
            onStatusFilterChange={(status) => setColumnFilterValue("paymentStatus", status)}
            retailers={retailers}
            retailerFilter={getColumnFilterValue("retailerName")}
            onRetailerFilterChange={(id) => setColumnFilterValue("retailerName", id)}
            products={products}
            productFilter={getColumnFilterValue("productName")}
            onProductFilterChange={(id) => setColumnFilterValue("productName", id)}
            onClearFilters={handleClearFilters}
            onAddSale={openAddModal}
          />

          <QuickDateFilters
            activeKey={dateFilter.key}
            onSelect={handleQuickDateSelect}
            onCustomClick={() => handleCustomRangeChange(dateFilter.from, dateFilter.to)}
          />

          <SalesTable
            data={dateFilteredRows}
            hasAnyDataAtAll={sales.length > 0}
            sorting={sorting}
            onSortingChange={setSorting}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            pagination={pagination}
            onPaginationChange={setPagination}
            onAddSale={openAddModal}
            onClearFilters={handleClearFilters}
            onEditSale={openEditModal}
            onVoidSale={openVoidDialog}
          />
        </div>
      </div>

      {isAddModalOpen && (
        <AddSaleModal
          onClose={() => closeUrlModal("addSale")}
          retailers={retailers}
          products={products}
          saleNumberDisplay={nextSaleNumberPreview}
          onSubmit={handleAddSaleSubmit}
          submitting={isSubmitting}
          submitError={submitError}
        />
      )}

      {editingSale && (
        <AddSaleModal
          onClose={() => closeUrlModal("sale")}
          retailers={retailers}
          products={products}
          saleNumberDisplay={editingSale.saleNumber}
          initialValues={saleToFormValues(editingSale)}
          onSubmit={handleEditSaleSubmit}
          submitting={isSubmitting}
          submitError={submitError}
        />
      )}

      {voidingSale && (
        <VoidSaleDialog
          sale={voidingSale}
          onClose={() => setVoidingSale(null)}
          onConfirm={handleVoidConfirm}
          submitting={isSubmitting}
          submitError={submitError}
        />
      )}
    </div>
  );
}
