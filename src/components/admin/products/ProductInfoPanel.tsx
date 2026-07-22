import type { ProductRow } from "./types";

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

interface ProductInfoPanelProps {
  product: ProductRow;
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-brown-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-brown-800">{value || "—"}</dd>
    </div>
  );
}

export default function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  return (
    <div className="premium-card p-5">
      <h2 className="font-heading text-sm font-semibold text-brown-900">Product Information</h2>
      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoRow label="Category" value={product.category} />
        <InfoRow label="SKU" value={product.sku} />
        <InfoRow label="Unit" value={product.unit} />
        <InfoRow
          label="Selling Price"
          value={product.sellingPrice !== null ? `₹${rupee.format(product.sellingPrice)}` : null}
        />
      </dl>
      {product.description && (
        <div className="mt-4 border-t border-warm-200 pt-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-brown-500">Description</dt>
          <dd className="mt-1 text-sm text-brown-700">{product.description}</dd>
        </div>
      )}
    </div>
  );
}
