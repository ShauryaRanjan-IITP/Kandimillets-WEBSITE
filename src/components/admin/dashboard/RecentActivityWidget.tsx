/**
 * Recent Activity widget — docs/DASHBOARD.md §9. Async Server Component:
 * fetches via src/lib/sales/queries.ts's getRecentSaleActivity, which
 * derives created/edited/voided events entirely from fields the Sale
 * table already has (createdAt/updatedAt/isVoided) — no SaleAuditLog is
 * invented. Login activity still isn't tracked anywhere, so it's not
 * shown here, consistent with the doc's honest, reduced scope.
 */
import { getRecentSaleActivity } from "@/lib/sales/queries";
import type { SaleActivityEntry } from "@/lib/sales/queries";
import EmptyState from "./EmptyState";
import { TimelineIcon } from "./icons";

const KIND_STYLES: Record<SaleActivityEntry["action"], string> = {
  created: "bg-green-100 text-green-700",
  edited: "bg-gold-100 text-brown-700",
  voided: "bg-red-50 text-red-700",
};

const KIND_LABELS: Record<SaleActivityEntry["action"], string> = {
  created: "Created",
  edited: "Edited",
  voided: "Voided",
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export default async function RecentActivityWidget() {
  let entries: SaleActivityEntry[] | null = null;
  try {
    entries = await getRecentSaleActivity(8);
  } catch (error) {
    console.error("RecentActivityWidget failed to load:", error);
  }

  return (
    <div className="premium-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-sm font-semibold text-brown-900">Recent Activity</h3>
          <p className="mt-0.5 text-xs text-brown-500">
            Sales created, edited, and voided. Richer activity (field-level detail, login
            events) will be available once Audit Logs are implemented.
          </p>
        </div>
      </div>

      {entries === null && (
        <div className="mt-4">
          <EmptyState
            icon={<TimelineIcon />}
            title="Couldn't load recent activity"
            message="Something went wrong loading this widget. Try refreshing the page."
            className="!py-8"
          />
        </div>
      )}

      {entries !== null && entries.length === 0 && (
        <div className="mt-4">
          <EmptyState
            icon={<TimelineIcon />}
            title="No activity yet"
            message="As sales are created, edited, or voided, they'll show up here as a running timeline."
            className="!py-8"
          />
        </div>
      )}

      {entries !== null && entries.length > 0 && (
        <ol className="mt-4 space-y-4">
          {entries.map((entry, index) => (
            <li key={entry.id} className="relative flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${KIND_STYLES[entry.action]}`}
                >
                  {KIND_LABELS[entry.action].charAt(0)}
                </span>
                {index < entries.length - 1 && <span className="mt-1 w-px flex-1 bg-warm-200" />}
              </div>
              <div className="pb-1">
                {entry.action === "voided" ? (
                  <p className="text-sm text-brown-800">
                    {KIND_LABELS[entry.action]}: {entry.saleNumber} for {entry.retailerName}
                  </p>
                ) : (
                  <a href={`/admin/sales?sale=${entry.id}`} className="text-sm text-brown-800 hover:text-green-700">
                    {KIND_LABELS[entry.action]}: {entry.saleNumber} for {entry.retailerName}
                  </a>
                )}
                <p className="mt-0.5 text-xs text-brown-400">
                  By {entry.actorName} · {relativeTime(entry.timestamp)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
