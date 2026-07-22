/**
 * Admin Shell navigation — single source of truth for the sidebar, the
 * mobile drawer, and the top header's breadcrumb, so none of the three
 * duplicate this list independently.
 */
import {
  BoxIcon,
  ChartBarIcon,
  ClipboardListIcon,
  GearIcon,
  HomeIcon,
  LedgerIcon,
  PlusCircleIcon,
  UserCogIcon,
  UsersIcon,
  WarehouseIcon,
} from "./icons";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  status: "enabled" | "comingSoon";
  /** True for action shortcuts (e.g. "Add Sale") that don't represent a
   * page you're "on" — styled and treated differently from a regular nav
   * link (never active-highlighted, no breadcrumb entry). */
  isAction?: boolean;
  /** Restricts visibility to this role — used for User Management, the
   * first nav item this project has ever gated by role
   * (docs/ADMIN_SYSTEM.md §5's reserved-but-unenforced role, finally
   * enforced in this Administration module). Purely a display filter;
   * the actual access control is the page's own role check
   * (/admin/users redirects a non-Super-Admin away regardless). */
  requiresRole?: "SUPER_ADMIN";
}

export interface AdminNavGroup {
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: <HomeIcon />, status: "enabled" },
      { label: "Add Sale", href: "/admin/sales?addSale=1", icon: <PlusCircleIcon />, status: "enabled", isAction: true },
      { label: "Sales Register", href: "/admin/sales", icon: <LedgerIcon />, status: "enabled" },
    ],
  },
  {
    items: [
      { label: "Retailers", href: "/admin/retailers", icon: <UsersIcon />, status: "enabled" },
      { label: "Products", href: "/admin/products", icon: <BoxIcon />, status: "enabled" },
      { label: "Reports", href: "/admin/reports", icon: <ChartBarIcon />, status: "enabled" },
      { label: "Inventory", href: "/admin/inventory", icon: <WarehouseIcon />, status: "enabled" },
    ],
  },
  {
    items: [
      { label: "Settings", href: "/admin/settings", icon: <GearIcon />, status: "enabled" },
      { label: "Users", href: "/admin/users", icon: <UserCogIcon />, status: "enabled", requiresRole: "SUPER_ADMIN" },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: <ClipboardListIcon />, status: "enabled" },
    ],
  },
];

/** All enabled, non-action items — used for active-state/breadcrumb
 * matching against the current pathname. */
export const ADMIN_PAGE_ITEMS: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((group) => group.items).filter(
  (item) => item.status === "enabled" && !item.isAction
);

/** Longest-prefix match so `/admin/sales` (and any future nested route
 * under it) resolves to the right nav item without a hardcoded switch. */
export function findActiveNavItem(pathname: string): AdminNavItem | null {
  let match: AdminNavItem | null = null;
  for (const item of ADMIN_PAGE_ITEMS) {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      if (!match || item.href.length > match.href.length) {
        match = item;
      }
    }
  }
  return match;
}
