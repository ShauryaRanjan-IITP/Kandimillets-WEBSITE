/**
 * User list table — a plain, server-renderable component (no
 * "use client"). Row actions navigate via query params (`?edit=<id>`,
 * `?status=<id>`, `?resetPassword=<id>`), mirroring RetailersTable.tsx.
 */
import EmptyState from "@/components/admin/dashboard/EmptyState";
import { ClipboardEmptyIcon } from "@/components/admin/dashboard/icons";
import UserStatusBadge from "./UserStatusBadge";
import RoleBadge from "./RoleBadge";
import type { UserRow } from "./types";

interface UsersTableProps {
  rows: UserRow[];
  search: string;
  currentUserId: string;
  hasAnyUsersAtAll: boolean;
}

function buildHref(overrides: Record<string, string | undefined>, base: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  const merged = { ...base, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

export default function UsersTable({ rows, search, currentUserId, hasAnyUsersAtAll }: UsersTableProps) {
  const base = { search: search || undefined };

  if (rows.length === 0) {
    return (
      <div className="premium-card">
        <EmptyState
          icon={<ClipboardEmptyIcon />}
          title={hasAnyUsersAtAll ? "No users match your search" : "No users yet"}
          message={hasAnyUsersAtAll ? "Try a different name or email." : "Add the first admin user to get started."}
        />
      </div>
    );
  }

  return (
    <div className="premium-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-warm-200 bg-warm-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brown-500">
                Name
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brown-500">
                Email
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brown-500">
                Role
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brown-500">
                Status
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brown-500">
                Last Login
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brown-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-100">
            {rows.map((user) => (
              <tr key={user.id} className="transition-colors duration-150 hover:bg-warm-50/60">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-brown-900">
                  {user.name}
                  {user.id === currentUserId ? <span className="ml-1.5 text-xs text-brown-400">(you)</span> : null}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">{user.email}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <UserStatusBadge isActive={user.isActive} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">
                  {user.lastLoginAt ? user.lastLoginAt.slice(0, 10) : "Never"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2">
                    <a
                      href={buildHref({ edit: user.id }, base)}
                      aria-label={`Edit ${user.name}`}
                      className="rounded-lg p-1.5 text-brown-500 transition-colors hover:bg-warm-100 hover:text-brown-800"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </a>
                    <a
                      href={buildHref({ resetPassword: user.id }, base)}
                      aria-label={`Reset password for ${user.name}`}
                      className="rounded-lg p-1.5 text-brown-500 transition-colors hover:bg-warm-100 hover:text-brown-800"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 11-12 0 6 6 0 0112 0zM3 19.5l7.5-7.5" />
                      </svg>
                    </a>
                    <a
                      href={buildHref({ status: user.id }, base)}
                      aria-label={`${user.isActive ? "Deactivate" : "Activate"} ${user.name}`}
                      className={`rounded-lg p-1.5 transition-colors ${
                        user.isActive
                          ? "text-brown-500 hover:bg-red-50 hover:text-red-600"
                          : "text-brown-500 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      {user.isActive ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
