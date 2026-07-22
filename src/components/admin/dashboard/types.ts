/**
 * Dashboard UI types.
 *
 * `DashboardDateRangeKey` intentionally re-exports the server-side type
 * already defined in src/lib/dashboard/dateRange.ts (Phase 3A) as a
 * type-only import — the two must always agree on the same 8 presets, but
 * this file must never pull server/Prisma code into the client bundle.
 */
import type { DashboardDateRangeKey } from "@/lib/dashboard/dateRange";

export type { DashboardDateRangeKey };

export interface DashboardDateRangeOption {
  key: DashboardDateRangeKey;
  label: string;
}

export const DASHBOARD_DATE_RANGE_OPTIONS: DashboardDateRangeOption[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7Days", label: "Last 7 Days" },
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "thisQuarter", label: "This Quarter" },
  { key: "thisYear", label: "This Year" },
  { key: "custom", label: "Custom Range" },
];

/** UI-only selection state for the Global Date Filter (docs/DASHBOARD.md
 * §6). Not yet wired to any query — see the module doc comment in
 * DashboardDateFilter.tsx. */
export interface DashboardDateSelection {
  key: DashboardDateRangeKey;
  customFrom: string | null;
  customTo: string | null;
}

export const DEFAULT_DASHBOARD_DATE_SELECTION: DashboardDateSelection = {
  key: "thisMonth",
  customFrom: null,
  customTo: null,
};
