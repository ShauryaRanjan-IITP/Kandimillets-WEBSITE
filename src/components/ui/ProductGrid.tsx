import type { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3;
}

export default function ProductGrid({ products, columns = 3 }: ProductGridProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 ${
        columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
      }`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
