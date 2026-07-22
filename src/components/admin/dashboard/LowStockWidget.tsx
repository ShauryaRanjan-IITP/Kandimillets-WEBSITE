/**
 * Low Stock widget — this task's §6 "Dashboard should expose products
 * below threshold." Async Server Component, same shape as
 * PendingPaymentsWidget.tsx: fetches via src/lib/inventory/queries.ts's
 * getLowStockProducts (reused, unmodified read pattern), then renders
 * live rows. Clicking a row deep-links into the Inventory Detail page.
 */
import Link from "next/link";
import { getLowStockProducts } from "@/lib/inventory/queries";
import EmptyState from "./EmptyState";
import { CheckCircleIcon } from "./icons";

const numberFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

export default async function LowStockWidget() {
  let products: Awaited<ReturnType<typeof getLowStockProducts>> | null = null;
  try {
    products = await getLowStockProducts(10);
  } catch (error) {
    console.error("LowStockWidget failed to load:", error);
  }

  return (
    <div className="premium-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-warm-200 px-5 py-4">
        <div>
          <h3 className="font-heading text-sm font-semibold text-brown-900">Low Stock</h3>
          <p className="mt-0.5 text-xs text-brown-500">Active products at or below their threshold.</p>
        </div>
        <Link href="/admin/inventory" className="text-xs font-semibold text-green-700 hover:text-green-800">
          View Inventory
        </Link>
      </div>

      {products === null && (
        <EmptyState
          icon={<CheckCircleIcon />}
          title="Couldn't load low stock products"
          message="Something went wrong loading this widget. Try refreshing the page."
        />
      )}

      {products !== null && products.length === 0 && (
        <EmptyState
          icon={<CheckCircleIcon />}
          title="Nothing running low"
          message="Every active product with a threshold set is above it. Low-stock products will appear here."
          tone="positive"
        />
      )}

      {products !== null && products.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-warm-50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  Product
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  Current Stock
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  Threshold
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {products.map((product) => (
                <tr key={product.id} className="group transition-colors duration-150 hover:bg-warm-50/60">
                  <td className="whitespace-nowrap p-0">
                    <Link
                      href={`/admin/inventory/${product.id}`}
                      className="block px-4 py-3 font-medium text-brown-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brown-700">
                    {numberFmt.format(product.currentStock)} {product.unit}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brown-700">
                    {product.lowStockThreshold !== null ? numberFmt.format(product.lowStockThreshold) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        product.stockStatus === "OUT_OF_STOCK" ? "bg-red-50 text-red-700" : "bg-gold-100 text-brown-700"
                      }`}
                    >
                      {product.stockStatus === "OUT_OF_STOCK" ? "Out of Stock" : "Low Stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
