
interface CTASectionProps {
  title: string;
  subtitle?: string;
  variant?: 'green' | 'brown' | 'gold';
}

const variantStyles = {
  green: {
    bg: 'bg-gradient-to-r from-green-600 to-green-500 text-white',
    primary: 'bg-white text-green-700 hover:bg-green-50',
    secondary: 'border border-white/80 text-white hover:bg-white/10',
  },
  brown: {
    bg: 'bg-gradient-to-r from-brown-700 to-brown-600 text-white',
    primary: 'bg-white text-brown-700 hover:bg-brown-50',
    secondary: 'border border-white/80 text-white hover:bg-white/10',
  },
  gold: {
    bg: 'bg-gradient-to-r from-gold-500 to-gold-400 text-brown-900',
    primary: 'bg-white text-brown-900 hover:bg-brown-50',
    secondary: 'border border-brown-900/40 text-brown-900 hover:bg-brown-900/5',
  },
};

export default function CTASection({
  title,
  subtitle,
  variant = 'green',
}: CTASectionProps) {
  const styles = variantStyles[variant];

  return (
    <section className={`rounded-2xl mx-auto max-w-6xl ${styles.bg}`}>
      <div className="py-12 md:py-16 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-heading font-bold">
          {title}
        </h2>

        {subtitle && (
          <p className="text-lg opacity-90 mt-3 max-w-xl mx-auto">
            {subtitle}
          </p>
        )}

        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          {/* Call — Primary */}
          <a
            href="tel:+919973453069"
            className={`inline-flex items-center gap-2 font-medium py-3 px-6 rounded-xl transition-colors ${styles.primary}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Call Us
          </a>

          {/* Email — Secondary */}
          <a
            href="mailto:millet2024usha@gmail.com"
            className={`inline-flex items-center gap-2 font-medium py-3 px-6 rounded-xl transition-colors ${styles.secondary}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Email Us
          </a>
        </div>
      </div>
    </section>
  );
}
