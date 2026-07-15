import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import ProductGrid from "@/components/ui/ProductGrid";
import CTASection from "@/components/ui/CTASection";
import { products } from "@/data/products";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Products",
  description:
    "Explore Kandimillets' range of healthy food products — Premium Makhana, Salted Makhana, Jaggery Makhana, Ragi Semiya, and Jowar Pasta. Available for retail and bulk supply.",
  openGraph: {
    title: "Our Products | Kandimillets",
    description:
      "Premium Makhana, Ragi Semiya, Jowar Pasta and more. Available for retail and bulk supply across India.",
  },
};

export default function ProductsPage() {
  const makhanaProducts = products.filter((p) => p.category === "makhana");
  const milletProducts = products.filter((p) => p.category === "millet");
  const sattuProducts = products.filter((p) => p.category === "sattu");

  return (
    <>
      <PageHero
        title="Our Products"
        subtitle="Premium healthy foods available for retail and bulk supply across India. Contact us for pricing and minimum order quantities."
      />

      {/* Makhana Products */}
      <section className="py-16 md:py-24 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              Sourced from Madhubani, Bihar
            </div>
            <h2 className="text-3xl font-heading font-bold text-brown-900">
              Makhana Range
            </h2>
            <p className="text-brown-600 mt-2 max-w-2xl">
              Premium fox nuts sourced through trusted partners in Madhubani,
              Bihar — a region widely recognized for high-quality Makhana
              production.
            </p>
          </div>
          <ProductGrid products={makhanaProducts} />
        </div>
      </section>

      {/* Sattu Products */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-brown-100 text-brown-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              Sourced from Bihar
            </div>
            <h2 className="text-3xl font-heading font-bold text-brown-900">
              Traditional Foods
            </h2>
            <p className="text-brown-600 mt-2 max-w-2xl">
              Authentic traditional food products sourced through trusted
              partnerships in Bihar — a state with deep-rooted culinary heritage.
            </p>
          </div>
          <ProductGrid products={sattuProducts} columns={2} />
        </div>
      </section>

      {/* Millet Products */}
      <section className="py-16 md:py-24 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-gold-100 text-brown-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              Manufactured in Hyderabad
            </div>
            <h2 className="text-3xl font-heading font-bold text-brown-900">
              Millet Products
            </h2>
            <p className="text-brown-600 mt-2 max-w-2xl">
              Nutritious millet-based products manufactured through trusted
              partners in Hyderabad, a growing hub for millet-based food
              production.
            </p>
          </div>
          <ProductGrid products={milletProducts} columns={2} />
        </div>
      </section>

      {/* Product note */}
      <section className="py-12 bg-warm-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brown-600 text-lg">
            All products are available for retail and bulk supply.{" "}
            <Link
              href="/partner"
              className="text-green-600 font-semibold hover:underline"
            >
              Contact us for pricing
            </Link>{" "}
            and minimum order quantities.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <CTASection
          title="Interested in Our Products?"
          subtitle="Get in touch for pricing, samples, and partnership opportunities."
          variant="green"
        />
        </div>
      </section>
    </>
  );
}
