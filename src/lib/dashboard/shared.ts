/**
 * Shared filter fragments and helpers for the dashboard query layer — see
 * docs/DASHBOARD.md Appendix A/B. Isolated here so kpiQueries.ts and
 * chartQueries.ts don't each redefine "what counts as revenue."
 */
import type { Prisma } from "@/generated/prisma/client";

/** Every dashboard query excludes voided rows — a voided sale is a
 * corrected data-entry error, never real business activity. */
export const NOT_VOIDED = { isVoided: false } as const;

/** Revenue-bearing queries additionally exclude CANCELLED sales — a
 * cancelled sale's obligation was written off, not collected or owed.
 * See docs/DASHBOARD.md §4 (Today's/This Month Revenue) and §8's
 * PaymentStatus notes in docs/SALES_REGISTER.md §3. */
export const REVENUE_WHERE: Prisma.SaleWhereInput = {
  isVoided: false,
  paymentStatus: { not: "CANCELLED" },
};

export function decimalToNumber(value: Prisma.Decimal | null | undefined): number {
  return value ? value.toNumber() : 0;
}
