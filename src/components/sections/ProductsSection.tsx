import SectionHeader from "@/components/ui/SectionHeader";
import ProductGrid from "@/components/ui/ProductGrid";
import { products } from "@/data/products";
import Link from "next/link";

export default function ProductsSection() {
  return (
    <section className="py-16 md:py-24 bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Our Products"
          subtitle="Premium healthy foods available for retail and bulk supply across India."
        />

        <div className="mt-12 md:mt-16">
          <ProductGrid products={products} />
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold transition-colors duration-200"
          >
            View All Products
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
