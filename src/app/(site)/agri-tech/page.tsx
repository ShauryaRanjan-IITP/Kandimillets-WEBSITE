import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import SectionHeader from "@/components/ui/SectionHeader";
import ServiceCard from "@/components/ui/ServiceCard";
import CTASection from "@/components/ui/CTASection";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "Agriculture AI & IT | Technology Division",
  description: "Our dedicated technology division provides modern AI and IT solutions for agriculture, empowering businesses with data and automation.",
};

export default function AgriTechPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <PageHero
        title="Agriculture AI & IT"
        subtitle="Technology Division"
        variant="blue"
      />

      {/* Introduction Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader
            title="Empowering Agriculture with Technology"
            subtitle="Bridging the gap between traditional farming and modern technology."
          />
          <div className="mt-8 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200 text-left">
            <p className="text-slate-700 text-lg leading-relaxed mb-6">
              At Kandimillets, we understand that the future of agriculture lies in smart, data-driven decisions. While our core business focuses on premium millet products, our dedicated <strong>Technology Division</strong> specializes in building cutting-edge AI and IT solutions for the agricultural sector.
            </p>
            <p className="text-slate-700 text-lg leading-relaxed">
              We leverage modern technology to optimize farming operations, improve yield predictions, and streamline supply chains. Our standalone tech solutions are designed to serve agribusinesses, farming cooperatives, and agricultural institutions looking to embrace digital transformation.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Our Tech Capabilities"
            subtitle="Comprehensive IT and AI solutions for modern agriculture."
          />
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <CTASection 
          title="Ready to Transform Your Agricultural Operations?"
          subtitle="Contact our technology team to discuss how our AI and IT solutions can help your business grow."
          variant="green"
        />
      </div>
    </main>
  );
}
