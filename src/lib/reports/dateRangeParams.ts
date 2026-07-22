/**
 * Reports date-range resolution — this task's §2 "Date Range: Today /
 * This Week / This Month / This Year / Custom Range." Deliberately reuses
 * `resolveQuickDateFilter` (src/components/admin/sales/dateFilterUtils.ts)
 * rather than reintroducing a second date-math implementation — that
 * function is plain, framework-agnostic date arithmetic (no React/browser
 * API), safe to call from server-side query code despite living under a
 * "components" path. Mirrors the parse-URL-params shape already
 * established by src/lib/dashboard/dateRangeParams.ts, adapted to this
 * module's smaller key set and ISO-string (not Date-object) range shape.
 */
import { resolveQuickDateFilter } from "@/components/admin/sales/dateFilterUtils";

export type ReportDateRangeKey = "today" | "thisWeek" | "thisMonth" | "thisYear" | "custom";

const VALID_KEYS: readonly ReportDateRangeKey[] = ["today", "thisWeek", "thisMonth", "thisYear", "custom"];

export interface ReportDateRange {
  key: ReportDateRangeKey;
  /** Inclusive ISO date strings (yyyy-mm-dd), or null for "no date filter"
   * (an invalid/absent selection never happens here — see fallback below,
   * always resolves to a concrete range, defaulting to This Month). */
  from: string;
  to: string;
}

export interface ReportRangeSearchParams {
  range?: string | string[];
  from?: string | string[];
  to?: string | string[];
}

export interface ResolvedReportRange {
  range: ReportDateRange;
  invalid: boolean;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

/** Resolves raw (possibly absent/malformed) URL search params into a
 * concrete, always-valid ReportDateRange — never throws, falls back to
 * This Month, exactly matching the resilience already established by
 * src/lib/dashboard/dateRangeParams.ts's parseDashboardRangeParams. */
export function parseReportRangeParams(params: ReportRangeSearchParams): ResolvedReportRange {
  const rawKey = firstValue(params.range);
  const rawFrom = firstValue(params.from);
  const rawTo = firstValue(params.to);

  const fallback = (invalid: boolean): ResolvedReportRange => {
    const resolved = resolveQuickDateFilter("thisMonth");
    return {
      range: { key: "thisMonth", from: resolved.from!, to: resolved.to! },
      invalid,
    };
  };

  if (!rawKey) {
    return fallback(false);
  }
  if (!VALID_KEYS.includes(rawKey as ReportDateRangeKey)) {
    return fallback(true);
  }
  const key = rawKey as ReportDateRangeKey;

  if (key === "custom") {
    if (!rawFrom || !rawTo || !isValidIsoDate(rawFrom) || !isValidIsoDate(rawTo) || rawFrom > rawTo) {
      return fallback(true);
    }
    return { range: { key: "custom", from: rawFrom, to: rawTo }, invalid: false };
  }

  const resolved = resolveQuickDateFilter(key);
  if (!resolved.from || !resolved.to) {
    return fallback(true);
  }
  return { range: { key, from: resolved.from, to: resolved.to }, invalid: false };
}
