import type { Metadata } from "next";
import Link from "next/link";
import AdminAuthCard from "@/components/admin/AdminAuthCard";
import ForgotPasswordForm from "@/components/admin/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
};

// Password Recovery (Authentication Hardening task, §2) — replaces the
// earlier Phase 1 placeholder. Reuses Better Auth's own reset-password
// flow (src/lib/auth/auth.ts) rather than custom token logic.
export default function AdminForgotPasswordPage() {
  return (
    <AdminAuthCard
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a link to reset your password."
      footer={
        <Link href="/admin/login" className="font-medium text-green-600 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AdminAuthCard>
  );
}
