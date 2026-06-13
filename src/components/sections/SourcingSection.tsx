import SectionHeader from "@/components/ui/SectionHeader";
import SourcingStoryCard from "@/components/ui/SourcingStoryCard";
import { sourcingStories } from "@/data/sourcing";
import Link from "next/link";

export default function SourcingSection() {
  return (
    <section className="py-16 md:py-24 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Our Sourcing Story"
          subtitle="Every product traces back to a region known for its quality and tradition."
        />

        <div className="mt-12 md:mt-16 space-y-16 md:space-y-20">
          {sourcingStories.map((story, index) => (
            <SourcingStoryCard
              key={story.id}
              story={story}
              reverse={index % 2 !== 0}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/sourcing"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold transition-colors duration-200"
          >
            Learn More About Our Sourcing
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
          </Link>
        </div>
      </div>
    </section>
  );
}
