"use client";

/**
 * Current page title + breadcrumb trail for the Top Header — derived from
 * the current pathname against the same navConfig the sidebar/drawer use,
 * so the three never disagree about what a route is called.
 */
import { usePathname } from "next/navigation";
import { findActiveNavItem } from "./navConfig";

export default function AdminBreadcrumb() {
  const pathname = usePathname();
  const activeItem = findActiveNavItem(pathname);

  return (
    <div className="min-w-0">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-brown-400">
        <span>Admin</span>
        {activeItem && (
          <>
            <span aria-hidden="true">/</span>
            <span className="truncate text-brown-600">{activeItem.label}</span>
          </>
        )}
      </nav>
      <h1 className="truncate font-heading text-lg font-bold text-brown-900">{activeItem?.label ?? "Admin"}</h1>
    </div>
  );
}
