import type { Leader } from '@/types';
import ImageWithFallback from './ImageWithFallback';

interface LeadershipCardProps {
  leader: Leader;
}

export default function LeadershipCard({ leader }: LeadershipCardProps) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-warm-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Portrait Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <ImageWithFallback
          src={leader.image}
          alt={leader.name}
          fill
          category="leadership"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
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
