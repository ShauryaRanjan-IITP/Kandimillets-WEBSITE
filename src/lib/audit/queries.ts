/**
 * Audit Log reads — direct server-side data fetching, per the read path
 * in docs/API.md §3. Same layered shape as every other module's
 * queries.ts: plain Prisma reads, serialized via dto.ts.
 */
import prisma from "@/lib/db/prisma";
import { serializeAuditLog, type AuditLogDTO } from "./dto";
import type { AuditAction, AuditEntityType } from "@/generated/prisma/enums";

export interface GetAuditLogsParams {
  search?: string;
  action?: AuditAction;
  entityType?: AuditEntityType;
  page?: number;
  pageSize?: number;
}

export interface GetAuditLogsResult {
  rows: AuditLogDTO[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Searchable, paginated Audit Log page (this task's §5 explicit
 * requirement) — matches by actor name, summary, or reference. Never
 * mutated/filtered-out: every row that has ever been written is always
 * reachable here (immutability is enforced by there being no update/
 * delete Server Action anywhere in this module, not by a filter). */
export async function getAuditLogs(params: GetAuditLogsParams = {}): Promise<GetAuditLogsResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 25));
  const search = params.search?.trim();

  const where = {
    ...(params.action ? { action: params.action } : {}),
    ...(params.entityType ? { entityType: params.entityType } : {}),
    ...(search
      ? {
          OR: [
            { userName: { contains: search, mode: "insensitive" as const } },
            { summary: { contains: search, mode: "insensitive" as const } },
            { reference: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [logs, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { rows: logs.map(serializeAuditLog), totalCount, page, pageSize };
}
