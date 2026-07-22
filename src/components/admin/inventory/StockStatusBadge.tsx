/** In Stock / Low Stock / Out of Stock pill — same rounded-full, tinted
 * convention as RetailerStatusBadge.tsx / PaymentStatusBadge.tsx, applied
 * to the UI-computed stock-health domain (this task's §6 "Display warning
 * badges in Inventory"). */
import type { StockStatus } from "./types";

interface StockStatusBadgeProps {
  status: StockStatus;
}

const STYLES: Record<StockStatus, string> = {
  IN_STOCK: "bg-green-100 text-green-700",
  LOW_STOCK: "bg-gold-100 text-brown-700",
  OUT_OF_STOCK: "bg-red-50 text-red-700",
};

const LABELS: Record<StockStatus, string> = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
};

export default function StockStatusBadge({ status }: StockStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
