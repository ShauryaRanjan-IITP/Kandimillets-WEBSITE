import Link from "next/link";
import ProductStatusBadge from "./ProductStatusBadge";
import type { ProductRow } from "./types";

interface ProductDetailHeaderProps {
  product: ProductRow;
}

export default function ProductDetailHeader({ product }: ProductDetailHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-warm-200 pb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold text-brown-900">{product.name}</h1>
          <ProductStatusBadge isActive={product.isActive} />
        </div>
        <p className="mt-1 text-sm text-brown-600">
          {product.sku ?? "No SKU"} · {product.category}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/products/${product.id}?edit=${product.id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-brown-300 px-4 py-2.5 text-sm font-semibold text-brown-700 transition-all duration-200 hover:bg-brown-50"
        >
          Edit Product
        </Link>
        <Link
          href={`/admin/products/${product.id}?status=${product.id}`}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md transition-all duration-300 ${
            product.isActive ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {product.isActive ? "Deactivate" : "Activate"}
        </Link>
      </div>
    </header>
  );
}
