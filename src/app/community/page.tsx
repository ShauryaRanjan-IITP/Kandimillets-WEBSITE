import type { Metadata } from 'next';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import PageHero from '@/components/ui/PageHero';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata: Metadata = {
  title: 'Community | Kandimillets',
  description: 'Real interactions, genuine appreciation, and growing awareness of authentic healthy foods from Kandimillets.',
};

export default function CommunityPage() {
  return (
    <main className="flex min-h-screen flex-col bg-warm-50">
      {/* Hero Section */}
      <PageHero
        title="Loved By Our Community"
        subtitle="Real interactions, genuine appreciation, and growing awareness of authentic healthy foods."
        variant="community"
      />

      {/* Featured Event Narrative Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6">
            Featured Event
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-brown-900 mb-6 leading-tight">
            Nakshatra Anand Mela
          </h2>
          <p className="text-lg md:text-xl text-brown-600 leading-relaxed">
            Recently, Kandimillets had the privilege of participating in the Nakshatra Anand Mela, bringing our authentically sourced products directly to the people.
          </p>
        </div>

        {/* Narrative Gallery (Staggered Masonry feel) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Image 1: The Stall (Left, takes up 7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div className="premium-card overflow-hidden aspect-[4/3] relative">
              <ImageWithFallback
                src="/images/nakshatra-anand-mela-stall.jpeg"
                alt="Kandimillets stall at Nakshatra Anand Mela"
                fill
                category="sourcing"
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover premium-image-hover"
              />
            </div>
            <p className="text-sm text-brown-500 font-medium italic border-l-2 border-green-500 pl-3">
              Kandimillets showcase stall at Nakshatra Anand Mela featuring traditional healthy food products.
            </p>
          </div>

          {/* Text block for Image 1 (Right, 5 cols) */}
          <div className="md:col-span-5 md:pl-8">
            <h3 className="text-2xl font-heading font-bold text-brown-900 mb-4">
              Direct to Consumer
            </h3>
            <p className="text-brown-600 text-lg leading-relaxed">
              We showcased our premium Makhana, traditional Sattu, and millet products, allowing visitors to explore our range firsthand. The vibrant atmosphere provided the perfect setting to introduce our authentic regional foods.
            </p>
          </div>

        </div>

        {/* Image 2: Consumer Interaction (Right heavy) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-16 flex-col-reverse md:flex-row">
          
          {/* Text block for Image 2 (Left, 5 cols) */}
          <div className="md:col-span-5 md:pr-8 order-2 md:order-1">
            <h3 className="text-2xl font-heading font-bold text-brown-900 mb-4">
              Valuable Feedback
            </h3>
            <p className="text-brown-600 text-lg leading-relaxed">
              Consumers showed strong, genuine interest in authentic regional foods. We gathered valuable feedback that reinforced our confidence in our product range and the growing awareness of traditional nutrition.
            </p>
          </div>

          {/* Image 2 (Right, takes up 7 cols) */}
          <div className="md:col-span-7 space-y-4 order-1 md:order-2">
            <div className="premium-card overflow-hidden aspect-[16/9] relative">
              <ImageWithFallback
                src="/images/nakshatra-anand-mela-consumers-1.jpeg"
                alt="Consumers exploring Kandimillets products"
                fill
                category="leadership"
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover premium-image-hover"
              />
            </div>
            <p className="text-sm text-brown-500 font-medium italic border-l-2 border-gold-500 pl-3">
              Community members exploring Kandimillets products and sharing their feedback during the event.
            </p>
          </div>

        </div>

        {/* Image 3: Community Focus (Centered large) */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading font-bold text-brown-900 mb-4">
              Building Connections
            </h3>
            <p className="text-brown-600 text-lg leading-relaxed">
              Direct community interaction is at the heart of our mission. Engaging with participants face-to-face allowed us to understand their nutritional needs and share our sourcing philosophy.
            </p>
          </div>
          <div className="premium-card overflow-hidden aspect-[21/9] relative">
             <ImageWithFallback
                src="/images/nakshatra-anand-mela-consumers-2.jpeg"
                alt="Community members interacting with Kandimillets"
                fill
                category="hero"
                sizes="(max-width: 1024px) 100vw, 80vw"
                className="object-cover premium-image-hover object-center"
              />
          </div>
          <p className="text-sm text-brown-500 font-medium italic border-l-2 border-brown-500 pl-3 text-center">
            Consumers interacting with Kandimillets and learning about authentic regional foods.
          </p>
        </div>
      </section>

      {/* What We Learned Section */}
      <section className="py-16 bg-white border-y border-warm-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader 
            title="What We Learned From Consumers" 
            subtitle="Insights gathered from direct engagement at the Nakshatra Anand Mela."
            align="center"
          />
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl">
              <div className="w-12 h-12 bg-green-50 text-green-700 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
              <h4 className="text-xl font-heading font-bold text-brown-900 mb-3">Growing Health Awareness</h4>
              <p className="text-brown-600 leading-relaxed">
                We observed a significant shift toward conscious eating, with consumers actively seeking products that support long-term wellness.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl">
              <div className="w-12 h-12 bg-gold-50 text-gold-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h4 className="text-xl font-heading font-bold text-brown-900 mb-3">Traditional Nutrition</h4>
              <p className="text-brown-600 leading-relaxed">
                There is a deep appreciation for authentic foods. Consumers showed immense curiosity about our millet range and regional specialties like Sattu.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl">
              <div className="w-12 h-12 bg-brown-50 text-brown-700 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              </div>
              <h4 className="text-xl font-heading font-bold text-brown-900 mb-3">Value of Engagement</h4>
              <p className="text-brown-600 leading-relaxed">
                Direct conversations build trust. Our community values knowing the origin of their food and the philosophy behind our sourcing network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Looking Ahead */}
      <section className="py-16 bg-warm-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-brown-900 mb-6">Looking Ahead</h2>
          <p className="text-xl text-brown-700 leading-relaxed font-medium">
            Kandimillets looks forward to participating in more community events and continuing direct engagement with consumers across India. We remain committed to bringing authentic, regionally-sourced nutrition to every table.
          </p>
        </div>
      </section>

    </main>
  );
}
