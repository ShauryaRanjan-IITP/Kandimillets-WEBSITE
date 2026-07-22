import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth/session";
import { getAuditLogs } from "@/lib/audit/queries";
import AuditLogToolbar from "@/components/admin/audit/AuditLogToolbar";
import AuditLogTable from "@/components/admin/audit/AuditLogTable";
import AuditLogPagination from "@/components/admin/audit/AuditLogPagination";

export const metadata: Metadata = {
  title: "Audit Logs",
};

interface AdminAuditLogsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Audit Log module — this task's §5. Server Component: search/pagination
// live in the URL, resolved entirely server-side. Every meaningful event
// across the portal (login/logout, create/update/deactivate, void sale,
// inventory adjustment, user changes, business settings changes) writes
// here via src/lib/audit/log.ts's writeAuditLog — never a direct
// prisma.auditLog.create() from any page.
export default async function AdminAuditLogsPage({ searchParams }: AdminAuditLogsPageProps) {
  await requireAdminSession();

  const params = await searchParams;
  const search = firstValue(params.search) ?? "";
  const page = Math.max(1, Number(firstValue(params.page)) || 1);
  const pageSize = 25;

  const { rows, totalCount } = await getAuditLogs({ search, page, pageSize });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-warm-200 pb-6">
        <h1 className="font-heading text-2xl font-bold text-brown-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-brown-600">
          An immutable record of every meaningful action taken across the admin portal.
        </p>
      </header>

      <div className="mt-8 space-y-4">
        <AuditLogToolbar initialSearch={search} />
        <AuditLogTable rows={rows} hasAnyLogsAtAll={totalCount > 0 || Boolean(search)} />
        {rows.length > 0 && <AuditLogPagination page={page} pageSize={pageSize} totalCount={totalCount} search={search} />}
      </div>
    </div>
  );
}
