/**
 * Recent Sales widget — docs/DASHBOARD.md §8. Async Server Component:
 * fetches via src/lib/sales/queries.ts's getRecentSales (reused,
 * unmodified read pattern), most recently *created* first. Reuses
 * PaymentStatusBadge (Sales Register) so the pill styling matches
 * exactly. Clicking a row deep-links into the Sales Register's Edit Sale
 * flow via `?sale=<id>`.
 */
import { getRecentSales } from "@/lib/sales/queries";
import PaymentStatusBadge from "@/components/admin/sales/PaymentStatusBadge";
import EmptyState from "./EmptyState";
import { ClipboardEmptyIcon } from "./icons";

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export default async function RecentSalesWidget() {
  let sales: Awaited<ReturnType<typeof getRecentSales>> | null = null;
  try {
    sales = await getRecentSales(8);
  } catch (error) {
    console.error("RecentSalesWidget failed to load:", error);
  }

  return (
    <div className="premium-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-warm-200 px-5 py-4">
        <div>
          <h3 className="font-heading text-sm font-semibold text-brown-900">Recent Sales</h3>
          <p className="mt-0.5 text-xs text-brown-500">Most recently entered, not by invoice date.</p>
        </div>
        <a href="/admin/sales" className="text-xs font-semibold text-green-700 hover:text-green-800">
          View All Sales
        </a>
      </div>

      {sales === null && (
        <EmptyState
          icon={<ClipboardEmptyIcon />}
          title="Couldn't load recent sales"
          message="Something went wrong loading this widget. Try refreshing the page."
        />
      )}

      {sales !== null && sales.length === 0 && (
        <EmptyState
          icon={<ClipboardEmptyIcon />}
          title="No sales recorded yet"
          message="Once a sale is entered in the Sales Register, it will appear here first."
          action={{ label: "Add Sale", href: "/admin/sales" }}
        />
      )}

      {sales !== null && sales.length > 0 && (
        <ul className="divide-y divide-warm-100">
          {sales.map((sale) => (
            <li key={sale.id}>
              <a
                href={`/admin/sales?sale=${sale.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3 transition-colors duration-150 hover:bg-warm-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
                title={`Open sale ${sale.saleNumber}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brown-900">{sale.invoiceNumber || sale.saleNumber}</p>
                  <p className="truncate text-xs text-brown-500">
                    {sale.retailerName} · {sale.invoiceDate}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold text-brown-900">₹{rupee.format(sale.totalAmount)}</span>
                  <PaymentStatusBadge status={sale.paymentStatus} dueDate={sale.dueDate} />
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
