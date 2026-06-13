import type { TrustItem } from '@/types';

interface TrustBadgeProps {
  item: TrustItem;
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" /><path d="M16 6h.01" />
      <path d="M8 10h.01" /><path d="M16 10h.01" />
      <path d="M8 14h.01" /><path d="M16 14h.01" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88" />
      <path d="m11 14 2.5 2.5a1 1 0 1 0 3-3" />
      <path d="M2 6h4" /><path d="M18 6h4" />
      <path d="m6 6 4 4" /><path d="m18 6-4 4" />
    </svg>
  );
}

const iconMap: Record<TrustItem['icon'], () => React.JSX.Element> = {
  shield: ShieldIcon,
  building: BuildingIcon,
  check: CheckIcon,
  handshake: HandshakeIcon,
};

export default function TrustBadge({ item }: TrustBadgeProps) {
  const IconComponent = iconMap[item.icon];

  return (
    <div className="premium-card bg-white/80 backdrop-blur rounded-2xl p-8 text-center border border-warm-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Icon Circle */}
      <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 text-green-600 shadow-sm">
        <IconComponent />
      </div>

      <h3 className="text-xl font-heading font-bold text-brown-900 mt-6 mb-3">
        {item.title}
      </h3>

      <p className="text-sm text-brown-600 leading-relaxed">
        {item.description}
      </p>
    </div>
  );
}
