"use client";

/**
 * Desktop persistent sidebar — docs: this task's "Desktop Sidebar" spec.
 * Hidden below `lg` (the mobile drawer, AdminMobileNav.tsx, takes over at
 * that breakpoint — see docs/DASHBOARD.md §14's precedent for the same
 * `lg` cutoff already used elsewhere in the admin UI). Collapse is a
 * manual, user-triggered toggle (icon-only width) rather than an
 * automatic breakpoint — "content should never shift unexpectedly."
 */
import { useState } from "react";
import Link from "next/link";
import AdminNavList from "./AdminNavList";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

interface AdminSidebarProps {
  currentRole?: "SUPER_ADMIN" | "ADMIN";
}

export default function AdminSidebar({ currentRole }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden shrink-0 border-r border-warm-200 bg-white/60 backdrop-blur-sm transition-[width] duration-200 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:self-start ${
        collapsed ? "lg:w-[76px]" : "lg:w-64"
      }`}
    >
      <div className="flex h-16 items-center border-b border-warm-200 px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 rounded-lg">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-600 font-heading text-sm font-bold text-white">
            K
          </span>
          {!collapsed && (
            <span className="truncate font-heading text-sm font-bold text-brown-900">Kandimillets Admin</span>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <AdminNavList collapsed={collapsed} currentRole={currentRole} />
      </div>

      <div className="border-t border-warm-200 p-3">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-brown-500 transition-colors duration-150 hover:bg-warm-100 hover:text-brown-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
