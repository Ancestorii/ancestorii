'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BookOpen, PenLine, ArrowUpRight } from 'lucide-react';
import HeroCard from './HeroCard';
import StoryCard from './StoryCard';
import FeedSidebar, { type TrendingStory, type PopularTopic } from './FeedSidebar';
import FeedHeader from './FeedHeader';
import type { FeaturedStory } from './ExploreFeed';

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

  if (stories.length === 0) {
    return (
      <section className="w-full bg-white px-6 md:px-10 lg:px-20 xl:px-28 py-20">
        <div className="mx-auto max-w-[480px] text-center">
          <div className="mx-auto mb-6 flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#FAF5EB]">
            <BookOpen className="h-7 w-7 text-[#A9782F]" strokeWidth={1.5} />
          </div>

          <h3
            className="text-[26px] leading-[1.15] tracking-[-0.02em] text-[#1A1612]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            The first story hasn&apos;t been{' '}
            <em className="italic text-[#A9782F]">written yet.</em>
          </h3>

          <p className="mt-4 text-[15px] leading-[1.8] text-[#6F6255]">
            Every family has a memory worth sharing. Be the first to start.
          </p>

          <button
            onClick={() => router.push(isLoggedIn ? '/stories/create' : '/signup')}
            className="mt-7 inline-flex h-[52px] items-center justify-center gap-2.5 px-10 font-serif text-[1.05rem] text-white shadow-md transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #D8BE8B 0%, #A9782F 100%)' }}
          >
            <PenLine size={16} strokeWidth={1.8} />
            Share the First Memory
          </button>
        </div>
      </section>
    );
  }

  const heroStory = stories[0];
  const activeFeatureType = CATEGORY_TO_FEATURE[activeCategory] || 'story_of_the_week';
  const activeFeatured = featuredStories.find((s) => s.feature_type === activeFeatureType);
  const gridStories = activeFeatured
    ? stories.filter((s) => s.id !== activeFeatured.id)
    : stories.slice(1);

  return (
    <section className="w-full bg-white">
      <div className="w-full px-[clamp(1.25rem,4vw,7rem)] py-8 sm:py-10">
        <div className="flex flex-col xl:flex-row gap-8 xl:gap-12">

          {/* ─── Left: header + stories ─── */}
          <div className="flex-1 min-w-0">
          <FeedHeader sortBy={sortBy} onSortChange={onSortChange} activeCategory={activeCategory} isLoggedIn={isLoggedIn} userName={userName} />

            {/* Featured Stories — show if one matches the active category */}
            {activeFeatured && (
              <FeaturedSection
                featuredStories={featuredStories}
                isLoggedIn={isLoggedIn}
                activeCategory={activeCategory}
              />
            )}

            {/* Fallback hero if no featured story for this category */}
            {!activeFeatured && (
              <div className="mb-6">
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
                  isLoggedIn={isLoggedIn}
                  activeCategory={activeCategory}
                />
              </div>
            )}

            {/* Grid stories */}
            {gridStories.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-6 mt-10">
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
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            )}

            {/* Load more */}
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2.5 px-10 py-3.5 border-2 border-[#EDE8DF] bg-white font-serif text-[1rem] text-[#3d3428] transition hover:border-[#B8932A] hover:text-[#1A1612] disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-[#B8932A] border-t-transparent animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'More stories'
                  )}
                </button>
              </div>
            )}

            {/* Mobile CTA — end of feed, shown until the sidebar appears at xl */}
            <div className="xl:hidden mt-10 border border-[#2E2820] bg-[#1A1612] overflow-hidden">
              <div className="relative w-full aspect-[16/10] overflow-hidden">
                <Image
                  src="/CTA.png"
                  alt="Vintage family photographs"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>

              <div className="px-5 py-5 sm:px-6 sm:py-6">
                <span className="block mb-2 text-[10px] sm:text-[11px] tracking-[0.16em] uppercase text-[#B8932A] font-medium">
                  Preserve a Moment
                </span>

                <h3
                  className="text-[24px] sm:text-[28px] leading-[1.05] tracking-[-0.04em] text-[#F7F2EA]"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 600,
                  }}
                >
                  Share a memory
                  <span className="italic text-[#D8BE8B]"> that lives on.</span>
                </h3>

                <p className="mt-2.5 text-[13px] sm:text-[14px] leading-[1.7] text-white">
                  It takes two minutes to preserve something that matters
                  forever. Completely free — no credit card, no catch.
                </p>

                <button
                  onClick={() =>
                    router.push(isLoggedIn ? '/stories/create' : '/signup')
                  }
                  className="group mt-5 inline-flex items-center gap-2 text-[12px] sm:text-[13px] font-medium tracking-[0.08em] uppercase text-white transition hover:text-[#D8BE8B]"
                >
                  <PenLine size={13} strokeWidth={1.8} />
                  Share Your Memory
                  <ArrowUpRight
                    size={13}
                    className="transition-transform duration-200 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ─── Right: sidebar — hidden until xl, where there's room for it ─── */}
          <div className="hidden xl:block w-[320px] flex-shrink-0">
            <div className="sticky top-[100px]">
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
  isLoggedIn,
  activeCategory,
}: {
  featuredStories: FeaturedStory[];
  isLoggedIn: boolean;
  activeCategory: string;
}) {
  const featureType = CATEGORY_TO_FEATURE[activeCategory] || 'story_of_the_week';
  const activeStory = featuredStories.find((s) => s.feature_type === featureType);

  if (!activeStory) return null;

  return (
    <div className="mb-8">
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
        isLoggedIn={isLoggedIn}
        activeCategory={activeCategory}
        overlineLabel={FEATURE_TAB_LABELS[activeStory.feature_type] || null}
      />
    </div>
  );
}