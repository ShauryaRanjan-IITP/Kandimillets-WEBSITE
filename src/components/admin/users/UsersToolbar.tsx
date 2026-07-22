"use client";

/** Search box + Add User button. Mirrors RetailersToolbar.tsx /
 * ProductsToolbar.tsx exactly. */
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface UsersToolbarProps {
  initialSearch: string;
}

export default function UsersToolbar({ initialSearch }: UsersToolbarProps) {
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 sm:max-w-sm">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
        </svg>
        <label htmlFor="users-search" className="sr-only">
          Search users
        </label>
        <input
          id="users-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          className="w-full rounded-xl border border-warm-300 bg-warm-50 py-2.5 pl-9 pr-4 text-sm text-brown-900 placeholder:text-brown-400 transition-all duration-200 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30"
        />
      </div>

      <a
        href={`${pathname}?create=1`}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add User
      </a>
    </div>
  );
}
