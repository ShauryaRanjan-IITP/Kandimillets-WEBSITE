import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/session";
import { getRetailerById } from "@/lib/retailers/queries";
import { getSalesByRetailer } from "@/lib/sales/queries";
import KPICard from "@/components/admin/dashboard/KPICard";
import { RevenueIcon, WalletIcon, ReceiptIcon, CalendarIcon } from "@/components/admin/dashboard/icons";
import RetailerDetailHeader from "@/components/admin/retailers/RetailerDetailHeader";
import RetailerInfoPanel from "@/components/admin/retailers/RetailerInfoPanel";
import RetailerSalesHistoryTable from "@/components/admin/retailers/RetailerSalesHistoryTable";
import RetailerFormModalController from "@/components/admin/retailers/RetailerFormModalController";
import RetailerStatusDialogController from "@/components/admin/retailers/RetailerStatusDialogController";

interface RetailerDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export async function generateMetadata({ params }: RetailerDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const retailer = await getRetailerById(id);
  return { title: retailer?.name ?? "Retailer" };
}

// Retailer Detail page — this task's "Retailer Details" §6. Reuses
// KPICard (Admin Dashboard) for the summary tiles rather than building a
// second stat-card component, and PaymentStatusBadge + the `?sale=<id>`
// deep-link (Sales Register) for the Recent Sales table, rather than
// building a second sale detail view.
export default async function RetailerDetailPage({ params, searchParams }: RetailerDetailPageProps) {
  await requireAdminSession();

  const { id } = await params;
  const retailer = await getRetailerById(id);
  if (!retailer) {
    notFound();
  }

  const [recentSales, resolvedSearchParams] = await Promise.all([getSalesByRetailer(id, 10), searchParams]);

  const isEditOpen = firstValue(resolvedSearchParams.edit) === id;
  const isStatusOpen = firstValue(resolvedSearchParams.status) === id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <RetailerDetailHeader retailer={retailer} />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard title="Total Sales" value={`₹${rupee.format(retailer.totalSales)}`} subtitle="All time, non-cancelled" icon={<RevenueIcon />} />
        <KPICard title="Outstanding Amount" value={`₹${rupee.format(retailer.outstandingAmount)}`} subtitle="Pending + Partial" icon={<WalletIcon />} />
        <KPICard title="Number of Orders" value={String(retailer.orderCount)} subtitle="All time" icon={<ReceiptIcon />} />
        <KPICard title="Last Purchase" value={retailer.lastPurchaseDate ?? "—"} subtitle="Most recent invoice date" icon={<CalendarIcon />} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <RetailerInfoPanel retailer={retailer} />
        <RetailerSalesHistoryTable sales={recentSales} />
      </div>

      {isEditOpen && <RetailerFormModalController editingRetailer={retailer} />}
      {isStatusOpen && <RetailerStatusDialogController retailer={retailer} />}
    </div>
  );
}
