import type { Metadata } from "next";
import Link from "next/link";
import AdminAuthCard from "@/components/admin/AdminAuthCard";
import ResetPasswordForm from "@/components/admin/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
};

interface AdminResetPasswordPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const BACK_TO_LOGIN = (
  <Link href="/admin/login" className="font-medium text-green-600 hover:underline">
    Back to sign in
  </Link>
);

// Password Recovery (Authentication Hardening task, §2) — replaces the
// earlier Phase 1 placeholder. Reached via the link emailed by Better
// Auth's own reset-password flow, which lands here as either
// `?token=<valid token>` or `?error=INVALID_TOKEN` (already resolved —
// see src/lib/auth/auth.ts's `sendResetPassword` — this page never has
// to validate the token itself, only render based on what Better Auth's
// own callback already decided).
export default async function AdminResetPasswordPage({ searchParams }: AdminResetPasswordPageProps) {
  const params = await searchParams;
  const token = firstValue(params.token);
  const tokenError = firstValue(params.error);

  if (tokenError || !token) {
    return (
      <AdminAuthCard title="Reset Password" subtitle="This link is invalid or has expired." footer={BACK_TO_LOGIN}>
        <div className="space-y-4">
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            The password reset link you used is no longer valid. Links expire after a period of time and can only
            be used once.
          </div>
          <Link
            href="/admin/forgot-password"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg"
          >
            Request a New Link
          </Link>
        </div>
      </AdminAuthCard>
    );
  }

  return (
    <AdminAuthCard title="Reset Password" subtitle="Choose a new password for your account." footer={BACK_TO_LOGIN}>
      <ResetPasswordForm token={token} />
    </AdminAuthCard>
  );
}
