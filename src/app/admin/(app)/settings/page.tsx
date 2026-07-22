import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth/session";
import { getBusinessSettings } from "@/lib/settings/queries";
import BusinessSettingsForm from "@/components/admin/settings/BusinessSettingsForm";

export const metadata: Metadata = {
  title: "Business Settings",
};

// Business Settings module — this task's §2. Server Component: the
// settings row is fetched here and handed to the one client form; the
// mutation itself is a Server Action (./actions.ts). Session is
// re-verified here as defense-in-depth, matching every other admin page.
export default async function AdminSettingsPage() {
  await requireAdminSession();

  const settings = await getBusinessSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-warm-200 pb-6">
        <h1 className="font-heading text-2xl font-bold text-brown-900">Business Settings</h1>
        <p className="mt-1 text-sm text-brown-600">
          Configured values used across invoices, inventory defaults, and business identity.
        </p>
      </header>

      <div className="mt-8">
        <BusinessSettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
