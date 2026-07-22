import type { AdminRole } from "./types";

interface RoleBadgeProps {
  role: AdminRole;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        role === "SUPER_ADMIN" ? "bg-gold-100 text-brown-700" : "bg-warm-200 text-brown-600"
      }`}
    >
      {role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
    </span>
  );
}
