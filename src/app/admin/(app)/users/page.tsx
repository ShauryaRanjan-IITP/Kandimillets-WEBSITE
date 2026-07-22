import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/session";
import { getUserById, getUsersList } from "@/lib/users/queries";
import UsersToolbar from "@/components/admin/users/UsersToolbar";
import UsersTable from "@/components/admin/users/UsersTable";
import UsersPagination from "@/components/admin/users/UsersPagination";
import UserFormModalController from "@/components/admin/users/UserFormModalController";
import UserStatusDialogController from "@/components/admin/users/UserStatusDialogController";
import ResetPasswordDialogController from "@/components/admin/users/ResetPasswordDialogController";

export const metadata: Metadata = {
  title: "Users",
};

interface AdminUsersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// User Management module — this task's §3. Restricted to Super Admin
// (docs/ADMIN_SYSTEM.md §5's reserved role enforcement, finally wired in
// here) — an Admin who navigates here directly is redirected back to the
// Dashboard rather than shown an empty/broken management screen.
export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await requireAdminSession();
  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  const params = await searchParams;
  const search = firstValue(params.search) ?? "";
  const page = Math.max(1, Number(firstValue(params.page)) || 1);
  const pageSize = 25;

  const { rows, totalCount } = await getUsersList({ search, page, pageSize });

  const editId = firstValue(params.edit);
  const statusId = firstValue(params.status);
  const resetPasswordId = firstValue(params.resetPassword);
  const isCreateOpen = firstValue(params.create) === "1";

  const [editingUser, statusUser, resetPasswordUser] = await Promise.all([
    editId ? getUserById(editId) : null,
    statusId ? getUserById(statusId) : null,
    resetPasswordId ? getUserById(resetPasswordId) : null,
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-warm-200 pb-6">
        <h1 className="font-heading text-2xl font-bold text-brown-900">Users</h1>
        <p className="mt-1 text-sm text-brown-600">
          Manage who can access the Kandimillets admin portal, as Super Admin or Admin.
        </p>
      </header>

      <div className="mt-8 space-y-4">
        <UsersToolbar initialSearch={search} />
        <UsersTable rows={rows} search={search} currentUserId={session.user.id} hasAnyUsersAtAll={totalCount > 0 || Boolean(search)} />
        {rows.length > 0 && <UsersPagination page={page} pageSize={pageSize} totalCount={totalCount} search={search} />}
      </div>

      {(isCreateOpen || (editId && editingUser)) && (
        <UserFormModalController editingUser={editId ? editingUser : null} />
      )}
      {statusId && statusUser && <UserStatusDialogController user={statusUser} />}
      {resetPasswordId && resetPasswordUser && <ResetPasswordDialogController user={resetPasswordUser} />}
    </div>
  );
}
