interface AdminAuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AdminAuthCard({
  title,
  subtitle,
  children,
  footer,
}: AdminAuthCardProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="font-heading text-2xl font-bold text-green-700">
            Kandimillets
          </span>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-brown-400">
            Admin Portal
          </p>
        </div>

        <div className="premium-card p-8">
          <h1 className="font-heading text-2xl font-bold text-brown-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-brown-600">
              {subtitle}
            </p>
          )}

          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-brown-500">{footer}</p>
        )}
      </div>
    </div>
  );
}
