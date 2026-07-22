/**
 * User Management reads — direct server-side data fetching, per the read
 * path in docs/API.md §3. Same layered shape as every other module.
 */
import prisma from "@/lib/db/prisma";
import { serializeUser, type UserDTO } from "./dto";

export interface GetUsersListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface GetUsersListResult {
  rows: UserDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export async function getUsersList(params: GetUsersListParams = {}): Promise<GetUsersListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 25));
  const search = params.search?.trim();

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { rows: users.map(serializeUser), totalCount, page, pageSize };
}

export async function getUserById(id: string): Promise<UserDTO | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? serializeUser(user) : null;
}

export async function findUserByEmail(email: string, excludeId?: string) {
  return prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
}

/** "Prevent removing the final Super Admin" (this task's explicit §3
 * requirement) — used before any Deactivate or role-change-away-from-
 * Super-Admin so the last one can never be locked out of their own
 * portal. */
export async function countActiveSuperAdmins(): Promise<number> {
  return prisma.user.count({ where: { role: "SUPER_ADMIN", isActive: true } });
}
