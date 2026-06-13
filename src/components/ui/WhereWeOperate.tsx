import { operationLocations } from "@/data/operations";

export default function WhereWeOperate() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {operationLocations.map((location) => (
        <div
          key={location.id}
          className={`relative rounded-2xl p-6 md:p-8 border-2 transition-all duration-300 hover:shadow-lg ${
            location.status === "active"
              ? "bg-green-50/50 border-green-200 hover:border-green-300"
              : "bg-gold-50/50 border-gold-200 hover:border-gold-300"
          }`}
        >
          {/* Status badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 ${
              location.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-gold-100 text-gold-600"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                location.status === "active"
                  ? "bg-green-500 animate-pulse"
                  : "bg-gold-500"
              }`}
            />
            {location.status === "active"
              ? "Current Operations"
              : "Expansion Focus"}
          </div>

          {/* City & State */}
          <div className="flex items-center gap-2 mb-2">
            <svg
              className={`w-6 h-6 ${
                location.status === "active"
                  ? "text-green-600"
                  : "text-gold-500"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <h3 className="text-2xl font-heading font-bold text-brown-900">
              {location.city}
            </h3>
          </div>
          <p className="text-brown-500 font-medium text-sm ml-8 -mt-1 mb-4">
            {location.state}
          </p>

          {/* Description */}
          <p className="text-brown-600 leading-relaxed text-sm md:text-base">
            {location.description}
          </p>
        </div>
      ))}
    </div>
  );
}
