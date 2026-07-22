"use client";

/**
 * Owns the Global Date Filter's URL-navigation wiring — split out of
 * DashboardView so it can be `key`-ed by the server-resolved selection
 * (see src/app/admin/dashboard/page.tsx / DashboardView.tsx). Remounting
 * on a real URL-confirmed change resets local state for free, the same
 * "remount instead of effect-driven reset" pattern already used by
 * AddSaleModal in the Sales Register (src/components/admin/sales) —
 * avoids the react-hooks/set-state-in-effect pitfall entirely.
 */
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardDateFilter from "./DashboardDateFilter";
import type { DashboardDateSelection } from "./types";

interface DashboardDateFilterControlProps {
  initialSelection: DashboardDateSelection;
}

export default function DashboardDateFilterControl({ initialSelection }: DashboardDateFilterControlProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selection, setSelection] = useState<DashboardDateSelection>(initialSelection);

  function navigate(next: DashboardDateSelection) {
    const params = new URLSearchParams();
    params.set("range", next.key);
    if (next.key === "custom") {
      if (next.customFrom) params.set("from", next.customFrom);
      if (next.customTo) params.set("to", next.customTo);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleChange(next: DashboardDateSelection) {
    setSelection(next);
    if (next.key !== "custom") {
      navigate(next);
      return;
    }
    // Custom Range needs both dates before there's anything valid to
    // query — avoid navigating on every keystroke while only one date is
    // filled in.
    if (next.customFrom && next.customTo) {
      navigate(next);
    }
  }

  return <DashboardDateFilter value={selection} onChange={handleChange} />;
}
