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
      <div className="p-6 md:p-8 text-center">
        <h3 className="text-2xl font-heading font-bold text-brown-900 mb-1">
          {leader.name}
        </h3>
        <p className="text-green-700 font-semibold text-sm tracking-wide uppercase mb-4">
          {leader.designation}
        </p>
        <div className="w-12 h-0.5 bg-gradient-to-r from-green-300 to-gold-300 mx-auto mb-4" />
        <p className="text-base text-brown-600 leading-relaxed">
          {leader.bio}
        </p>
      </div>
    </div>
  );
}
