/**
 * Pending Payments widget — docs/DASHBOARD.md §7. Async Server Component:
 * fetches via src/lib/sales/queries.ts's getPendingPaymentSales (reused,
 * unmodified read pattern — see that file), then renders live rows.
 * Clicking a row deep-links into the Sales Register's existing Edit Sale
 * flow (SalesRegisterView recognizes `?sale=<id>` — see that component).
 */
import { getPendingPaymentSales } from "@/lib/sales/queries";
import EmptyState from "./EmptyState";
import { CheckCircleIcon, SortIndicatorIcon } from "./icons";

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

function isOverdue(dueDate: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}

function ColumnHeader({ label, sortable = false }: { label: string; sortable?: boolean }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brown-500">
        {label}
        {sortable && <SortIndicatorIcon className="h-3.5 w-3.5 text-brown-300" />}
      </span>
    </th>
  );
}

export default async function PendingPaymentsWidget() {
  let sales: Awaited<ReturnType<typeof getPendingPaymentSales>> | null = null;
  try {
    sales = await getPendingPaymentSales(10);
  } catch (error) {
    console.error("PendingPaymentsWidget failed to load:", error);
  }

  return (
    <div className="premium-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-warm-200 px-5 py-4">
        <div>
          <h3 className="font-heading text-sm font-semibold text-brown-900">Pending Payments</h3>
          <p className="mt-0.5 text-xs text-brown-500">Sorted by due date — most urgent first.</p>
        </div>
        <a href="/admin/sales" className="text-xs font-semibold text-green-700 hover:text-green-800">
          View All Pending
        </a>
      </div>

      {sales === null && (
        <EmptyState
          icon={<CheckCircleIcon />}
          title="Couldn't load pending payments"
          message="Something went wrong loading this widget. Try refreshing the page."
        />
      )}

      {sales !== null && sales.length === 0 && (
        <EmptyState
          icon={<CheckCircleIcon />}
          title="Nothing outstanding — fully collected"
          message="Every recorded sale is fully paid. New pending or partial payments will appear here."
          tone="positive"
        />
      )}

      {sales !== null && sales.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-warm-50">
              <tr>
                <ColumnHeader label="Invoice #" />
                <ColumnHeader label="Retailer" />
                <ColumnHeader label="Due Date" sortable />
                <ColumnHeader label="Outstanding" sortable />
                <ColumnHeader label="Status" />
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {sales.map((sale) => {
                const overdue = isOverdue(sale.dueDate);
                return (
                  <tr key={sale.id} className="group transition-colors duration-150 hover:bg-warm-50/60">
                    <td className="whitespace-nowrap p-0">
                      <a
                        href={`/admin/sales?sale=${sale.id}`}
                        className="block px-4 py-3 font-medium text-brown-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
                        title={`Open sale ${sale.saleNumber}`}
                      >
                        {sale.invoiceNumber || sale.saleNumber}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-brown-700">{sale.retailerName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-brown-700">{sale.dueDate}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-brown-900">
                      ₹{rupee.format(sale.outstandingAmount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          overdue
                            ? "bg-red-50 text-red-700"
                            : sale.paymentStatus === "PARTIAL"
                              ? "bg-gold-100 text-brown-700"
                              : "bg-warm-200 text-brown-600"
                        }`}
                      >
                        {overdue
                          ? `${sale.paymentStatus === "PARTIAL" ? "Partial" : "Pending"} · Overdue`
                          : sale.paymentStatus === "PARTIAL"
                            ? "Partial"
                            : "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
