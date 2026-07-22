import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/session";
import { getProductById, getTopRetailersForProduct } from "@/lib/products/queries";
import { getSalesByProduct } from "@/lib/sales/queries";
import KPICard from "@/components/admin/dashboard/KPICard";
import { RevenueIcon, BoxIcon, ReceiptIcon, CalendarIcon } from "@/components/admin/dashboard/icons";
import ProductDetailHeader from "@/components/admin/products/ProductDetailHeader";
import ProductInfoPanel from "@/components/admin/products/ProductInfoPanel";
import ProductSalesHistoryTable from "@/components/admin/products/ProductSalesHistoryTable";
import ProductTopRetailers from "@/components/admin/products/ProductTopRetailers";
import ProductFormModalController from "@/components/admin/products/ProductFormModalController";
import ProductStatusDialogController from "@/components/admin/products/ProductStatusDialogController";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return { title: product?.name ?? "Product" };
}

// Product Detail page — this task's "Product Detail Page" §6. Reuses
// KPICard (Admin Dashboard) for the summary tiles and PaymentStatusBadge +
// the `?sale=<id>` deep-link (Sales Register) for the Recent Sales table,
// rather than building a second sale detail view — same reuse pattern as
// the Retailer Detail page.
export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  await requireAdminSession();

  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    notFound();
  }

  const [recentSales, topRetailers, resolvedSearchParams] = await Promise.all([
    getSalesByProduct(id, 10),
    getTopRetailersForProduct(id, 5),
    searchParams,
  ]);

  const isEditOpen = firstValue(resolvedSearchParams.edit) === id;
  const isStatusOpen = firstValue(resolvedSearchParams.status) === id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ProductDetailHeader product={product} />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KPICard title="Total Revenue" value={`₹${rupee.format(product.totalRevenue)}`} subtitle="All time, non-cancelled" icon={<RevenueIcon />} />
        <KPICard title="Units Sold" value={rupee.format(product.unitsSold)} subtitle="All time" icon={<BoxIcon />} />
        <KPICard title="Number of Sales" value={String(product.saleCount)} subtitle="All time" icon={<ReceiptIcon />} />
        <KPICard title="Last Sold" value={product.lastSoldDate ?? "—"} subtitle="Most recent invoice date" icon={<CalendarIcon />} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <ProductInfoPanel product={product} />
          <ProductTopRetailers retailers={topRetailers} />
        </div>
        <ProductSalesHistoryTable sales={recentSales} />
      </div>

      {isEditOpen && <ProductFormModalController editingProduct={product} />}
      {isStatusOpen && <ProductStatusDialogController product={product} />}
    </div>
  );
}
