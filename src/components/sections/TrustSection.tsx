import SectionHeader from "@/components/ui/SectionHeader";
import TrustBadge from "@/components/ui/TrustBadge";
import { trustItems } from "@/data/trust";

export default function TrustSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-warm-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Trust & Credentials"
          subtitle="Building confidence through transparency, compliance, and quality commitment."
        />

        <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item) => (
            <TrustBadge key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
