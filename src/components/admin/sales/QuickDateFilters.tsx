import type { DateFilterState, QuickDateFilterKey } from "./types";

interface QuickDateFiltersProps {
  activeKey: DateFilterState["key"];
  onSelect: (key: QuickDateFilterKey) => void;
  onCustomClick: () => void;
}

const PRESETS: Array<{ key: QuickDateFilterKey; label: string }> = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "thisWeek", label: "This Week" },
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "thisYear", label: "This Year" },
];

export default function QuickDateFilters({ activeKey, onSelect, onCustomClick }: QuickDateFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => {
        const isActive = activeKey === preset.key;
        return (
          <button
            key={preset.key}
            type="button"
            onClick={() => onSelect(preset.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 ${
              isActive
                ? "bg-green-600 text-white shadow-sm"
                : "bg-warm-100 text-brown-600 hover:bg-warm-200"
            }`}
          >
            {preset.label}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onCustomClick}
        className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 ${
          activeKey === "custom"
            ? "bg-green-600 text-white shadow-sm"
            : "bg-warm-100 text-brown-600 hover:bg-warm-200"
        }`}
      >
        Custom
      </button>
    </div>
  );
}
