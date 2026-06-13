import type { SourcingStory } from "@/types";
import ImageWithFallback from "./ImageWithFallback";

interface SourcingStoryCardProps {
  story: SourcingStory;
  reverse?: boolean;
}

export default function SourcingStoryCard({
  story,
  reverse = false,
}: SourcingStoryCardProps) {
  return (
    <div
      className={`flex flex-col ${
        reverse ? "lg:flex-row-reverse" : "lg:flex-row"
      } gap-8 lg:gap-12 items-center`}
    >
      {/* Image */}
      <div className="w-full lg:w-1/2">
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-lg">
          <ImageWithFallback
            src={story.image}
            alt={`${story.product} sourcing from ${story.region}, ${story.state}`}
            fill
            category="sourcing"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="w-full lg:w-1/2">
        {/* Region badge */}
        <div className="inline-flex items-center gap-2 bg-gold-100 text-brown-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {story.region}, {story.state}
        </div>

        {/* Product title */}
        <h3 className="text-2xl md:text-3xl font-heading font-bold text-brown-900 mb-4">
          {story.product}
        </h3>

        {/* Story */}
        <p className="text-brown-600 leading-relaxed text-base md:text-lg">
          {story.story}
        </p>

        {/* Arrow indicator */}
        <div className="mt-6 flex items-center gap-2 text-green-600 font-medium text-sm">
          <span>{story.region}</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
          <span>{story.product}</span>
        </div>
      </div>
    </div>
  );
}
