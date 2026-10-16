'use client';

import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import landing from '@/components/landing/landing.module.css';
import site from '@/components/site/site.module.css';
import feed from '@/components/site/stories-browse/feed.module.css';
import { toneClass } from '@/components/site/stories-browse/topicTone';

const CATEGORY_LABELS: Record<string, string> = {
  family: 'Family', food_and_recipes: 'Food & Recipes', childhood: 'Childhood',
  love: 'Love', life_lessons: 'Life Lessons', traditions: 'Traditions', travel: 'Travel',
};

const VALUE_POINTS = [
  "Nan's secret brownie recipe. Dad's story from '98. The holiday that went completely wrong.",
  'Real moments, told in your own words, shared with people who actually care.',
  'Two minutes to share something that matters — completely free.',
];

// Pink, blue, aqua: the colours of the landing's three steps.
const POINT_TONES = [toneClass(0), toneClass(1), toneClass(3)];

// The page hero, plus the sort control (StoryFeed lays the sort out beside the topic pills).
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
    <>
      <section className={feed.hero}>
        <div className={feed.heroInner}>
          <div className={site.heroTop}>
            <span className={`${landing.badge} ${feed.dotPink}`}>
              <span className={landing.badgeDot} />
              {isAll
                ? isLoggedIn ? 'Welcome Back' : 'From Families Everywhere'
                : categoryLabel}
            </span>
          </div>

          <h1 className={`${site.heroTitle} ${feed.heroTitle}`}>
            {isAll
              ? isLoggedIn
                ? <span>Good to see you,{' '}<span className={landing.gradientText}>{userName || 'friend'}.</span></span>
                : <span>Every family has a story{' '}<span className={landing.gradientText}>worth sharing.</span></span>
              : <span>{categoryLabel}{' '}<span className={landing.gradientText}>stories.</span></span>
            }
          </h1>

          {/* Hook line — logged out */}
          {isAll && !isLoggedIn && (
            <p className={site.heroLead}>
              Photos sit on phones. Stories stay in your head. Voices fade.{' '}
              This is where families share the moments that matter.
            </p>
          )}

          {/* Welcome — logged in */}
          {isAll && isLoggedIn && (
            <p className={site.heroLead}>
              Thank you for being part of this community. The stories here exist because people like you chose to share them.{' '}
              <span className={feed.leadStrong}>
                Got a memory on your mind? Two minutes is all it takes.
              </span>
            </p>
          )}

          {!isAll && (
            <p className={site.heroLead}>
              {`Explore ${categoryLabel.toLowerCase()} memories shared by families around the world.`}
            </p>
          )}

          {isAll && (
            <div className={site.heroActions}>
              <button
                onClick={() => router.push(isLoggedIn ? '/stories/create' : '/signup')}
                className={`${landing.btnPrimary} ${landing.btnShadow} ${feed.btn}`}
              >
                Share Your Story
                <span className={landing.arrowTile} aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          )}

          {isAll && !isLoggedIn && (
            <ul className={feed.points}>
              {VALUE_POINTS.map((point, i) => (
                <li key={i} className={`${feed.point} ${POINT_TONES[i]}`}>
                  <span className={feed.pointNum}>0{i + 1}</span>
                  <span className={feed.pointText}>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Sort */}
      <div className={feed.sort}>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort stories"
          className={feed.sortSelect}
        >
          <option value="newest">Newest Stories</option>
          <option value="popular">Most Loved</option>
          <option value="discussed">Most Discussed</option>
        </select>

        <ChevronDown size={16} strokeWidth={2.6} className={feed.sortIcon} aria-hidden="true" />
      </div>
    </>
  );
}
