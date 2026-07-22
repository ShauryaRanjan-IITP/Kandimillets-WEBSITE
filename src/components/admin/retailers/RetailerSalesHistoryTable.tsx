/**
 * Retailer Detail's Recent Sales table — this task's "Retailer Details"
 * §6. Clicking a row opens the existing Sales Register Edit flow via the
 * same `?sale=<id>` deep-link the Admin Dashboard's widgets already use
 * (src/components/admin/sales/SalesRegisterView.tsx) — no new sale
 * detail view is built here.
 */
import Link from "next/link";
import PaymentStatusBadge from "@/components/admin/sales/PaymentStatusBadge";
import EmptyState from "@/components/admin/dashboard/EmptyState";
import { ClipboardEmptyIcon } from "@/components/admin/dashboard/icons";
import type { SaleDTO } from "@/lib/sales/dto";

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

interface RetailerSalesHistoryTableProps {
  sales: SaleDTO[];
}

export default function RetailerSalesHistoryTable({ sales }: RetailerSalesHistoryTableProps) {
  return (
    <div className="premium-card overflow-hidden">
      <div className="border-b border-warm-200 px-5 py-4">
        <h2 className="font-heading text-sm font-semibold text-brown-900">Recent Sales</h2>
      </div>

      {sales.length === 0 ? (
        <EmptyState
          icon={<ClipboardEmptyIcon />}
          title="No sales recorded yet"
          message="Once a sale is entered for this retailer, it will appear here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-warm-50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  Invoice
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  Date
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  Amount
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  Status
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  Outstanding
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {sales.map((sale) => (
                <tr key={sale.id} className="transition-colors duration-150 hover:bg-warm-50/60">
                  <td className="whitespace-nowrap p-0">
                    <Link
                      href={`/admin/sales?sale=${sale.id}`}
                      className="block px-4 py-3 font-medium text-brown-900 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
                    >
                      {sale.invoiceNumber || sale.saleNumber}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brown-700">{sale.invoiceDate}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-brown-900">
                    ₹{rupee.format(sale.totalAmount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <PaymentStatusBadge status={sale.paymentStatus} dueDate={sale.dueDate} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brown-700">
                    ₹{rupee.format(sale.outstandingAmount)}
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
