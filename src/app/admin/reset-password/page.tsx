import type { Metadata } from "next";
import Link from "next/link";
import AdminAuthCard from "@/components/admin/AdminAuthCard";

export const metadata: Metadata = {
  title: "Reset Password",
};

// Placeholder page for Phase 1. The reset-token verification and new
// password submission flow is implemented in a later phase — this route
// only reserves the URL and its styling.
export default function AdminResetPasswordPage() {
  return (
    <AdminAuthCard
      title="Reset Password"
      subtitle="Password reset is not yet available."
      footer={
        <Link href="/admin/login" className="font-medium text-green-600 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-brown-700">
        This feature is coming soon.
      </div>
    </AdminAuthCard>
  );
}
