'use client';

import { useRef } from 'react';
import feed from '@/components/site/stories-browse/feed.module.css';

const CATEGORIES = [
  { key: 'all', label: 'All Stories' },
  { key: 'family', label: 'Family' },
  { key: 'food_and_recipes', label: 'Food & Recipes' },
  { key: 'childhood', label: 'Childhood' },
  { key: 'love', label: 'Love' },
  { key: 'life_lessons', label: 'Life Lessons' },
  { key: 'traditions', label: 'Traditions' },
  { key: 'travel', label: 'Travel' },
];

// Topic filters as the landing's pills: the active one is ink.
export default function CategoryTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (key: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className={feed.tabs}>
      <div
        ref={scrollRef}
        className={feed.tabsScroll}
        data-lenis-prevent
        role="group"
        aria-label="Story topics"
      >
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => onChange(cat.key)}
              aria-pressed={isActive}
              className={`${feed.tab} ${isActive ? feed.tabActive : ''}`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
