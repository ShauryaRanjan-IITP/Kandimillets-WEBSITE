import Link from 'next/link';
import type { Product } from '@/types';
import ImageWithFallback from './ImageWithFallback';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group premium-card overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          fill
          category="product"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover premium-image-hover"
        />
      </div>

      {/* Card Body */}
      <div className="p-5">
        <Link
          href={`/products/${product.slug}`}
          className="text-xl font-heading font-semibold text-brown-900 hover:text-green-700 transition-colors"
        >
          {product.name}
        </Link>

        <p className="text-sm text-brown-600 mt-2 line-clamp-3">
          {product.description}
        </p>

        {/* Availability Badge */}
        <div className="mt-3">
          <span className="inline-flex items-center bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
            {product.availabilityText}
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="mt-4 flex gap-3">
          {/* Call — Primary */}
          <a
            href="tel:+919973453069"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Call Us
          </a>

          {/* Email — Secondary */}
          <a
            href="mailto:millet2024usha@gmail.com"
            className="flex-1 inline-flex items-center justify-center gap-2 border border-brown-300 text-brown-700 hover:bg-brown-50 text-sm font-medium py-2.5 px-4 rounded-xl transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Email
          </a>
        </div>
      </div>
    </div>
  );
}
