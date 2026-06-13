type ContactIconType = 'phone' | 'email' | 'location';

interface ContactCardProps {
  icon: ContactIconType;
  title: string;
  value: string;
  href?: string;
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

const iconMap: Record<ContactIconType, () => React.JSX.Element> = {
  phone: PhoneIcon,
  email: EmailIcon,
  location: LocationIcon,
};

export default function ContactCard({ icon, title, value, href }: ContactCardProps) {
  const IconComponent = iconMap[icon];

  const content = (
    <div className="flex items-start gap-4 p-4 rounded-xl transition-colors hover:bg-warm-50">
      {/* Icon Circle */}
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-green-600">
        <IconComponent />
      </div>

      {/* Text */}
      <div>
        <p className="text-xs uppercase tracking-wider text-brown-400 font-medium">
          {title}
        </p>
        <p className="text-brown-800 font-medium mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="block"
      >
        {content}
      </a>
    );
  }

  return content;
}
