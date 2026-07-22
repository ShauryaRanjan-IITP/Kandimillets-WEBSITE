/**
 * Suspense fallback for KPICardsSection — docs/DASHBOARD.md §12. Shown
 * while the 8 KPI queries resolve, both on first page load and whenever
 * the Global Date Filter changes and Next re-fetches this boundary.
 * Reuses KPICard's own `loading` rendering rather than a second,
 * duplicated skeleton markup.
 */
import DashboardGrid from "./DashboardGrid";
import KPICard from "./KPICard";

const KPI_TITLES = [
  "Today's Revenue",
  "This Month Revenue",
  "Outstanding Amount",
  "Pending Payments",
  "Retailers",
  "Products Sold",
  "Sales This Month",
  "Cancelled Sales",
];

export default function KPICardsSectionSkeleton() {
  return (
    <section aria-labelledby="dashboard-kpi-heading">
      <h2 id="dashboard-kpi-heading" className="sr-only">
        Key business metrics
      </h2>
      <DashboardGrid variant="kpi">
        {KPI_TITLES.map((title) => (
          <KPICard key={title} title={title} value="" subtitle="" icon={null} loading />
        ))}
      </DashboardGrid>
    </section>
  );
}
