/** Active/Inactive pill — same rounded-full, tinted convention as
 * PaymentStatusBadge.tsx (docs/SALES_REGISTER.md §5), applied to the
 * Retailer's own status domain instead of Payment Status. */
interface RetailerStatusBadgeProps {
  isActive: boolean;
}

export default function RetailerStatusBadge({ isActive }: RetailerStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        isActive ? "bg-green-100 text-green-700" : "bg-brown-100 text-brown-500"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
