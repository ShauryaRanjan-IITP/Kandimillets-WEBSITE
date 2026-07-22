/** Active/Inactive pill — same rounded-full, tinted convention as
 * RetailerStatusBadge.tsx / PaymentStatusBadge.tsx, applied to the
 * Product's own status domain. */
interface ProductStatusBadgeProps {
  isActive: boolean;
}

export default function ProductStatusBadge({ isActive }: ProductStatusBadgeProps) {
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
