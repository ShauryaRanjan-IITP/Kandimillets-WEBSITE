import type { Metadata } from 'next';
import PageHero from '@/components/ui/PageHero';
import SectionHeader from '@/components/ui/SectionHeader';
import SourcingStoryCard from '@/components/ui/SourcingStoryCard';
import CTASection from '@/components/ui/CTASection';
import { sourcingStories } from '@/data/sourcing';

export const metadata: Metadata = {
  title: 'Sourcing & Quality',
  description: 'Discover how Kandimillets sources premium healthy foods from trusted regions across India, ensuring quality and authenticity.',
};

export default function SourcingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <PageHero
        title="Our Sourcing Story"
        subtitle="Journey to the heart of India's trusted food regions."
        variant="green"
      />

      {/* Sourcing Stories */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-24">
        {sourcingStories.map((story, index) => (
          <SourcingStoryCard
            key={story.id}
            story={story}
            reverse={index % 2 !== 0}
          />
        ))}
      </section>

      {/* Quality Philosophy Section */}
      <section className="py-16 md:py-24 bg-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader 
            title="Quality Philosophy" 
            align="center"
          />
          <div className="mt-8 space-y-6 text-brown-600 text-lg leading-relaxed">
            <p>
              At Kandimillets, quality is not just a standard—it's a commitment to authenticity. 
              We believe that the best nutritional value comes from foods grown and processed in 
              their traditional regions, using time-honored practices combined with modern hygiene standards.
            </p>
            <p>
              We personally verify our partners, ensuring they share our dedication to purity. 
              From the fields of Madhubani to the processing centers in Hyderabad, every step 
              of our supply chain is monitored to ensure the integrity of the final product.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 mb-8 bg-white">
        <CTASection
          title="Source Authentic Products"
          subtitle="Available for Retail & Bulk Supply. Contact us for pricing and inquiries."
          variant="green"
        />
      </div>
    </main>
  );
}
