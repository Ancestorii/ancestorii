'use client';

import { useRef } from 'react';
import {
  BookOpen,
  Users,
  UtensilsCrossed,
  Baby,
  Heart,
  Sparkles,
  Flame,
  Compass,
} from 'lucide-react';

const CATEGORIES = [
  { key: 'all', label: 'All Stories', Icon: BookOpen },
  { key: 'family', label: 'Family', Icon: Users },
  { key: 'food_and_recipes', label: 'Food & Recipes', Icon: UtensilsCrossed },
  { key: 'childhood', label: 'Childhood', Icon: Baby },
  { key: 'love', label: 'Love', Icon: Heart },
  { key: 'life_lessons', label: 'Life Lessons', Icon: Sparkles },
  { key: 'traditions', label: 'Traditions', Icon: Flame },
  { key: 'travel', label: 'Travel', Icon: Compass },
];

export default function CategoryTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (key: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white border-b border-[#EDE8DF]">
      <div className="w-full px-6 md:px-10 lg:px-20 xl:px-28">
        <div
          ref={scrollRef}
          className="flex items-center justify-start xl:justify-center gap-1 sm:gap-2 overflow-x-auto py-4 sm:py-5"
          data-lenis-prevent
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = active === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onChange(cat.key)}
                className={`relative flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 text-[0.95rem] sm:text-[1.05rem] tracking-wide whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-[#FAF5EB] text-[#A06A1C] font-medium'
                    : 'text-[#6F6255] hover:bg-[#FAF5EB] hover:text-[#3d3428]'
                }`}
              >
                <cat.Icon
                  size={18}
                  strokeWidth={1.6}
                  className={isActive ? 'text-[#B8924A]' : 'text-[#9C9488]'}
                />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}