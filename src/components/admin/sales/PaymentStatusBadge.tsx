import type { PaymentStatus } from "./types";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  dueDate: string;
}

const STATUS_STYLES: Record<PaymentStatus, string> = {
  PAID: "bg-green-100 text-green-700",
  PARTIAL: "bg-gold-100 text-brown-700",
  PENDING: "bg-warm-200 text-brown-600",
  CANCELLED: "bg-brown-100 text-brown-500",
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  PAID: "Paid",
  PARTIAL: "Partial",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
};

// "Overdue" is never stored — it's a UI-computed display state (a sale
// that is PENDING/PARTIAL whose Due Date has passed). See
// docs/SALES_REGISTER.md §3 and §5.
function isOverdue(status: PaymentStatus, dueDate: string): boolean {
  if (status !== "PENDING" && status !== "PARTIAL") return false;
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today;
}

export default function PaymentStatusBadge({ status, dueDate }: PaymentStatusBadgeProps) {
  const overdue = isOverdue(status, dueDate);
  const className = overdue ? "bg-red-50 text-red-700" : STATUS_STYLES[status];
  const label = overdue ? `${STATUS_LABELS[status]} · Overdue` : STATUS_LABELS[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
