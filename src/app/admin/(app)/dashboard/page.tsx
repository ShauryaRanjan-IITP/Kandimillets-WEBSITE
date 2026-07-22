import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth/session";
import { parseDashboardRangeParams } from "@/lib/dashboard/dateRangeParams";
import DashboardView from "@/components/admin/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
};

interface AdminDashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Final Dashboard implementation phase — see docs/DASHBOARD.md. Every
// section (KPI cards, all 5 charts, Pending Payments, Recent Sales,
// Recent Activity) is live; DashboardView owns the per-section Suspense
// composition. The selected range lives in the URL (`?range=...&from=
// ...&to=...`), per docs/DASHBOARD.md §6/§15 — resolved here via
// src/lib/dashboard/dateRangeParams.ts (unmodified query layer
// underneath). Session is re-verified here (in addition to the proxy) as
// defense-in-depth, matching the existing pattern on /admin/sales.
export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const session = await requireAdminSession();

  const resolvedSearchParams = await searchParams;
  const { range, invalid, appliedKey, appliedFrom, appliedTo } = parseDashboardRangeParams(resolvedSearchParams);

  return (
    <DashboardView
      userLabel={session.user.name || session.user.email}
      initialSelection={{ key: appliedKey, customFrom: appliedFrom, customTo: appliedTo }}
      dateRangeInvalid={invalid}
      range={range}
    />
  );
}
