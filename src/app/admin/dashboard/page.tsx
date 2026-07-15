import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import LogoutButton from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
  title: "Dashboard",
};

// Phase 1 scope: authentication foundation only. This page intentionally
// contains no dashboard widgets, sales data, or analytics — those are
// implemented in later phases. Session is re-verified here (in addition
// to middleware) as defense-in-depth per the agreed architecture.
export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between border-b border-warm-200 pb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brown-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-brown-600">
            Signed in as {session.user.email}
          </p>
        </div>
        <LogoutButton />
      </header>

      <div className="premium-card mt-8 p-8 text-center">
        <p className="text-brown-600">
          The admin authentication foundation is live. Dashboard widgets,
          sales analytics, and reporting will be added in later phases.
        </p>
      </div>
    </div>
  );
}
