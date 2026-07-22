/**
 * URL search-param parsing/validation for the Global Date Filter
 * (docs/DASHBOARD.md §6) — glue code only. Delegates the actual range
 * resolution to `resolveDashboardDateRange` (src/lib/dashboard/dateRange.ts,
 * Phase 3A, unmodified) rather than duplicating any date-math/aggregation
 * logic here.
 */
import { resolveDashboardDateRange } from "./dateRange";
import type { DashboardDateRange, DashboardDateRangeKey } from "./dateRange";

const VALID_KEYS: readonly DashboardDateRangeKey[] = [
  "today",
  "yesterday",
  "last7Days",
  "thisMonth",
  "lastMonth",
  "thisQuarter",
  "thisYear",
  "custom",
];

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

export interface DashboardRangeSearchParams {
  range?: string | string[];
  from?: string | string[];
  to?: string | string[];
}

export interface ResolvedDashboardRange {
  range: DashboardDateRange;
  /** True when the raw searchParams described an invalid selection and a
   * default range (This Month) was substituted — used to show the
   * "Invalid date range" notice per docs/DASHBOARD.md §13. */
  invalid: boolean;
  /** The key/from/to actually applied — used to keep the Global Date
   * Filter's displayed selection in sync with what was really resolved. */
  appliedKey: DashboardDateRangeKey;
  appliedFrom: string | null;
  appliedTo: string | null;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Resolves raw (possibly absent/malformed) URL search params into a
 * concrete, always-valid DashboardDateRange. Never throws — an invalid or
 * missing selection falls back to the documented default (This Month). */
export function parseDashboardRangeParams(params: DashboardRangeSearchParams): ResolvedDashboardRange {
  const rawKey = firstValue(params.range);
  const rawFrom = firstValue(params.from);
  const rawTo = firstValue(params.to);

  const fallback = (invalid: boolean): ResolvedDashboardRange => ({
    range: resolveDashboardDateRange("thisMonth"),
    invalid,
    appliedKey: "thisMonth",
    appliedFrom: null,
    appliedTo: null,
  });

  if (!rawKey) {
    // No selection in the URL at all is the normal first-load case, not
    // an error — nothing to warn about.
    return fallback(false);
  }

  if (!VALID_KEYS.includes(rawKey as DashboardDateRangeKey)) {
    return fallback(true);
  }

  const key = rawKey as DashboardDateRangeKey;

  if (key === "custom") {
    if (!rawFrom || !rawTo || !isValidIsoDate(rawFrom) || !isValidIsoDate(rawTo) || rawFrom > rawTo) {
      return fallback(true);
    }
    const from = new Date(`${rawFrom}T00:00:00.000Z`);
    const to = new Date(`${rawTo}T00:00:00.000Z`);
    return {
      range: resolveDashboardDateRange("custom", { from, to }),
      invalid: false,
      appliedKey: "custom",
      appliedFrom: rawFrom,
      appliedTo: rawTo,
    };
  }

  return {
    range: resolveDashboardDateRange(key),
    invalid: false,
    appliedKey: key,
    appliedFrom: null,
    appliedTo: null,
  };
}
