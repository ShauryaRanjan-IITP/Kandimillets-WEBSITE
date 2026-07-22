/**
 * Top Header — this task's "Top Header" spec: page title, breadcrumb,
 * logged-in admin name, logout button. A Server Component; the only
 * client pieces inside it are AdminMobileNav (hamburger + drawer) and
 * AdminBreadcrumb (needs the current pathname) and LogoutButton (already
 * an existing client component) — everything else here is static markup.
 */
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";
import AdminMobileNav from "./AdminMobileNav";
import AdminBreadcrumb from "./AdminBreadcrumb";

interface AdminTopHeaderProps {
  userLabel: string;
  currentRole?: "SUPER_ADMIN" | "ADMIN";
}

export default function AdminTopHeader({ userLabel, currentRole }: AdminTopHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-warm-200 bg-white/70 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <AdminMobileNav currentRole={currentRole} />
        <AdminBreadcrumb />
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <Link
          href="/admin/profile"
          className="hidden text-sm text-brown-600 hover:text-green-700 sm:inline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 rounded-lg"
        >
          {userLabel}
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
