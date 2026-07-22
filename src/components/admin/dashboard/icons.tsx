/**
 * Inline SVG icon set for the Dashboard — matching this codebase's
 * existing icon-key pattern (ARCHITECTURE.md §16): no icon library, small
 * hand-written components, sized/colored by the caller via `className`.
 */

type IconProps = { className?: string };

export function RevenueIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-4-4.5c0 1.38 1.79 2.5 4 2.5s4-1.12 4-2.5-1.79-2.5-4-2.5-4-1.12-4-2.5S9.79 6 12 6s4 1.12 4 2.5" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 6h15a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V6.75A.75.75 0 014.5 6z" />
    </svg>
  );
}

export function WalletIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 8.25v10.5a1.5 1.5 0 001.5 1.5h16.5a1.5 1.5 0 001.5-1.5V8.25M2.25 8.25l1.5-3.75a1.5 1.5 0 011.393-.94h13.714a1.5 1.5 0 011.393.94l1.5 3.75M16.5 14.25h.008" />
    </svg>
  );
}

export function ClockAlertIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function StoreIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75L4.5 4.5h15l.75 5.25M3.75 9.75v9a.75.75 0 00.75.75h15a.75.75 0 00.75-.75v-9M3.75 9.75a2.25 2.25 0 004.5 0 2.25 2.25 0 004.5 0 2.25 2.25 0 004.5 0" />
    </svg>
  );
}

export function BoxIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-8.25 4.5-8.25-4.5M12 12v9m8.25-6.75V7.5a.75.75 0 00-.39-.66l-7.5-4.13a.75.75 0 00-.72 0l-7.5 4.13A.75.75 0 003.75 7.5v6.75a.75.75 0 00.39.66l7.5 4.13a.75.75 0 00.72 0l7.5-4.13a.75.75 0 00.39-.66z" />
    </svg>
  );
}

export function ReceiptIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25h6m-6-3h6m-6-3h6M5.25 4.5h13.5A2.25 2.25 0 0121 6.75v13.5l-2.625-1.5-2.625 1.5-2.625-1.5-2.625 1.5-2.625-1.5L5.25 21V6.75A2.25 2.25 0 015.25 4.5z" />
    </svg>
  );
}

export function XCircleIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function ChartBarIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5h3.75V21H3v-7.5zm8.25-6H15V21h-3.75V7.5zM19.5 3h.75v18h-3.75V9h3z" />
    </svg>
  );
}

export function ChartPieIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3.75A8.25 8.25 0 0121.75 12h-8.25V3.75z" />
    </svg>
  );
}

export function ChartLineIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5l5.25-5.25 4.5 4.5L21 6.75M21 6.75h-4.5m4.5 0v4.5" />
    </svg>
  );
}

export function RankListIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6h12M8.25 12h9M8.25 18h6M3.75 6h.008M3.75 12h.008M3.75 18h.008" />
    </svg>
  );
}

export function ClipboardEmptyIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75h6a1.5 1.5 0 011.5 1.5v.75h-9v-.75a1.5 1.5 0 011.5-1.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 6h9a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 19.5v-12A1.5 1.5 0 017.5 6zM9 12h6M9 15.75h6" />
    </svg>
  );
}

export function CheckCircleIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function TimelineIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M4.5 6.75h.008M4.5 12h.008M4.5 17.25h.008" />
    </svg>
  );
}

export function PlusIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export function SortIndicatorIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
