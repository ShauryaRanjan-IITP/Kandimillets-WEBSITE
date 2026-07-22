/**
 * Audit Log table — a plain, server-renderable component (no
 * "use client"). Read-only by design: there is no edit/delete affordance
 * anywhere, since audit entries are immutable (this task's explicit §5
 * requirement).
 */
import EmptyState from "@/components/admin/dashboard/EmptyState";
import { ClipboardEmptyIcon } from "@/components/admin/dashboard/icons";
import type { AuditLogDTO } from "@/lib/audit/dto";

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Login",
  LOGOUT: "Logout",
  CREATE: "Create",
  UPDATE: "Update",
  DEACTIVATE: "Deactivate",
  ACTIVATE: "Activate",
  VOID: "Void",
  ADJUSTMENT: "Adjustment",
  PASSWORD_RESET: "Password Reset",
  PASSWORD_RESET_REQUESTED: "Password Reset Requested",
  PASSWORD_RESET_FAILED: "Password Reset Failed",
};

const ACTION_STYLES: Record<string, string> = {
  LOGIN: "bg-green-100 text-green-700",
  LOGOUT: "bg-warm-200 text-brown-600",
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-gold-100 text-brown-700",
  DEACTIVATE: "bg-red-50 text-red-700",
  ACTIVATE: "bg-green-100 text-green-700",
  VOID: "bg-red-50 text-red-700",
  ADJUSTMENT: "bg-gold-100 text-brown-700",
  PASSWORD_RESET: "bg-warm-200 text-brown-600",
  PASSWORD_RESET_REQUESTED: "bg-warm-200 text-brown-600",
  PASSWORD_RESET_FAILED: "bg-red-50 text-red-700",
};

const ENTITY_LABELS: Record<string, string> = {
  USER: "User",
  RETAILER: "Retailer",
  PRODUCT: "Product",
  SALE: "Sale",
  STOCK_MOVEMENT: "Stock Movement",
  BUSINESS_SETTINGS: "Business Settings",
  SESSION: "Session",
};

interface AuditLogTableProps {
  rows: AuditLogDTO[];
  hasAnyLogsAtAll: boolean;
}

export default function AuditLogTable({ rows, hasAnyLogsAtAll }: AuditLogTableProps) {
  if (rows.length === 0) {
    return (
      <div className="premium-card">
        <EmptyState
          icon={<ClipboardEmptyIcon />}
          title={hasAnyLogsAtAll ? "No log entries match your search" : "No activity recorded yet"}
          message={
            hasAnyLogsAtAll
              ? "Try a different user, summary, or reference."
              : "Every meaningful action across the admin portal will appear here."
          }
        />
      </div>
    );
  }

  return (
    <div className="premium-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-warm-200 bg-warm-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brown-500">
                Timestamp
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brown-500">
                User
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brown-500">
                Action
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brown-500">
                Entity
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brown-500">
                Reference
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brown-500">
                Summary
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-100">
            {rows.map((log) => (
              <tr key={log.id} className="transition-colors duration-150 hover:bg-warm-50/60">
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">{log.createdAt.slice(0, 16).replace("T", " ")}</td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-brown-900">{log.userName}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${ACTION_STYLES[log.action] ?? "bg-warm-200 text-brown-600"}`}>
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-700">{ENTITY_LABELS[log.entityType] ?? log.entityType}</td>
                <td className="whitespace-nowrap px-4 py-3 text-brown-500">{log.reference ?? "—"}</td>
                <td className="px-4 py-3 text-brown-700">{log.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
