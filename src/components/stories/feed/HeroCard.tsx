'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Play, ArrowRight } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  family: 'Family', food_and_recipes: 'Food & Recipes', childhood: 'Childhood',
  love: 'Love', life_lessons: 'Life Lessons', traditions: 'Traditions', travel: 'Travel',
};

export default function HeroCard({
 slug, title, body, excerpt, authorName, authorAvatarUrl, authorTitle, coverUrl,
  voiceNotePath, voiceNoteDuration, coverType, category, reactionCount,
  commentCount, publishedAt, isLoggedIn, activeCategory, overlineLabel,
}: {
  slug: string; title: string; body: string; excerpt?: string | null; authorName: string;
  authorAvatarUrl: string | null; authorTitle?: string | null; coverUrl: string | null;
  coverType?: 'image' | 'video' | null;
  voiceNotePath: string | null; voiceNoteDuration: string | null;
  category: string | null; reactionCount: number; commentCount: number;
  publishedAt: string | null; isLoggedIn: boolean; activeCategory?: string;
  overlineLabel?: string | null;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

 const strippedBody = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const preview = excerpt || (strippedBody.length > 260 ? strippedBody.slice(0, 260).trim() + '…' : strippedBody);
  const initials = authorName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const timeAgo = publishedAt ? getTimeAgo(publishedAt) : '';

  const handleImageLoad = (img: HTMLImageElement) => {
    setImageLoaded(true);
    if (img.naturalHeight > img.naturalWidth) setIsPortrait(true);
  };

  return (
    <Link href={`/stories/${slug}`} className="group block border border-[#EDE8DF] overflow-hidden">
      <div className={`flex flex-col lg:flex-row ${isPortrait ? 'lg:min-h-[460px]' : 'lg:min-h-[400px]'}`}>

        {/* ── Content — takes 2/3 on desktop ── */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-12 xl:px-14 2xl:px-16 py-8 sm:py-10 lg:py-12 bg-white order-last lg:order-first">

          {/* Overline */}
          <div className="flex items-center gap-2.5 mb-5">
            <span
              className="text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] font-bold uppercase tracking-[0.14em] text-[#C8A557]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {overlineLabel
                ? overlineLabel
                : (!activeCategory || activeCategory === 'all')
                  ? 'Latest Story'
                  : `Latest in ${CATEGORY_LABELS[activeCategory] || activeCategory}`
              }
            </span>
            {category && CATEGORY_LABELS[category] && (
              <>
                <span className="text-[#D4CBC0]">·</span>
                <span className="text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] font-medium uppercase tracking-[0.1em] text-[#9C9488]">
                  {CATEGORY_LABELS[category]}
                </span>
              </>
            )}
          </div>

          {/* Title — newspaper scale */}
          <h2
  className="text-[28px] sm:text-[36px] md:text-[42px] lg:text-[48px] xl:text-[54px] 2xl:text-[60px] leading-[1.0] tracking-[-0.04em] text-[#1A1612]"
  style={{
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
  }}
>
  {title}
</h2>

          {/* Preview — bigger, more lines */}
          <p
            className="mt-4 sm:mt-5 text-[15px] sm:text-[16px] lg:text-[17px] xl:text-[18px] 2xl:text-[19px] leading-[1.8] text-[#6F6255] line-clamp-4"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {preview}
          </p>

          {/* Author */}
          <div className="mt-6 lg:mt-8 flex items-center gap-3">
            <div className="h-[40px] w-[40px] sm:h-[44px] sm:w-[44px] lg:h-[48px] lg:w-[48px] flex-shrink-0 rounded-full overflow-hidden border-[1.5px] border-[#E4D2AE] bg-[#FAF5EB] flex items-center justify-center">
              {authorAvatarUrl ? (
                <Image src={authorAvatarUrl} alt="" width={48} height={48} className="h-full w-full object-cover" />
              ) : (
                <span className="text-[11px] lg:text-[13px] font-bold text-[#A9782F]">{initials}</span>
              )}
            </div>
            <div>
              <span className="text-[14px] sm:text-[15px] lg:text-[16px] xl:text-[17px] font-semibold text-[#1A1612] block">{authorName}</span>
              {authorTitle && (
                <span className="block text-[12px] sm:text-[13px] lg:text-[14px] text-[#A9782F]">{authorTitle}</span>
              )}
              {timeAgo && (
                <span className="block text-[12px] sm:text-[13px] lg:text-[14px] text-[#9C9488]">{timeAgo}</span>
              )}
            </div>
          </div>

          {/* Stats + CTA */}
          <div className="mt-6 lg:mt-8 pt-5 border-t border-[#F0EBE3] flex items-center justify-between">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-2 text-[14px] lg:text-[15px] xl:text-[16px] font-medium text-[#1A1612]">
                <Heart size={18} strokeWidth={1.6} className="text-[#D94F4F]" fill="#D94F4F" />{reactionCount}
              </span>
              <span className="flex items-center gap-2 text-[14px] lg:text-[15px] xl:text-[16px] font-medium text-[#1A1612]">
                <MessageCircle size={18} strokeWidth={1.6} className="text-[#5A87A8]" fill="#5A87A8" />{commentCount}
              </span>
            </div>
            <span
              className="flex items-center gap-2 text-[14px] lg:text-[15px] xl:text-[16px] font-bold text-[#A9782F] group-hover:gap-3 transition-all"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Read story <ArrowRight size={16} />
            </span>
          </div>
        </div>

        {/* ── Image — takes 1/3 on desktop ── */}
        <div
          className={`relative overflow-hidden bg-[#F5F0E8] order-first lg:order-last flex-shrink-0 ${
            isPortrait
              ? 'w-full lg:w-[33%] aspect-[3/4] sm:aspect-[4/5] lg:aspect-auto'
              : 'w-full lg:w-[33%] aspect-[16/10] lg:aspect-auto'
          }`}
        >
          {coverUrl && coverType === 'video' ? (
            <video
              src={coverUrl}
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : coverUrl ? (
            <Image
              src={coverUrl} alt="" fill priority
              sizes="(max-width: 1024px) 100vw, 33vw"
              className={`object-cover transition-all duration-700 group-hover:scale-[1.02] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoadingComplete={handleImageLoad}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#FAF5EB] to-[#E8DCC8] flex items-center justify-center">
              <div className="text-center">
                <div className="h-10 w-10 mx-auto border border-[#D8BE8B]/40 flex items-center justify-center mb-2">
                  <Heart size={16} className="text-[#C8A557]/50" />
                </div>
                <p className="text-[14px] italic text-[#B8924A]/70" style={{ fontFamily: "'Playfair Display', serif" }}>
                  A memory worth reading
                </p>
              </div>
            </div>
          )}
          {voiceNotePath && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#1A1612]/80 backdrop-blur-sm px-3 py-2">
              <Play size={10} className="text-[#C8A557]" fill="#C8A557" />
              {voiceNoteDuration && <span className="text-[11px] text-white font-medium tabular-nums">{voiceNoteDuration}</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}