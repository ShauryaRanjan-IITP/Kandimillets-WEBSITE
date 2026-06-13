import SectionHeader from "@/components/ui/SectionHeader";
import LeadershipCard from "@/components/ui/LeadershipCard";
import { leaders } from "@/data/leadership";

export default function LeadershipSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Our Leadership"
          subtitle="The team driving Kandimillets' mission of authentic, quality food distribution."
        />

        <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {leaders.map((leader) => (
            <LeadershipCard key={leader.id} leader={leader} />
          ))}
        </div>
      </div>
    </section>
  );
}
