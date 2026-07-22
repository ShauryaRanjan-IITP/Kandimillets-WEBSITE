/**
 * Product Detail's "Top Retailers" summary (this task's "Product Detail
 * Page" §6) — a small ranked list, matching the "small ranked list, not a
 * chart" treatment already used for the Dashboard's own Top Retailers tile
 * (docs/DASHBOARD.md §8/docs/SALES_REGISTER.md §8).
 */
import EmptyState from "@/components/admin/dashboard/EmptyState";
import { StoreIcon } from "@/components/admin/dashboard/icons";
import type { TopRetailer } from "@/lib/products/dto";

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

interface ProductTopRetailersProps {
  retailers: TopRetailer[];
}

export default function ProductTopRetailers({ retailers }: ProductTopRetailersProps) {
  return (
    <div className="premium-card p-5">
      <h2 className="font-heading text-sm font-semibold text-brown-900">Top Retailers</h2>
      {retailers.length === 0 ? (
        <EmptyState
          icon={<StoreIcon className="h-6 w-6" />}
          title="No sales yet"
          message="Top retailers for this product will appear here once sales are recorded."
          className="px-0 py-6"
        />
      ) : (
        <ol className="mt-4 space-y-3">
          {retailers.map((retailer, index) => (
            <li key={retailer.retailerId} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warm-100 text-xs font-semibold text-brown-600">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-brown-800">{retailer.retailerName}</span>
              </div>
              <span className="text-sm font-semibold text-brown-900">₹{rupee.format(retailer.totalRevenue)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
