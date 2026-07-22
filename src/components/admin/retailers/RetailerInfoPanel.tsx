import type { RetailerRow } from "./types";

interface RetailerInfoPanelProps {
  retailer: RetailerRow;
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-brown-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-brown-800">{value || "—"}</dd>
    </div>
  );
}

export default function RetailerInfoPanel({ retailer }: RetailerInfoPanelProps) {
  return (
    <div className="premium-card p-5">
      <h2 className="font-heading text-sm font-semibold text-brown-900">Business Information</h2>
      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoRow label="Business Name" value={retailer.name} />
        <InfoRow label="Contact Person" value={retailer.contactPerson} />
        <InfoRow label="Phone" value={retailer.phone} />
        <InfoRow label="Alternate Phone" value={retailer.alternatePhone} />
        <InfoRow label="Email" value={retailer.email} />
        <InfoRow label="GST Number" value={retailer.gstin} />
        <InfoRow label="Address" value={retailer.address} />
        <InfoRow label="City" value={retailer.city} />
        <InfoRow label="State" value={retailer.state} />
        <InfoRow label="Pincode" value={retailer.pincode} />
      </dl>
      {retailer.notes && (
        <div className="mt-4 border-t border-warm-200 pt-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-brown-500">Notes</dt>
          <dd className="mt-1 text-sm text-brown-700">{retailer.notes}</dd>
        </div>
      )}
    </div>
  );
}
