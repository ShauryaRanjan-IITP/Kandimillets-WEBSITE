import type { AuditLog } from "@/generated/prisma/client";

export function serializeAuditLog(log: AuditLog) {
  return {
    id: log.id,
    userId: log.userId,
    userName: log.userName,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    reference: log.reference,
    summary: log.summary,
    createdAt: log.createdAt.toISOString(),
  };
}

export type AuditLogDTO = ReturnType<typeof serializeAuditLog>;
