import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth/session";
import type { PaymentStatus } from "@/generated/prisma/enums";
import {
  getReportProductOptions,
  getReportRetailerOptions,
  getSalesReport,
  getSalesReportSummary,
  getTopLists,
} from "@/lib/reports/queries";
import type { ReportSortField, SortDirection } from "@/lib/reports/queries";
import { parseReportRangeParams } from "@/lib/reports/dateRangeParams";
import KPICard from "@/components/admin/dashboard/KPICard";
import { RevenueIcon, ReceiptIcon, BoxIcon, WalletIcon, ChartBarIcon } from "@/components/admin/dashboard/icons";
import ReportsFilterBar from "@/components/admin/reports/ReportsFilterBar";
import SalesReportTable from "@/components/admin/reports/SalesReportTable";
import SalesReportPagination from "@/components/admin/reports/SalesReportPagination";
import TopListCard from "@/components/admin/reports/TopListCard";
import ExportCsvButton from "@/components/admin/reports/ExportCsvButton";
import type { ReportFiltersState } from "@/components/admin/reports/types";

export const metadata: Metadata = {
  title: "Reports",
};

interface AdminReportsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const VALID_SORT_FIELDS: ReportSortField[] = ["invoiceDate", "retailerName", "productName", "totalAmount", "paymentStatus"];
const VALID_PAYMENT_STATUSES: PaymentStatus[] = ["PENDING", "PARTIAL", "PAID", "CANCELLED"];

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const number3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Reports & Export module — quick answers to common business questions,
// with a CSV export of exactly what's on screen, per this task's
// objective. Server Component: filters/search/sort/pagination all live in
// the URL and are resolved entirely server-side (src/lib/reports/
// queries.ts), never fetched client-side. Session is re-verified here as
// defense-in-depth, matching every other admin page in this project.
export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  await requireAdminSession();

  const params = await searchParams;
  const { range, invalid } = parseReportRangeParams(params);

  const retailerId = firstValue(params.retailerId) ?? "";
  const productId = firstValue(params.productId) ?? "";
  const rawStatus = firstValue(params.status);
  const paymentStatus = VALID_PAYMENT_STATUSES.includes(rawStatus as PaymentStatus)
    ? (rawStatus as PaymentStatus)
    : undefined;
  const search = firstValue(params.search) ?? "";

  const rawSort = firstValue(params.sort);
  const sortBy: ReportSortField = VALID_SORT_FIELDS.includes(rawSort as ReportSortField)
    ? (rawSort as ReportSortField)
    : "invoiceDate";
  const sortDir: SortDirection = firstValue(params.dir) === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(firstValue(params.page)) || 1);
  const pageSize = 25;

  const filters = { range, retailerId: retailerId || undefined, productId: productId || undefined, paymentStatus, search };

  const [reportResult, summary, topLists, retailerOptions, productOptions] = await Promise.all([
    getSalesReport({ ...filters, sortBy, sortDir, page, pageSize }),
    getSalesReportSummary(filters),
    getTopLists(range),
    getReportRetailerOptions(),
    getReportProductOptions(),
  ]);

  const filterState: ReportFiltersState = {
    rangeKey: range.key,
    customFrom: range.key === "custom" ? range.from : "",
    customTo: range.key === "custom" ? range.to : "",
    retailerId,
    productId,
    paymentStatus: paymentStatus ?? "",
    search,
  };

  const baseParams: Record<string, string | undefined> = {
    range: range.key,
    from: range.key === "custom" ? range.from : undefined,
    to: range.key === "custom" ? range.to : undefined,
    retailerId: retailerId || undefined,
    productId: productId || undefined,
    status: paymentStatus,
    search: search || undefined,
    sort: sortBy,
    dir: sortDir,
  };

  const exportParams = new URLSearchParams();
  for (const [key, value] of Object.entries(baseParams)) {
    if (value) exportParams.set(key, value);
  }

  const hasAnySalesAtAll = reportResult.totalCount > 0 || Boolean(search || retailerId || productId || paymentStatus);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-warm-200 pb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brown-900">Reports</h1>
          <p className="mt-1 text-sm text-brown-600">
            Answer common business questions and export the filtered results as CSV.
          </p>
        </div>
        <ExportCsvButton queryString={exportParams.toString()} />
      </header>

      {invalid && (
        <div role="status" className="mt-4 rounded-xl bg-warm-100 px-4 py-3 text-sm text-brown-600">
          The selected date range wasn&apos;t valid — showing <strong>This Month</strong> instead.
        </div>
      )}

      <div className="mt-6">
        <ReportsFilterBar initialFilters={filterState} retailerOptions={retailerOptions} productOptions={productOptions} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KPICard title="Total Revenue" value={`₹${rupee.format(summary.totalRevenue)}`} subtitle="Non-cancelled" icon={<RevenueIcon />} />
        <KPICard title="Total Sales" value={String(summary.totalSales)} subtitle="All statuses" icon={<ReceiptIcon />} />
        <KPICard title="Units Sold" value={number3.format(summary.unitsSold)} subtitle="Non-cancelled" icon={<BoxIcon />} />
        <KPICard title="Outstanding" value={`₹${rupee.format(summary.outstandingAmount)}`} subtitle="Pending + Partial" icon={<WalletIcon />} />
        <KPICard title="Avg. Order Value" value={`₹${rupee.format(summary.averageOrderValue)}`} subtitle="Revenue ÷ sales" icon={<ChartBarIcon />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TopListCard
          title="Top Products"
          description="By units sold, for the selected date range."
          items={topLists.topProductsByQuantity.map((p) => ({
            key: p.productId,
            label: p.name,
            sublabel: p.category,
            value: `${number3.format(p.quantity)} units`,
          }))}
          emptyMessage="No products sold in this period."
        />
        <TopListCard
          title="Top Retailers"
          description="By number of orders, for the selected date range."
          items={topLists.topRetailersByOrders.map((r) => ({
            key: r.retailerId,
            label: r.name,
            sublabel: r.city,
            value: `${r.orderCount} orders`,
          }))}
          emptyMessage="No retailers purchased in this period."
        />
        <TopListCard
          title="Highest Revenue Products"
          description="By revenue, for the selected date range."
          items={topLists.highestRevenueProducts.map((p) => ({
            key: p.productId,
            label: p.name,
            sublabel: p.category,
            value: `₹${rupee.format(p.revenue)}`,
          }))}
          emptyMessage="No products sold in this period."
        />
        <TopListCard
          title="Highest Revenue Retailers"
          description="By revenue, for the selected date range."
          items={topLists.highestRevenueRetailers.map((r) => ({
            key: r.retailerId,
            label: r.name,
            sublabel: r.city,
            value: `₹${rupee.format(r.revenue)}`,
          }))}
          emptyMessage="No retailers purchased in this period."
        />
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="font-heading text-lg font-bold text-brown-900">Sales Report</h2>
        <SalesReportTable
          rows={reportResult.rows}
          baseParams={baseParams}
          sortBy={sortBy}
          sortDir={sortDir}
          hasAnySalesAtAll={hasAnySalesAtAll}
        />
        {reportResult.rows.length > 0 && (
          <SalesReportPagination page={page} pageSize={pageSize} totalCount={reportResult.totalCount} baseParams={baseParams} />
        )}
      </div>
    </div>
  );
}
