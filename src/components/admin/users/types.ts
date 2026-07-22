/**
 * User Management client-facing types — hand-authored and kept
 * independent of the Prisma client, exactly matching the reasoning
 * already documented in src/components/admin/retailers/types.ts.
 */

export type AdminRole = "SUPER_ADMIN" | "ADMIN";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UserFormValues {
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
}

export interface CreateUserFormValues extends UserFormValues {
  password: string;
}

export function emptyCreateUserFormValues(): CreateUserFormValues {
  return { name: "", email: "", role: "ADMIN", isActive: true, password: "" };
}

export function userToFormValues(user: UserRow): UserFormValues {
  return { name: user.name, email: user.email, role: user.role, isActive: user.isActive };
}
