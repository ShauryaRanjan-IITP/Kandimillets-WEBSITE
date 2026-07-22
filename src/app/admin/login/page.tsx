import type { Metadata } from "next";
import Link from "next/link";
import AdminAuthCard from "@/components/admin/AdminAuthCard";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function AdminLoginPage() {
  return (
    <AdminAuthCard
      title="Sign In"
      subtitle="Access the Kandimillets admin portal."
      footer={
        <Link href="/" className="inline-flex items-center gap-1.5 text-brown-500 hover:text-brown-700">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Website
        </Link>
      }
    >
      <LoginForm />
    </AdminAuthCard>
  );
}
