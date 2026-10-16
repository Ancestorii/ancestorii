'use client';

import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import HeroCard from './HeroCard';
import StoryCard from './StoryCard';
import FeedSidebar, { type TrendingStory, type PopularTopic } from './FeedSidebar';
import FeedHeader from './FeedHeader';
import CategoryTabs from './CategoryTabs';
import type { FeaturedStory } from './ExploreFeed';
import landing from '@/components/landing/landing.module.css';
import feed from '@/components/site/stories-browse/feed.module.css';

export type FeedStory = {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string | null;
  author_name: string;
  author_avatar_url: string | null;
  author_title: string | null;
  cover_url: string | null;
  cover_type: 'image' | 'video' | null;
  voice_note_path: string | null;
  voice_note_duration: string | null;
  media_count: number;
  category: string | null;
  reaction_count: number;
  comment_count: number;
  published_at: string | null;
};

export default function StoryFeed({
  stories,
  featuredStories,
  trendingStories,
  popularTopics,
  isLoggedIn,
  sortBy,
  activeCategory,
  onSortChange,
  onCategoryChange,
  hasMore,
  onLoadMore,
  isLoadingMore,
  userName,
}: {
  stories: FeedStory[];
  featuredStories: FeaturedStory[];
  trendingStories: TrendingStory[];
  popularTopics: PopularTopic[];
  isLoggedIn: boolean;
  sortBy: string;
  activeCategory: string;
  onSortChange: (value: string) => void;
  onCategoryChange: (key: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  userName?: string | null;
}) {
  const router = useRouter();
  const isEmpty = stories.length === 0;

  // Hero, then the topic pills with the sort beside them (FeedHeader renders the hero and the sort).
  // With no stories the feed shows only the topic pills and the empty message, as it always has.
  // The pills keep their place in the tree either way, so they never remount.
  const top = (
    <div className={`${feed.top} ${isEmpty ? feed.topEmpty : ''}`}>
      {!isEmpty && (
        <FeedHeader sortBy={sortBy} onSortChange={onSortChange} activeCategory={activeCategory} isLoggedIn={isLoggedIn} userName={userName} />
      )}
      <CategoryTabs active={activeCategory} onChange={onCategoryChange} />
    </div>
  );

  if (isEmpty) {
    return (
      <>
        {top}
        <section className={feed.feed}>
          <div className={landing.wrap}>
            <div className={feed.empty}>
              <div className={feed.emptyTile}>
                <BookOpen size={44} strokeWidth={2.2} aria-hidden="true" />
              </div>

              <h3 className={feed.emptyTitle}>
                The first story hasn&apos;t been{' '}
                <em>written yet.</em>
              </h3>

              <p className={feed.emptyText}>
                Every family has a memory worth sharing. Be the first to start.
              </p>

              <button
                onClick={() => router.push(isLoggedIn ? '/stories/create' : '/signup')}
                className={`${landing.btnPrimary} ${landing.btnShadow} ${feed.btn} ${feed.emptyBtn}`}
              >
                Share the First Memory
                <span className={landing.arrowTile} aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  const heroStory = stories[0];
  const activeFeatureType = CATEGORY_TO_FEATURE[activeCategory] || 'story_of_the_week';
  const activeFeatured = featuredStories.find((s) => s.feature_type === activeFeatureType);
  const gridStories = activeFeatured
    ? stories.filter((s) => s.id !== activeFeatured.id)
    : stories.slice(1);

  return (
    <>
      {top}
      <section className={feed.feed}>
        <div className={landing.wrap}>
          <div className={feed.layout}>

            {/* ─── Left: stories ─── */}
            <div className={feed.mainCol}>

              {/* Featured Stories — show if one matches the active category */}
              {activeFeatured && (
                <FeaturedSection
                  featuredStories={featuredStories}
                  activeCategory={activeCategory}
                />
              )}

              {/* Fallback hero if no featured story for this category */}
              {!activeFeatured && (
                <HeroCard
                  slug={heroStory.slug}
                  title={heroStory.title}
                  body={heroStory.body}
                  excerpt={heroStory.excerpt}
                  authorName={heroStory.author_name}
                  authorAvatarUrl={heroStory.author_avatar_url}
                  authorTitle={heroStory.author_title}
                  coverUrl={heroStory.cover_url}
                  coverType={heroStory.cover_type}
                  voiceNotePath={heroStory.voice_note_path}
                  voiceNoteDuration={heroStory.voice_note_duration}
                  category={heroStory.category}
                  reactionCount={heroStory.reaction_count}
                  commentCount={heroStory.comment_count}
                  publishedAt={heroStory.published_at}
                  activeCategory={activeCategory}
                />
              )}

              {/* Grid stories */}
              {gridStories.length > 0 && (
                <div className={feed.grid}>
                  {gridStories.map((story) => (
                    <StoryCard
                      key={story.id}
                      featuredLabel={FEATURE_TAB_LABELS[featuredStories.find((f) => f.id === story.id)?.feature_type ?? ''] || null}
                      slug={story.slug}
                      title={story.title}
                      body={story.body}
                      excerpt={story.excerpt}
                      authorName={story.author_name}
                      authorAvatarUrl={story.author_avatar_url}
                      authorTitle={story.author_title}
                      coverUrl={story.cover_url}
                      coverType={story.cover_type}
                      voiceNotePath={story.voice_note_path}
                      voiceNoteDuration={story.voice_note_duration}
                      mediaCount={story.media_count}
                      category={story.category}
                      reactionCount={story.reaction_count}
                      commentCount={story.comment_count}
                      publishedAt={story.published_at}
                    />
                  ))}
                </div>
              )}

              {/* Load more */}
              {hasMore && (
                <div className={feed.more}>
                  <button
                    onClick={onLoadMore}
                    disabled={isLoadingMore}
                    className={feed.moreBtn}
                  >
                    {isLoadingMore ? (
                      <>
                        <span className={feed.spinner} />
                        Loading...
                      </>
                    ) : (
                      'More stories'
                    )}
                  </button>
                </div>
              )}

              {/* End-of-feed CTA, shown until the sidebar appears at 1280px */}
              <div className={feed.endCta}>
                <div className={feed.ctaCard}>
                  <div className={feed.ctaGlowPink} aria-hidden="true" />
                  <div className={feed.ctaGlowBlue} aria-hidden="true" />

                  <span className={feed.ctaBadge}>
                    Preserve a Moment
                  </span>

                  <h3 className={feed.ctaTitle}>
                    Share a memory
                    <span className={feed.ctaAccent}> that lives on.</span>
                  </h3>

                  <p className={feed.ctaText}>
                    It takes two minutes to preserve something that matters
                    forever. Completely free — no credit card, no catch.
                  </p>

                  <button
                    onClick={() =>
                      router.push(isLoggedIn ? '/stories/create' : '/signup')
                    }
                    className={`${landing.btnPrimary} ${landing.btnLight} ${feed.btn} ${feed.ctaBtn}`}
                  >
                    Share Your Memory
                    <span className={landing.arrowTile} aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Right: sidebar — hidden until 1280px, where there's room for it ─── */}
            <div className={feed.side}>
              <div className={feed.sideSticky}>
                <FeedSidebar
                  isLoggedIn={isLoggedIn}
                  trendingStories={trendingStories}
                  popularTopics={popularTopics}
                  onTopicClick={onCategoryChange}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURED STORIES — TABBED SECTION
   ═══════════════════════════════════════════════════════════════ */

const FEATURE_TAB_LABELS: Record<string, string> = {
  story_of_the_week: 'Story of the Week',
  best_family: 'Best Family Story of the Week',
  best_food_and_recipes: 'Best Food & Recipes of the Week',
  best_childhood: 'Best Childhood Story of the Week',
  best_love: 'Best Love Story of the Week',
  best_life_lessons: 'Best Life Lessons of the Week',
  best_traditions: 'Best Traditions Story of the Week',
  best_travel: 'Best Travel Story of the Week',
};


const CATEGORY_TO_FEATURE: Record<string, string> = {
  all: 'story_of_the_week',
  family: 'best_family',
  food_and_recipes: 'best_food_and_recipes',
  childhood: 'best_childhood',
  love: 'best_love',
  life_lessons: 'best_life_lessons',
  traditions: 'best_traditions',
  travel: 'best_travel',
};

function FeaturedSection({
  featuredStories,
  activeCategory,
}: {
  featuredStories: FeaturedStory[];
  activeCategory: string;
}) {
  const featureType = CATEGORY_TO_FEATURE[activeCategory] || 'story_of_the_week';
  const activeStory = featuredStories.find((s) => s.feature_type === featureType);

  if (!activeStory) return null;

  return (
    <HeroCard
      slug={activeStory.slug}
      title={activeStory.title}
      body={activeStory.body}
      excerpt={activeStory.excerpt}
      authorName={activeStory.author_name}
      authorAvatarUrl={activeStory.author_avatar_url}
      authorTitle={activeStory.author_title}
      coverUrl={activeStory.cover_url}
      coverType={activeStory.cover_type}
      voiceNotePath={activeStory.voice_note_path}
      voiceNoteDuration={activeStory.voice_note_duration}
      category={activeStory.category}
      reactionCount={activeStory.reaction_count}
      commentCount={activeStory.comment_count}
      publishedAt={activeStory.published_at}
      activeCategory={activeCategory}
      overlineLabel={FEATURE_TAB_LABELS[activeStory.feature_type] || null}
    />
  );
}
