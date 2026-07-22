/**
 * Generic, reusable empty state — used by every dashboard widget/chart
 * that can legitimately have nothing to show (docs/DASHBOARD.md §11).
 * One component with a `tone` prop, rather than five hand-duplicated
 * empty-state blocks, per the Phase 3B component-structure instruction to
 * avoid duplication.
 */

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  /** "positive" is used for a genuinely good empty state (e.g. "nothing
   * outstanding") — styled calmly, never with the same visual weight as a
   * missing-data gap. Matches docs/DASHBOARD.md §11. */
  tone?: "neutral" | "positive";
  action?: { label: string; href: string };
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<EmptyStateProps["tone"]>, string> = {
  neutral: "bg-warm-100 text-brown-400",
  positive: "bg-green-50 text-green-600",
};

export default function EmptyState({
  icon,
  title,
  message,
  tone = "neutral",
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}>
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${TONE_CLASSES[tone]}`}>
        {icon}
      </div>
      <h3 className="mt-4 font-heading text-base font-semibold text-brown-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-brown-500">{message}</p>
      {action && (
        <a
          href={action.href}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
