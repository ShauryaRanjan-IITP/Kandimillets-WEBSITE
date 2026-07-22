"use client";

import { useState } from "react";
import { monthName, type YearlyArchive } from "./dateFilterUtils";

interface MonthlyArchiveProps {
  archive: YearlyArchive[];
  activeYear?: number;
  activeMonth?: number;
  onSelectMonth: (year: number, month: number) => void;
}

export default function MonthlyArchive({
  archive,
  activeYear,
  activeMonth,
  onSelectMonth,
}: MonthlyArchiveProps) {
  const [collapsedYears, setCollapsedYears] = useState<Set<number>>(new Set());

  function toggleYear(year: number) {
    setCollapsedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  }

  if (archive.length === 0) {
    return (
      <div className="premium-card p-5">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-brown-500">
          Monthly Archive
        </h3>
        <p className="mt-3 text-sm text-brown-400">No sales recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="premium-card p-5">
      <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-brown-500">
        Monthly Archive
      </h3>

      <div className="mt-4 space-y-4">
        {archive.map(({ year, months, total }) => {
          const isCollapsed = collapsedYears.has(year);
          return (
            <div key={year}>
              <button
                type="button"
                onClick={() => toggleYear(year)}
                className="flex w-full items-center justify-between text-left font-heading text-base font-bold text-brown-900"
              >
                <span>{year}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs font-normal text-brown-400">{total} sales</span>
                  <svg
                    className={`h-4 w-4 text-brown-400 transition-transform duration-200 ${
                      isCollapsed ? "" : "rotate-90"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>

              {!isCollapsed && (
                <ul className="mt-2 space-y-1">
                  {months.map(({ month, count }) => {
                    const isActive = activeYear === year && activeMonth === month;
                    return (
                      <li key={month}>
                        <button
                          type="button"
                          onClick={() => onSelectMonth(year, month)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors duration-200 ${
                            isActive
                              ? "bg-green-50 font-semibold text-green-700"
                              : "text-brown-600 hover:bg-warm-100"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                            {monthName(month)}
                          </span>
                          <span className="text-xs text-brown-400">({count})</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
