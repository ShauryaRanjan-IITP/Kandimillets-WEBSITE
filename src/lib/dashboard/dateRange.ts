/**
 * Global Date Filter resolution — see docs/DASHBOARD.md §6. Server-side,
 * Date-based (not the ISO-string, client-side dateFilterUtils.ts used by
 * the Sales Register UI at src/components/admin/sales/dateFilterUtils.ts)
 * because this module resolves ranges directly into Prisma query bounds,
 * never into rendered UI state.
 */

export type DashboardDateRangeKey =
  | "today"
  | "yesterday"
  | "last7Days"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "thisYear"
  | "custom";

export interface DashboardDateRange {
  key: DashboardDateRangeKey;
  /** Inclusive, UTC midnight. */
  from: Date;
  /** Inclusive, UTC midnight. */
  to: Date;
}

function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

/**
 * Resolves a Global Date Filter preset (docs/DASHBOARD.md §6) to a concrete
 * inclusive {from, to} range. `custom` is required, and used as-is, when
 * `key === "custom"`.
 */
export function resolveDashboardDateRange(
  key: DashboardDateRangeKey,
  custom?: { from: Date; to: Date }
): DashboardDateRange {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();

  switch (key) {
    case "today":
      return { key, from: utcDate(y, m, d), to: utcDate(y, m, d) };
    case "yesterday":
      return { key, from: utcDate(y, m, d - 1), to: utcDate(y, m, d - 1) };
    case "last7Days":
      return { key, from: utcDate(y, m, d - 6), to: utcDate(y, m, d) };
    case "thisMonth":
      // Calendar-month-to-date, per docs/DASHBOARD.md §6.
      return { key, from: utcDate(y, m, 1), to: utcDate(y, m, d) };
    case "lastMonth":
      return { key, from: utcDate(y, m - 1, 1), to: utcDate(y, m, 0) };
    case "thisQuarter": {
      const quarterStartMonth = Math.floor(m / 3) * 3;
      return { key, from: utcDate(y, quarterStartMonth, 1), to: utcDate(y, m, d) };
    }
    case "thisYear":
      return { key, from: utcDate(y, 0, 1), to: utcDate(y, m, d) };
    case "custom":
      if (!custom) {
        throw new Error('resolveDashboardDateRange("custom", ...) requires a custom {from, to} range.');
      }
      return { key, from: custom.from, to: custom.to };
    default:
      throw new Error(`Unknown DashboardDateRangeKey: ${String(key)}`);
  }
}

/** The default range the dashboard loads with — see docs/DASHBOARD.md §6. */
export function defaultDashboardDateRange(): DashboardDateRange {
  return resolveDashboardDateRange("thisMonth");
}
