import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import SectionHeader from '@/components/ui/SectionHeader';
import LeadershipCard from '@/components/ui/LeadershipCard';
import CTASection from '@/components/ui/CTASection';
import siteConfig from '@/data/siteConfig';
import { leaders } from '@/data/leadership';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Kandimillets, our mission, vision, and the leadership team driving authentic sourcing of healthy foods.',
};

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <PageHero
        title="About Kandimillets"
        subtitle="Bringing authentically sourced healthy foods from India's trusted regions to your table."
        variant="brown"
      />

      {/* Main Content Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <SectionHeader title="Our Story" align="left" />
            <div className="mt-8 space-y-6 text-brown-600 leading-relaxed text-lg">
              <p>
                Founded in {siteConfig.brand.founded}, Kandimillets emerged from a simple observation:
                while India has a rich heritage of nutritious, traditional foods, accessing these
                authentic products consistently remains a challenge for many regions.
              </p>
              <p>
                We bridge this gap by establishing direct, trust-based relationships with 
                regional suppliers. {siteConfig.brand.description}
              </p>
              <p>
                Our commitment is to transparency, quality, and preserving the authentic nature
                of the foods we supply. We believe that true nutrition starts with authentic origins.
              </p>
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-warm-50 p-8 rounded-2xl border border-warm-100">
              <h3 className="text-2xl font-heading font-bold text-brown-900 mb-4">Our Mission</h3>
              <p className="text-brown-600">
                To provide authentic, high-quality, and nutritious regional foods to consumers across India 
                by building a transparent and trust-based supply chain.
              </p>
            </div>
            <div className="bg-warm-50 p-8 rounded-2xl border border-warm-100">
              <h3 className="text-2xl font-heading font-bold text-brown-900 mb-4">Our Vision</h3>
              <p className="text-brown-600">
                To be the most trusted distribution partner for India's regional superfoods, 
                recognized for our commitment to authenticity, quality, and sustainable partnerships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Authentic Sourcing Philosophy */}
      <section className="py-16 bg-white border-y border-warm-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <h2 className="text-3xl font-heading font-bold text-brown-900 mb-6">Authentic Sourcing Philosophy</h2>
           <p className="text-lg text-brown-600 leading-relaxed">
             Our philosophy is rooted in authenticity. We don't just source products; we source from the regions 
             where they grow best and are traditionally cultivated. We verify our suppliers, understand their processes, 
             and ensure that the product reaching you is as close to its natural, traditional form as possible.
           </p>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <SectionHeader 
          title="Our Leadership" 
          subtitle="The team driving our vision forward."
          align="center"
        />
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {leaders.map((leader) => (
            <LeadershipCard key={leader.id} leader={leader} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 mb-8">
        <CTASection
          title="Partner With Us"
          subtitle="Available for Retail & Bulk Supply. Contact us for pricing and distribution opportunities."
          variant="brown"
        />
      </div>
    </main>
  );
}
