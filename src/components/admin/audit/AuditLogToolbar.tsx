"use client";

/** Search box for the Audit Log — this task's explicit "searchable" §5
 * requirement. Mirrors every other module's toolbar exactly. */
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface AuditLogToolbarProps {
  initialSearch: string;
}

export default function AuditLogToolbar({ initialSearch }: AuditLogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (search === initialSearch) return;
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="relative max-w-sm">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
      </svg>
      <label htmlFor="audit-log-search" className="sr-only">
        Search audit log
      </label>
      <input
        id="audit-log-search"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by user, summary, or reference…"
        className="w-full rounded-xl border border-warm-300 bg-warm-50 py-2.5 pl-9 pr-4 text-sm text-brown-900 placeholder:text-brown-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30"
      />
    </div>
  );
}
