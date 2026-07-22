"use client";

/**
 * Shared nav-list renderer — used by both the desktop AdminSidebar and
 * the mobile AdminMobileNav drawer, so the two never duplicate the same
 * markup (this task's "no duplicated layout code" requirement extended
 * to the nav list itself).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_GROUPS, findActiveNavItem } from "./navConfig";

interface AdminNavListProps {
  /** Icon-only desktop mode — labels are still present for screen readers
   * (visually hidden), never removed from the DOM. */
  collapsed?: boolean;
  /** Called after a real navigation link is activated — the mobile drawer
   * uses this to close itself. */
  onNavigate?: () => void;
  /** The signed-in admin's role — items with `requiresRole` set are
   * omitted entirely (not shown disabled) when it doesn't match. */
  currentRole?: "SUPER_ADMIN" | "ADMIN";
}

export default function AdminNavList({ collapsed = false, onNavigate, currentRole }: AdminNavListProps) {
  const pathname = usePathname();
  const activeItem = findActiveNavItem(pathname);

  return (
    <nav aria-label="Admin navigation" className="flex flex-col gap-1">
      {ADMIN_NAV_GROUPS.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className={groupIndex > 0 ? "mt-3 border-t border-warm-200 pt-3" : undefined}
        >
          <ul className="flex flex-col gap-1">
            {group.items
              .filter((item) => !item.requiresRole || item.requiresRole === currentRole)
              .map((item) => {
              if (item.status === "comingSoon") {
                return (
                  <li key={item.label}>
                    <div
                      aria-disabled="true"
                      title={`${item.label} — Coming Soon`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brown-400"
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          <span className="shrink-0 rounded-full bg-warm-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brown-500">
                            Coming Soon
                          </span>
                        </>
                      )}
                    </div>
                  </li>
                );
              }

              const isActive = !item.isAction && activeItem?.href === item.href;

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 ${
                      item.isAction
                        ? "bg-green-600 text-white shadow-sm hover:bg-green-700"
                        : isActive
                          ? "bg-green-50 text-green-700"
                          : "text-brown-700 hover:bg-warm-100"
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className={collapsed ? "sr-only" : "flex-1 truncate"}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
