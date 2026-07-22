/**
 * Greeting Header — docs/DASHBOARD.md §1/§2 ("readable by non-technical
 * users", "business-first"). Phase 3B: greeting + today's date only, no
 * live business metrics — those are the KPI cards below it.
 */

function getGreeting(hour: number): string {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

interface DashboardHeaderProps {
  userLabel?: string;
}

export default function DashboardHeader({ userLabel }: DashboardHeaderProps) {
  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const formattedDate = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brown-900">{greeting}</h1>
      <p className="mt-1 text-sm text-brown-600">
        Welcome back to Kandimillets Admin{userLabel ? `, ${userLabel}` : ""}.
      </p>
      <p className="mt-0.5 text-xs text-brown-400">{formattedDate}</p>
    </div>
  );
}
