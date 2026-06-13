import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import CTASection from "@/components/ui/CTASection";
import { products, getProductBySlug, getAllProductSlugs } from "@/data/products";
import siteConfig from "@/data/siteConfig";

// Generate all product pages at build time
export async function generateStaticParams() {
  return getAllProductSlugs().map((slug) => ({ slug }));
}

// Disable pages not in the product list
export const dynamicParams = false;

// Dynamic metadata for each product
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.name,
    description: product.longDescription.slice(0, 160),
    openGraph: {
      title: `${product.name} | Kandimillets`,
      description: product.description,
      type: "article",
      images: [
        {
          url: product.image,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Kandimillets`,
      description: product.description,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Get related products (same category, exclude current)
  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-warm-100 border-b border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-brown-500">
            <Link href="/" className="hover:text-green-600 transition-colors">
              Home
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/products" className="hover:text-green-600 transition-colors">
              Products
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-brown-800 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-12 md:py-20 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            {/* Image */}
            <div className="lg:w-1/2">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg bg-white">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  fill
                  category="product"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="lg:w-1/2">
              {/* Category badge */}
              <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                {product.category === "makhana" ? "Makhana Range" : "Millet Products"}
              </div>

              <h1 className="text-3xl md:text-4xl font-heading font-bold text-brown-900">
                {product.name}
              </h1>

              {/* Availability */}
              <div className="mt-4 inline-flex items-center gap-2 bg-gold-50 text-brown-700 px-4 py-2 rounded-xl text-sm font-medium border border-gold-200">
                <svg className="w-4 h-4 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {product.availabilityText}
              </div>

              {/* Description */}
              <p className="mt-6 text-brown-600 leading-relaxed text-base md:text-lg">
                {product.longDescription}
              </p>

              {/* Highlights */}
              <div className="mt-8">
                <h3 className="text-lg font-heading font-semibold text-brown-900 mb-4">
                  Product Highlights
                </h3>
                <ul className="space-y-3">
                  {product.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-3 text-brown-700"
                    >
                      <svg
                        className="w-5 h-5 text-green-500 mt-0.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact for Pricing */}
              <div className="mt-8 p-5 bg-green-50/50 rounded-xl border border-green-100">
                <p className="text-sm text-brown-600 mb-1">
                  Contact for Pricing
                </p>
                <p className="text-xs text-brown-500">
                  Pricing depends on quantity and distribution requirements.
                  Reach out to discuss your needs.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={`${siteConfig.contact.whatsappUrl}&text=Hi%2C%20I%20am%20interested%20in%20${encodeURIComponent(product.name)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex-1 sm:flex-none justify-center"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp About This Product
                </a>
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="inline-flex items-center gap-2.5 border-2 border-brown-300 text-brown-700 hover:bg-brown-50 font-semibold px-7 py-3.5 rounded-xl transition-all duration-300 flex-1 sm:flex-none justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-heading font-bold text-brown-900 mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/products/${rp.slug}`}
                  className="group flex items-center gap-4 p-4 bg-warm-50 rounded-xl border border-warm-200 hover:border-green-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                    <ImageWithFallback
                      src={rp.image}
                      alt={rp.name}
                      fill
                      category="product"
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-brown-900 group-hover:text-green-600 transition-colors">
                      {rp.name}
                    </h3>
                    <p className="text-sm text-brown-500 mt-1 line-clamp-2">
                      {rp.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-16 bg-warm-50">
        <CTASection
          title="Ready to Stock This Product?"
          subtitle="Contact us for pricing, samples, and minimum order quantities."
          variant="brown"
        />
      </div>
    </>
  );
}
