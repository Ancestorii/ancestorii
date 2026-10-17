'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Users, UtensilsCrossed, Baby, Sparkles, Flame, Compass } from 'lucide-react';
import landing from '@/components/landing/landing.module.css';
import feed from '@/components/site/stories-browse/feed.module.css';
import { topicToneClass } from '@/components/site/stories-browse/topicTone';

export type TrendingStory = {
  slug: string;
  title: string;
  coverUrl: string | null;
  coverType: 'image' | 'video' | null;
  reactionCount: number;
  commentCount: number;
};

export type PopularTopic = {
  key: string;
  label: string;
  storyCount: number;
};


const TOPIC_ICONS: Record<string, typeof Heart> = {
  family: Users,
  food_and_recipes: UtensilsCrossed,
  childhood: Baby,
  love: Heart,
  life_lessons: Sparkles,
  traditions: Flame,
  travel: Compass,
};

export default function FeedSidebar({
  isLoggedIn,
  trendingStories,
  popularTopics,
  onTopicClick,
}: {
  isLoggedIn: boolean;
  trendingStories: TrendingStory[];
  popularTopics: PopularTopic[];
  onTopicClick: (key: string) => void;
}) {
  const router = useRouter();

  return (
    <aside className={feed.sideStack}>
      {/* ───────────────── CTA Box ───────────────── */}
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

      {/* ───────────────── Trending Stories Box ───────────────── */}
      {trendingStories.length > 0 && (
        <div className={feed.sideCard}>
          <h4 className={feed.sideTitle}>
            Trending Stories
          </h4>

          <div className={feed.trendList}>
            {trendingStories.map((story) => (
              <Link
                key={story.slug}
                href={`/stories/${story.slug}`}
                // A story page is rendered per request, so a prefetch brought nothing back.
                prefetch={false}
                className={feed.trendItem}
              >
                <div className={feed.trendThumb}>
                  {story.coverUrl && story.coverType === 'video' ? (
                    <video
                      src={story.coverUrl}
                      muted
                      playsInline
                      preload="metadata"
                      className={feed.coverVideo}
                    />
                  ) : story.coverUrl ? (
                    <Image
                      src={story.coverUrl}
                      alt=""
                      fill
                      sizes="58px"
                      className={feed.cover}
                    />
                  ) : (
                    <div className={feed.trendFallback} aria-hidden="true">
                      “
                    </div>
                  )}
                </div>

                <div className={feed.trendText}>
                  <p className={feed.trendTitle}>
                    {story.title}
                  </p>

                  <span className={feed.trendStats}>
                    <span className={feed.stat}>
                      <Heart size={13} strokeWidth={2} fill="currentColor" className={feed.heart} aria-hidden="true" />
                      {story.reactionCount}
                    </span>
                    <span className={feed.stat}>
                      <MessageCircle size={13} strokeWidth={2} fill="currentColor" className={feed.comment} aria-hidden="true" />
                      {story.commentCount}
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────── Popular Topics Box ───────────────── */}
      <div className={feed.sideCard}>
        <h4 className={feed.sideTitle}>
          Popular Topics
        </h4>

        {popularTopics.length > 0 ? (
          <>
            <div className={feed.topicList}>
              {popularTopics.map((topic) => {
                const TopicIcon = TOPIC_ICONS[topic.key] || Heart;
                return (
                  <button
                    key={topic.key}
                    onClick={() => onTopicClick(topic.key)}
                    className={`${feed.topicRow} ${topicToneClass(topic.key)}`}
                  >
                    <span className={feed.topicRowLabel}>
                      <span className={feed.topicTile}>
                        <TopicIcon size={18} strokeWidth={2.4} aria-hidden="true" />
                      </span>
                      <span className={feed.topicRowText}>
                        {topic.label}
                      </span>
                    </span>

                    <span className={feed.topicCount}>
                      {formatCount(topic.storyCount)}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onTopicClick('all')}
              className={feed.viewAll}
            >
              View all topics
            </button>
          </>
        ) : (
          <p className={feed.sideEmpty}>
            Topics appear as stories are shared.
          </p>
        )}
      </div>
    </aside>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
