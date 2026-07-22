import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/users/queries";
import RoleBadge from "@/components/admin/users/RoleBadge";
import ProfileForm from "@/components/admin/profile/ProfileForm";
import ChangePasswordForm from "@/components/admin/profile/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Profile",
};

// Profile module — this task's §4. Every authenticated user (Super Admin
// or Admin alike) can view/update their own account here, independent of
// the SUPER_ADMIN-only User Management module.
export default async function AdminProfilePage() {
  const session = await requireAdminSession();

  const user = await getUserById(session.user.id);
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-warm-200 pb-6">
        <h1 className="font-heading text-2xl font-bold text-brown-900">Profile</h1>
        <p className="mt-1 text-sm text-brown-600">View your account details and manage your own credentials.</p>
      </header>

      <div className="mt-8 premium-card p-6 md:p-8">
        <h2 className="font-heading text-sm font-semibold text-brown-900">Account Details</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brown-500">Role</dt>
            <dd className="mt-1">
              <RoleBadge role={user.role} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brown-500">Account Created</dt>
            <dd className="mt-1 text-sm text-brown-800">{user.createdAt.slice(0, 10)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brown-500">Last Login</dt>
            <dd className="mt-1 text-sm text-brown-800">{user.lastLoginAt ? user.lastLoginAt.slice(0, 10) : "This is your first session"}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <ProfileForm user={user} />
      </div>

      <div className="mt-6">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
