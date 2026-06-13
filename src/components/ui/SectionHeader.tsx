interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}

export default function SectionHeader({
  title,
  subtitle,
  align = 'center',
}: SectionHeaderProps) {
  const isCenter = align === 'center';

  return (
    <div
      className={`flex flex-col ${
        isCenter ? 'items-center text-center' : 'items-start text-left'
      }`}
    >
      <h2 className="text-3xl md:text-4xl font-heading font-bold text-brown-900">
        {title}
      </h2>

      {/* Section divider */}
      <div
        className={`mt-4 h-1 w-16 rounded-full ${isCenter ? 'mx-auto' : ''}`}
        style={{
          width: 64,
          background: 'linear-gradient(to right, var(--color-green-500), var(--color-gold-400))',
        }}
      />

      {subtitle && (
        <p
          className={`text-lg text-brown-600 max-w-2xl mt-4 ${
            isCenter ? 'mx-auto' : ''
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
