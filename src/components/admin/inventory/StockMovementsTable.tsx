/**
 * Inventory Detail's Recent Stock Movements / Stock History (this task's
 * §3/§7) — the full immutable ledger for one product, most recent first.
 * Read-only by design: there is no edit/delete affordance anywhere in
 * this table, since history must never be edited.
 */
import EmptyState from "@/components/admin/dashboard/EmptyState";
import { ClipboardEmptyIcon } from "@/components/admin/dashboard/icons";
import { REASON_LABELS } from "./types";
import type { StockMovementRow } from "./types";

const numberFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

interface StockMovementsTableProps {
  movements: StockMovementRow[];
}

export default function StockMovementsTable({ movements }: StockMovementsTableProps) {
  return (
    <div className="premium-card overflow-hidden">
      <div className="border-b border-warm-200 px-5 py-4">
        <h2 className="font-heading text-sm font-semibold text-brown-900">Stock History</h2>
        <p className="mt-0.5 text-xs text-brown-500">Immutable — every movement is permanent, never edited.</p>
      </div>

      {movements.length === 0 ? (
        <EmptyState
          icon={<ClipboardEmptyIcon />}
          title="No stock movements yet"
          message="Sales and stock adjustments for this product will appear here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-warm-50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  Timestamp
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  Direction
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  Quantity
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  Reason
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  Reference
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  Balance After
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brown-500">
                  By
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {movements.map((movement) => (
                <tr key={movement.id} className="transition-colors duration-150 hover:bg-warm-50/60">
                  <td className="whitespace-nowrap px-4 py-3 text-brown-700">
                    {movement.createdAt.slice(0, 16).replace("T", " ")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        movement.direction === "IN" ? "bg-green-100 text-green-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {movement.direction === "IN" ? "+ In" : "− Out"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-brown-900">
                    {numberFmt.format(movement.quantity)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brown-700">{REASON_LABELS[movement.reason]}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-brown-500">{movement.reference ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-brown-700">{numberFmt.format(movement.balanceAfter)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-brown-500">{movement.createdByName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
