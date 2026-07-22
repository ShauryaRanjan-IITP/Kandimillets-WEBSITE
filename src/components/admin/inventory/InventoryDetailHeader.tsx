import Link from "next/link";
import StockStatusBadge from "./StockStatusBadge";
import type { ProductStockDetail } from "./types";

interface InventoryDetailHeaderProps {
  product: ProductStockDetail;
}

export default function InventoryDetailHeader({ product }: InventoryDetailHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-warm-200 pb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold text-brown-900">{product.name}</h1>
          <StockStatusBadge status={product.stockStatus} />
        </div>
        <p className="mt-1 text-sm text-brown-600">
          {product.sku ?? "No SKU"} · {product.category}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/products/${product.id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-brown-300 px-4 py-2.5 text-sm font-semibold text-brown-700 transition-all duration-200 hover:bg-brown-50"
        >
          View Product
        </Link>
        <Link
          href={`/admin/inventory/${product.id}?adjust=${product.id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg"
        >
          Adjust Stock
        </Link>
      </div>
    </header>
  );
}
