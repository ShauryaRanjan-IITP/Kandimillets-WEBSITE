/** Active/Inactive pill — same rounded-full, tinted convention as
 * RetailerStatusBadge.tsx / ProductStatusBadge.tsx. */
interface UserStatusBadgeProps {
  isActive: boolean;
}

export default function UserStatusBadge({ isActive }: UserStatusBadgeProps) {
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
