'use client';

import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CATEGORY_LABELS: Record<string, string> = {
  family: 'Family', food_and_recipes: 'Food & Recipes', childhood: 'Childhood',
  love: 'Love', life_lessons: 'Life Lessons', traditions: 'Traditions', travel: 'Travel',
};

const VALUE_POINTS = [
  "Nan's secret brownie recipe. Dad's story from '98. The holiday that went completely wrong.",
  'Real moments, told in your own words, shared with people who actually care.',
  'Two minutes to share something that matters — completely free.',
];

export default function FeedHeader({
  sortBy,
  onSortChange,
  activeCategory,
  isLoggedIn,
  userName,
}: {
  sortBy: string;
  onSortChange: (value: string) => void;
  activeCategory: string;
  isLoggedIn: boolean;
  userName?: string | null;
}) {
  const router = useRouter();
  const isAll = activeCategory === 'all';
  const categoryLabel = CATEGORY_LABELS[activeCategory] || '';

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-6 sm:pb-7 mb-6 sm:mb-8 border-b border-[#ECE5D8]">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 lg:gap-8">
        {/* Title block */}
        <div className="max-w-full">
          <div className="flex items-center gap-2.5 mb-2 sm:mb-3">
            <div className="h-px w-4 sm:w-5 bg-[#B8932A]" />
            <span
              className="text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {isAll
                ? isLoggedIn ? 'Welcome Back' : 'From Families Everywhere'
                : categoryLabel}
            </span>
          </div>

          <h1
            className="text-[28px] sm:text-[38px] md:text-[46px] lg:text-[52px] leading-[0.92] tracking-[-0.04em] text-[#181512] whitespace-normal"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
            }}
          >
            {isAll
              ? isLoggedIn
                ? <span>Good to see you,<span className="italic text-[#A9782F]"> {userName || 'friend'}.</span></span>
                : <span>Every family has a story<span className="italic text-[#A9782F]"> worth sharing.</span></span>
              : <span>{categoryLabel}{' '}<span className="italic text-[#A9782F]">stories.</span></span>
            }
          </h1>

          {/* Hook line — logged out */}
          {isAll && !isLoggedIn && (
            <>
              <p
                className="mt-3 sm:mt-4 text-[14px] sm:text-[15px] lg:text-[16px] leading-[1.7] text-[#4A4030] max-w-[560px]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Photos sit on phones. Stories stay in your head. Voices fade.{' '}
                <span className="text-[#B8932A]">This is where families share the moments that matter.</span>
              </p>

              <ul className="mt-4 sm:mt-5 space-y-0">
                {VALUE_POINTS.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 py-2 sm:py-2.5 border-b border-[rgba(95,78,43,0.08)] last:border-b-0"
                  >
                    <span
                      className="flex-shrink-0 text-[11px] sm:text-[12px] font-semibold text-[#B8932A] mt-[1px]"
                      style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.08em', minWidth: '1.4rem' }}
                    >
                      0{i + 1}
                    </span>
                    <span
                      className="text-[13px] sm:text-[14px] leading-[1.6] text-[#4A4030]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Welcome — logged in */}
          {isAll && isLoggedIn && (
            <div className="mt-3 sm:mt-4 max-w-[560px]">
              <p
                className="text-[14px] sm:text-[15px] lg:text-[16px] leading-[1.7] text-[#4A4030]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Thank you for being part of this community. The stories here exist because people like you chose to share them.{' '}
                <span className="text-[#B8932A]">
                  Got a memory on your mind? Two minutes is all it takes.
                </span>
              </p>
            </div>
          )}

          {!isAll && (
            <p className="mt-3 sm:mt-4 text-[14px] sm:text-[15px] lg:text-[16px] xl:text-[17px] leading-[1.7] text-[#6F6255] max-w-[560px]">
              {`Explore ${categoryLabel.toLowerCase()} memories shared by families around the world.`}
            </p>
          )}
        </div>

        {/* Controls: CTA + Sort */}
        <div className="flex items-center gap-3 flex-shrink-0 self-start lg:self-end">
          {isAll && (
            <button
              onClick={() => router.push(isLoggedIn ? '/stories/create' : '/signup')}
              className="group relative overflow-hidden px-5 py-2.5 text-[12px] sm:text-[13px] font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#1A1612]/20 active:scale-[0.97]"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.06em',
                background: 'linear-gradient(135deg, #1A1612 0%, #2E2820 100%)',
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Share Your Story
              </span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, #2E2820 0%, #3A332B 50%, #2E2820 100%)',
                }}
              />
            </button>
          )}

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white border border-[#E0D6C8] px-4 pr-9 py-2.5 text-[12px] sm:text-[13px] font-medium text-[#5E544A] cursor-pointer transition-all duration-200 hover:border-[#B99252] focus:outline-none focus:border-[#A9782F]"
            >
              <option value="newest">Newest Stories</option>
              <option value="popular">Most Loved</option>
              <option value="discussed">Most Discussed</option>
            </select>

            <ChevronDown
              size={13}
              strokeWidth={2}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F8477] pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}