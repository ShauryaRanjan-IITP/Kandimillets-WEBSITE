import type { DateFilterState, QuickDateFilterKey, SaleRow } from "./types";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay(); // 0 = Sunday
  result.setDate(result.getDate() - day);
  return result;
}

/** Resolves a quick-filter key to a concrete {from, to} range, anchored to "now". */
export function resolveQuickDateFilter(key: QuickDateFilterKey): DateFilterState {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (key) {
    case "today":
      return { key, from: toIso(today), to: toIso(today) };
    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { key, from: toIso(yesterday), to: toIso(yesterday) };
    }
    case "thisWeek": {
      const start = startOfWeek(today);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { key, from: toIso(start), to: toIso(end) };
    }
    case "thisMonth": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { key, from: toIso(start), to: toIso(end) };
    }
    case "lastMonth": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { key, from: toIso(start), to: toIso(end) };
    }
    case "thisYear": {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      return { key, from: toIso(start), to: toIso(end) };
    }
    default:
      return { key: "none", from: null, to: null };
  }
}

export function dateFilterForYear(year: number): DateFilterState {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  return {
    key: "archiveMonth",
    from: toIso(start),
    to: toIso(end),
    archiveYear: year,
    archiveMonth: undefined,
  };
}

export function dateFilterForArchiveMonth(year: number, month: number): DateFilterState {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    key: "archiveMonth",
    from: toIso(start),
    to: toIso(end),
    archiveYear: year,
    archiveMonth: month,
  };
}

export function filterRowsByDate(rows: SaleRow[], filter: DateFilterState): SaleRow[] {
  if (!filter.from && !filter.to) return rows;
  return rows.filter((row) => {
    if (filter.from && row.invoiceDate < filter.from) return false;
    if (filter.to && row.invoiceDate > filter.to) return false;
    return true;
  });
}

export interface MonthlyArchiveEntry {
  year: number;
  month: number;
  count: number;
}

export interface YearlyArchive {
  year: number;
  months: MonthlyArchiveEntry[];
  total: number;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function monthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month);
}

/** Groups all rows (independent of any active filter) by year/month for the archive browser. */
export function buildMonthlyArchive(rows: SaleRow[]): YearlyArchive[] {
  const byYear = new Map<number, Map<number, number>>();

  for (const row of rows) {
    const [yearStr, monthStr] = row.invoiceDate.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    if (!byYear.has(year)) byYear.set(year, new Map());
    const monthMap = byYear.get(year)!;
    monthMap.set(month, (monthMap.get(month) ?? 0) + 1);
  }

  return Array.from(byYear.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, monthMap]) => {
      const months = Array.from(monthMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([month, count]) => ({ year, month, count }));
      const total = months.reduce((sum, m) => sum + m.count, 0);
      return { year, months, total };
    });
}
