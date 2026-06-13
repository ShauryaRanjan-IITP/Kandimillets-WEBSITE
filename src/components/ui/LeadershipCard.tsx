import type { Leader } from '@/types';
import ImageWithFallback from './ImageWithFallback';

interface LeadershipCardProps {
  leader: Leader;
}

export default function LeadershipCard({ leader }: LeadershipCardProps) {
  return (
    <div className="group premium-card">
      {/* Portrait Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <ImageWithFallback
          src={leader.image}
          alt={leader.name}
          fill
          category="leadership"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover premium-image-hover"
        />
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-xl font-heading font-semibold text-brown-900">
          {leader.name}
        </h3>
        <p className="text-green-600 font-medium text-sm mt-1">
          {leader.designation}
        </p>
        <p className="text-sm text-brown-600 mt-3">
          {leader.bio}
        </p>
      </div>
    </div>
  );
}
