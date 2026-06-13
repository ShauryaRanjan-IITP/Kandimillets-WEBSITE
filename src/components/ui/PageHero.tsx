interface PageHeroProps {
  title: string;
  subtitle?: string;
  variant?: "green" | "brown" | "gold" | "community" | "blue";
}

export default function PageHero({
  title,
  subtitle,
  variant = "green",
}: PageHeroProps) {
  const gradientMap = {
    green: "from-green-700 via-green-700 to-green-800",
    brown: "from-brown-700 via-brown-600 to-brown-700",
    gold: "from-gold-500 via-brown-500 to-brown-600",
    community: "from-green-800 via-green-700 to-brown-500",
    blue: "from-blue-900 via-indigo-800 to-blue-900",
  };

  const accentMap = {
    green: "from-green-400 to-gold-400",
    brown: "from-brown-400 to-gold-400",
    gold: "from-gold-400 to-white",
    community: "from-green-400 to-gold-400",
    blue: "from-indigo-400 to-blue-400",
  };

  return (
    <section
      className={`relative bg-gradient-to-br ${gradientMap[variant]} py-20 md:py-28 overflow-hidden`}
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white leading-tight">
          {title}
        </h1>

        {/* Decorative divider */}
        <div
          className={`w-20 h-1 bg-gradient-to-r ${accentMap[variant]} mx-auto mt-6 rounded-full`}
        />

        {subtitle && (
          <p className="text-lg md:text-xl text-white/80 mt-6 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
