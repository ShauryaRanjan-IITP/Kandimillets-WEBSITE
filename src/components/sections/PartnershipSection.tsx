import SectionHeader from "@/components/ui/SectionHeader";
import PartnershipStepper from "@/components/ui/PartnershipStepper";

export default function PartnershipSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="How to Partner With Us"
          subtitle="A simple, transparent process to start your retail or distribution partnership."
        />

        <div className="mt-12 md:mt-16">
          <PartnershipStepper />
        </div>
      </div>
    </section>
  );
}
