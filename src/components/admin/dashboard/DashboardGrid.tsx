/**
 * Shared responsive grid wrapper so KPICardsSection and ChartsSection
 * don't each redefine the same breakpoint classes — docs/DASHBOARD.md §14.
 */

interface DashboardGridProps {
  variant: "kpi" | "charts" | "widgets";
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<DashboardGridProps["variant"], string> = {
  kpi: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8",
  charts: "grid grid-cols-1 gap-6 lg:grid-cols-2",
  widgets: "grid grid-cols-1 gap-6 xl:grid-cols-2",
};

export default function DashboardGrid({ variant, children }: DashboardGridProps) {
  return <div className={VARIANT_CLASSES[variant]}>{children}</div>;
}
