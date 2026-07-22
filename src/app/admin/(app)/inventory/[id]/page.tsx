import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/session";
import {
  getProductStockDetail,
  getProductOptionsForInventory,
  getStockMovementsForProduct,
} from "@/lib/inventory/queries";
import KPICard from "@/components/admin/dashboard/KPICard";
import { BoxIcon, RevenueIcon, XCircleIcon, CalendarIcon } from "@/components/admin/dashboard/icons";
import InventoryDetailHeader from "@/components/admin/inventory/InventoryDetailHeader";
import StockMovementsTable from "@/components/admin/inventory/StockMovementsTable";
import StockAdjustmentModalController from "@/components/admin/inventory/StockAdjustmentModalController";

interface InventoryDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const numberFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

export async function generateMetadata({ params }: InventoryDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductStockDetail(id);
  return { title: product ? `${product.name} — Inventory` : "Inventory" };
}

// Inventory Detail page — this task's "Inventory Detail" §3. Reuses
// KPICard (Admin Dashboard) for the summary tiles rather than building a
// second stat-card component — same reuse pattern as the Retailer/Product
// detail pages.
export default async function InventoryDetailPage({ params, searchParams }: InventoryDetailPageProps) {
  await requireAdminSession();

  const { id } = await params;
  const product = await getProductStockDetail(id);
  if (!product) {
    notFound();
  }

  const [movements, resolvedSearchParams] = await Promise.all([
    getStockMovementsForProduct(id, 50),
    searchParams,
  ]);

  const adjustParam = firstValue(resolvedSearchParams.adjust);
  const isAdjustOpen = adjustParam === id;
  const productOptions = isAdjustOpen ? await getProductOptionsForInventory() : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <InventoryDetailHeader product={product} />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard
          title="Current Stock"
          value={`${numberFmt.format(product.currentStock)} ${product.unit}`}
          subtitle={product.lowStockThreshold !== null ? `Threshold: ${numberFmt.format(product.lowStockThreshold)}` : "No threshold set"}
          icon={<BoxIcon />}
        />
        <KPICard
          title="Total Stock Added"
          value={`${numberFmt.format(product.totalStockAdded)} ${product.unit}`}
          subtitle="All time"
          icon={<RevenueIcon />}
        />
        <KPICard
          title="Total Stock Removed"
          value={`${numberFmt.format(product.totalStockRemoved)} ${product.unit}`}
          subtitle="All time"
          icon={<XCircleIcon />}
        />
        <KPICard
          title="Last Movement"
          value={product.lastMovementAt ? product.lastMovementAt.slice(0, 10) : "—"}
          subtitle="Most recent stock change"
          icon={<CalendarIcon />}
        />
      </div>

      <div className="mt-8">
        <StockMovementsTable movements={movements} />
      </div>

      {isAdjustOpen && <StockAdjustmentModalController products={productOptions} adjustParam={adjustParam} />}
    </div>
  );
}
