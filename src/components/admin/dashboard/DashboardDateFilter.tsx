"use client";

/**
 * Global Date Filter — docs/DASHBOARD.md §6. Phase 3B: UI only. Selecting
 * a preset updates local state so the control is fully interactive to
 * look at and use, but nothing downstream re-queries yet — no KPI/chart/
 * widget in this phase reads this value. Wiring every date-aware widget
 * to this selection is Phase 3C, per docs/DASHBOARD.md §18.
 */
import { useId, useState } from "react";
import { DASHBOARD_DATE_RANGE_OPTIONS, DEFAULT_DASHBOARD_DATE_SELECTION } from "./types";
import type { DashboardDateSelection } from "./types";
import { CalendarIcon } from "./icons";

interface DashboardDateFilterProps {
  value?: DashboardDateSelection;
  onChange?: (selection: DashboardDateSelection) => void;
}

const selectClass =
  "rounded-xl border border-warm-300 bg-warm-50 py-2.5 pl-9 pr-8 text-sm font-medium text-brown-900 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30";

export default function DashboardDateFilter({ value, onChange }: DashboardDateFilterProps) {
  const [internal, setInternal] = useState<DashboardDateSelection>(DEFAULT_DASHBOARD_DATE_SELECTION);
  const selection = value ?? internal;
  const selectId = useId();
  const fromId = useId();
  const toId = useId();

  function update(next: DashboardDateSelection) {
    if (onChange) onChange(next);
    else setInternal(next);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <label htmlFor={selectId} className="sr-only">
          Date range
        </label>
        <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400" />
        <select
          id={selectId}
          value={selection.key}
          onChange={(e) =>
            update({ ...selection, key: e.target.value as DashboardDateSelection["key"] })
          }
          className={selectClass}
        >
          {DASHBOARD_DATE_RANGE_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {selection.key === "custom" && (
        <div className="flex items-center gap-2">
          <label htmlFor={fromId} className="sr-only">
            From date
          </label>
          <input
            id={fromId}
            type="date"
            value={selection.customFrom ?? ""}
            onChange={(e) => update({ ...selection, customFrom: e.target.value || null })}
            className="rounded-xl border border-warm-300 bg-warm-50 px-3 py-2.5 text-sm text-brown-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30"
          />
          <span className="text-xs text-brown-400">to</span>
          <label htmlFor={toId} className="sr-only">
            To date
          </label>
          <input
            id={toId}
            type="date"
            value={selection.customTo ?? ""}
            onChange={(e) => update({ ...selection, customTo: e.target.value || null })}
            className="rounded-xl border border-warm-300 bg-warm-50 px-3 py-2.5 text-sm text-brown-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30"
          />
        </div>
      )}
    </div>
  );
}
