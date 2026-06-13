import SectionHeader from "@/components/ui/SectionHeader";
import WhereWeOperate from "@/components/ui/WhereWeOperate";

export default function OperationsSection() {
  return (
    <section className="py-16 md:py-24 bg-warm-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Where We Operate"
          subtitle="Currently serving from Hyderabad with strategic expansion into Bihar."
        />

        <div className="mt-12 md:mt-16">
          <WhereWeOperate />
        </div>
      </div>
    </section>
  );
}
