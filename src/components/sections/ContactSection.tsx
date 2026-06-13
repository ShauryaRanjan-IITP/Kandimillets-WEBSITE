import SectionHeader from "@/components/ui/SectionHeader";
import ContactCard from "@/components/ui/ContactCard";
import siteConfig from "@/data/siteConfig";

export default function ContactSection() {
  return (
    <section className="py-16 md:py-24 bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Get in Touch"
          subtitle="Ready to partner with us? Reach out through any of these channels."
        />

        <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact cards */}
          <div className="space-y-4">
            <ContactCard
              icon="phone"
              title="Phone"
              value={siteConfig.contact.phone}
              href="tel:+919973453069"
            />
            <ContactCard
              icon="email"
              title="Email"
              value={siteConfig.contact.email}
              href="mailto:millet2024usha@gmail.com"
            />
            <ContactCard
              icon="location"
              title="Address"
              value={siteConfig.contact.address.join(", ")}
              href={siteConfig.contact.googleMapsUrl}
            />
          </div>

          {/* Google Maps embed */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-warm-200 aspect-[4/3] lg:aspect-auto lg:min-h-[360px]">
            <iframe
              src={siteConfig.contact.googleMapsEmbed}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "100%" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Kandimillets Location — Hyderabad, India"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
