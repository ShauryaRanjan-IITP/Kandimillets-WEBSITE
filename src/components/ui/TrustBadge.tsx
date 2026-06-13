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
    <div className="premium-card p-8 md:p-10 text-center relative overflow-hidden group">
      {/* Decorative subtle background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50/50 to-transparent rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />

      {/* Icon Circle */}
      <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 text-green-700 shadow-sm ring-4 ring-white mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
        <IconComponent />
      </div>

      <h3 className="text-xl md:text-2xl font-heading font-bold text-brown-900 mb-4">
        {item.title}
      </h3>

      <p className="text-base text-brown-600 leading-relaxed max-w-[280px] mx-auto">
        {item.description}
      </p>
    </div>
  );
}
