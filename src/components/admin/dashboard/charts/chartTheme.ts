/**
 * Shared Recharts styling — references the existing theme tokens from
 * globals.css via CSS var() so no new colors are introduced (ARCHITECTURE.md
 * §7/§8: "change tokens in globals.css", not in component code).
 */
import type { PaymentStatus } from "@/generated/prisma/enums";

export const AXIS_TICK_STYLE = { fill: "var(--color-brown-500)", fontSize: 12 };
export const GRID_STROKE = "var(--color-warm-300)";

export const TOOLTIP_CONTENT_STYLE: React.CSSProperties = {
  borderRadius: "0.75rem",
  border: "1px solid var(--color-warm-300)",
  backgroundColor: "#ffffff",
  fontSize: "0.8rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

export const TOOLTIP_LABEL_STYLE: React.CSSProperties = {
  color: "var(--color-brown-900)",
  fontWeight: 600,
  marginBottom: "0.25rem",
};

/** Matches PaymentStatusBadge.tsx's exact palette so the chart and the
 * table pills read as the same visual language (docs/DASHBOARD.md §5). */
export const STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: "var(--color-brown-300)",
  PARTIAL: "var(--color-gold-500)",
  PAID: "var(--color-green-600)",
  CANCELLED: "var(--color-brown-700)",
};

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PARTIAL: "Partial",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};
