import type { Metadata } from "next";
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
    >
      <LoginForm />
    </AdminAuthCard>
  );
}
