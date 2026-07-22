/**
 * The single write path for the audit ledger — every mutation across
 * every module (Sales, Retailers, Products, Inventory, Users, Business
 * Settings, and login/logout) calls `writeAuditLog`, never
 * `prisma.auditLog.create()` directly. This is what "Never duplicate
 * logic" means for audit logging specifically: one function decides the
 * row shape (denormalized `userName` snapshot, etc.), so every caller
 * only has to supply the specific facts of its own event.
 *
 * Accepts an optional Prisma transaction client so a caller that already
 * wraps its own write in `prisma.$transaction` (Sales' stock-movement
 * writes, Inventory adjustments) can make the audit entry land
 * atomically with the business write it's describing — the same
 * atomicity requirement already established for StockMovement
 * (src/lib/inventory/stockMovement.ts) and anticipated for Sales back in
 * docs/API.md §14 ("Create Sale + its SaleAuditLog entry").
 */
import type { Prisma } from "@/generated/prisma/client";
import type { AuditAction, AuditEntityType } from "@/generated/prisma/enums";
import prisma from "@/lib/db/prisma";

export interface AuditLogInput {
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  reference?: string | null;
  summary: string;
}

type Db = Prisma.TransactionClient | typeof prisma;

export async function writeAuditLog(input: AuditLogInput, db: Db = prisma) {
  return db.auditLog.create({
    data: {
      userId: input.userId,
      userName: input.userName,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      reference: input.reference ?? null,
      summary: input.summary,
    },
  });
}
