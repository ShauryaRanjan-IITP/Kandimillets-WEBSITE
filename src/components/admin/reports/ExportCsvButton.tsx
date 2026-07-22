/**
 * Export as CSV — a plain anchor to the /admin/reports/export route
 * handler (this task's §6), carrying the exact same filter query string
 * the page itself was rendered with, so "the exported data must exactly
 * match the applied filters" holds by construction rather than by
 * separately re-deriving the filter state. No client JS: the browser's
 * native `Content-Disposition: attachment` handling (see the route
 * handler) triggers the download, the same way a normal link navigation
 * would.
 */
interface ExportCsvButtonProps {
  queryString: string;
}

export default function ExportCsvButton({ queryString }: ExportCsvButtonProps) {
  return (
    <a
      href={`/admin/reports/export?${queryString}`}
      className="inline-flex items-center gap-2 rounded-xl border border-brown-300 px-4 py-2.5 text-sm font-semibold text-brown-700 transition-all duration-200 hover:bg-brown-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 12l4.5-4.5M12 12V3"
        />
      </svg>
      Export as CSV
    </a>
  );
}
