import type { Metadata } from "next";
import Link from "next/link";
import AdminAuthCard from "@/components/admin/AdminAuthCard";

export const metadata: Metadata = {
  title: "Forgot Password",
};

// Placeholder page for Phase 1. The OTP + password-reset flow (email
// delivery, token verification, and the reset form itself) is implemented
// in a later phase — this route only reserves the URL and its styling.
export default function AdminForgotPasswordPage() {
  return (
    <AdminAuthCard
      title="Forgot Password"
      subtitle="Password reset via email OTP is not yet available. Please contact an existing administrator to regain access."
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
