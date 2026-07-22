import { requireAdminSession } from "@/lib/auth/session";
import AdminSidebar from "@/components/admin/shell/AdminSidebar";
import AdminTopHeader from "@/components/admin/shell/AdminTopHeader";

/**
 * Admin Shell — the shared, permanent layout for every authenticated
 * admin page (Dashboard, Sales Register, and every future module named
 * in the sidebar). Introduced as a route group, `(app)`, for exactly the
 * reason `(site)` was introduced for the public site
 * (docs/ADMIN_SYSTEM.md §2): it adds no URL segment, but gives this
 * subset of `/admin/*` routes — everything except the unauthenticated
 * login/forgot-password/reset-password pages, which intentionally stay
 * outside this group — a single shared Sidebar + Top Header without
 * duplicating that markup in every page.
 *
 * Session is re-verified here (independent of the proxy's fast
 * cookie-only check and of each page's own existing re-check) purely as
 * an extra layer to source the admin's display name for the Top Header —
 * every page under this layout already performs its own authoritative
 * session re-check (docs/ADMIN_SYSTEM.md §4's defense-in-depth pattern,
 * unchanged, preserved exactly as it was).
 *
 * `requireAdminSession()` (src/lib/auth/session.ts) is what makes this
 * fail closed: it never lets a thrown session-lookup error skip the
 * redirect the way the previous bare `auth.api.getSession()` +
 * `if (!session) redirect(...)` here used to — see that file's module
 * comment for the full root-cause writeup of the bug this replaces.
 */
export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();
  const currentRole = session.user.role ?? undefined;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar currentRole={currentRole} />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopHeader userLabel={session.user.name || session.user.email} currentRole={currentRole} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
