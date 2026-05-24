'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PenLine, Heart, MessageCircle, ArrowUpRight, Users, UtensilsCrossed, Baby, Sparkles, Flame, Compass } from 'lucide-react';

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
    <aside className="space-y-4 xl:space-y-5">
      {/* ───────────────── CTA Box ───────────────── */}
      <div className="border border-[#2E2820] bg-[#1A1612] overflow-hidden">
        <div className="relative w-full aspect-[16/10] overflow-hidden">
          <Image
            src="/CTA.png"
            alt="Vintage family photographs"
            fill
            sizes="360px"
            className="object-cover"
          />
        </div>

        <div className="px-5 pt-5 pb-5 xl:px-6 xl:pt-6 xl:pb-6">
          <span
            className="block mb-2 text-[10px] xl:text-[11px] tracking-[0.16em] uppercase text-[#B8932A] font-medium"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Preserve a Moment
          </span>

          <h3
            className="text-[18px] xl:text-[20px] leading-[1.1] tracking-[-0.03em] text-[#FFFFFF]"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
          >
            Share a memory
            <span className="italic text-[#B8932A]"> that lives on.</span>
          </h3>

          <p
            className="mt-2.5 xl:mt-3 text-[12px] xl:text-[13px] leading-[1.7] text-[#FFFFFF]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            It takes two minutes to preserve something that matters
            forever. Completely free — no credit card, no catch.
          </p>

          <button
            onClick={() =>
              router.push(isLoggedIn ? '/stories/create' : '/signup')
            }
            className="group mt-4 xl:mt-5 inline-flex items-center gap-2 text-[11px] xl:text-[12px] font-medium tracking-[0.08em] uppercase text-[#FFFFFF] transition hover:text-[#D8BE8B]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
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

      {/* ───────────────── Trending Stories Box ───────────────── */}
      {trendingStories.length > 0 && (
        <div className="border border-[#EDE8DF] bg-white">
          <div className="px-5 pt-5 xl:px-6 xl:pt-6">
            <div className="mb-3.5 xl:mb-4">
              <h4
                className="text-[16px] xl:text-[18px] leading-none tracking-[-0.03em] text-[#181512]"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
              >
                Trending Stories
              </h4>
            </div>
          </div>

          <div className="px-5 pb-5 xl:px-6 xl:pb-6">
            {trendingStories.map((story, i) => (
              <Link
                key={story.slug}
                href={`/stories/${story.slug}`}
                className={`group flex items-start gap-3 py-2.5 xl:py-3 ${
                  i < trendingStories.length - 1
                    ? 'border-b border-[#F1ECE3]'
                    : ''
                }`}
              >
                <div className="relative h-[46px] w-[46px] xl:h-[52px] xl:w-[52px] flex-shrink-0 overflow-hidden bg-[#F6F1E8]">
                  {story.coverUrl && story.coverType === 'video' ? (
                    <video
                      src={story.coverUrl}
                      muted
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : story.coverUrl ? (
                    <Image
                      src={story.coverUrl}
                      alt=""
                      fill
                      sizes="52px"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#F6F1E8]" />
                  )}
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <p
                    className="text-[12px] xl:text-[13px] leading-[1.45] font-medium text-[#1A1612] transition group-hover:text-[#A9782F] line-clamp-2"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {story.title}
                  </p>

                  <span
                    className="inline-flex items-center gap-3 mt-1.5 xl:mt-2 text-[10px] xl:text-[11px] text-[#9C9488]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Heart size={11} strokeWidth={1.7} className="text-[#D94F4F]" fill="#D94F4F" />
                      {story.reactionCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle size={11} strokeWidth={1.7} className="text-[#5A87A8]" fill="#5A87A8" />
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
      <div className="border border-[#EDE8DF] bg-white">
        <div className="px-5 pt-5 xl:px-6 xl:pt-6">
          <div className="mb-3.5 xl:mb-4">
            <h4
              className="text-[16px] xl:text-[18px] leading-none tracking-[-0.03em] text-[#181512]"
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
            >
              Popular Topics
            </h4>
          </div>
        </div>

        <div className="px-5 pb-5 xl:px-6 xl:pb-6">
          {popularTopics.length > 0 ? (
            <>
              <div className="space-y-0.5 xl:space-y-1">
                {popularTopics.map((topic) => {
                  const TopicIcon = TOPIC_ICONS[topic.key] || Heart;
                  return (
                    <button
                      key={topic.key}
                      onClick={() => onTopicClick(topic.key)}
                      className="group flex items-center justify-between w-full py-1.5 xl:py-2 text-left"
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <TopicIcon size={15} strokeWidth={1.6} className="text-[#9C9488] group-hover:text-[#A9782F] transition flex-shrink-0" />
                        <span
                          className="text-[12px] xl:text-[13px] font-medium text-[#1A1612] transition group-hover:text-[#A9782F] truncate"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {topic.label}
                        </span>
                      </span>

                      <span
                        className="text-[10px] xl:text-[11px] text-[#9C9488] flex-shrink-0"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {formatCount(topic.storyCount)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onTopicClick('all')}
                className="mt-3 xl:mt-4 text-[11px] xl:text-[12px] font-medium tracking-[0.05em] text-[#A9782F] transition hover:text-[#8A6325]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                View all topics
              </button>
            </>
          ) : (
            <p
              className="text-[12px] xl:text-[13px] italic leading-[1.6] text-[#9C9488]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Topics appear as stories are shared.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}