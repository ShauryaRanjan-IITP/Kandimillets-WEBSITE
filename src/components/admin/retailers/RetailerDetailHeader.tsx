import Link from "next/link";
import RetailerStatusBadge from "./RetailerStatusBadge";
import type { RetailerRow } from "./types";

interface RetailerDetailHeaderProps {
  retailer: RetailerRow;
}

export default function RetailerDetailHeader({ retailer }: RetailerDetailHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-warm-200 pb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold text-brown-900">{retailer.name}</h1>
          <RetailerStatusBadge isActive={retailer.isActive} />
        </div>
        <p className="mt-1 text-sm text-brown-600">
          {retailer.city}, {retailer.state}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/retailers/${retailer.id}?edit=${retailer.id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-brown-300 px-4 py-2.5 text-sm font-semibold text-brown-700 transition-all duration-200 hover:bg-brown-50"
        >
          Edit Retailer
        </Link>
        <Link
          href={`/admin/retailers/${retailer.id}?status=${retailer.id}`}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md transition-all duration-300 ${
            retailer.isActive
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {retailer.isActive ? "Deactivate" : "Activate"}
        </Link>
      </div>
    </header>
  );
}
