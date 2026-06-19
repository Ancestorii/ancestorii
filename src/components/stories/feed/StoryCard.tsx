'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Bookmark, Play, ImageIcon } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  family: 'Family',
  food_and_recipes: 'Food & Recipes',
  childhood: 'Childhood',
  love: 'Love',
  life_lessons: 'Life Lessons',
  traditions: 'Traditions',
  travel: 'Travel',
};

export default function StoryCard({
  featuredLabel,
  slug,
  title,
  body,
  excerpt,
  authorName,
  authorAvatarUrl,
  authorTitle,
  coverUrl,
  coverType,
  voiceNotePath,
  voiceNoteDuration,
  mediaCount,
  category,
  reactionCount,
  commentCount,
  publishedAt,
  isLoggedIn,
}: {
  featuredLabel?: string | null;
  slug: string;
  title: string;
  body: string;
  excerpt?: string | null;
  authorName: string;
  authorAvatarUrl: string | null;
  authorTitle?: string | null;
  coverUrl: string | null;
  coverType?: 'image' | 'video' | null;
  voiceNotePath: string | null;
  voiceNoteDuration: string | null;
  mediaCount: number;
  category: string | null;
  reactionCount: number;
  commentCount: number;
  publishedAt: string | null;
  isLoggedIn: boolean;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

 const strippedBody = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const preview = excerpt || (strippedBody.length > 100 ? strippedBody.slice(0, 100).trim() + '…' : strippedBody);

  const initials = authorName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const timeAgo = publishedAt ? getTimeAgo(publishedAt) : '';

  return (
    <Link
      href={`/stories/${slug}`}
     className="group flex flex-col h-full border border-[#EDE8DF] bg-white overflow-hidden transition hover:shadow-[0_6px_24px_rgba(44,36,27,0.06)]"
    >
      {/* Cover image */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#FAF5EB]">
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
            src={coverUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className={`object-cover transition-all duration-500 group-hover:scale-[1.03] ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoadingComplete={() => setImageLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-[#FAF5EB] flex items-center justify-center">
            <p
              className="text-[13px] italic text-[#B8924A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              A memory worth reading
            </p>
          </div>
        )}

        {/* Bottom gradient on image */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1A1612]/40 to-transparent" />

        {/* Voice note overlay */}
        {voiceNotePath && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#1A1612] px-3 py-1.5 z-10">
            <div className="flex items-center justify-center h-[20px] w-[20px] rounded-full bg-[#B8932A]">
              <Play size={9} className="text-[#1A1612] ml-0.5" fill="#1A1612" />
            </div>
            <div className="flex items-center gap-[1.5px]">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[1.5px] bg-white"
                  style={{ height: `${6 + Math.sin(i * 0.9) * 5 + Math.random() * 3}px` }}
                />
              ))}
            </div>
            {voiceNoteDuration && (
              <span className="text-[11px] text-white font-medium tabular-nums">
                {voiceNoteDuration}
              </span>
            )}
          </div>
        )}

        {/* Gallery indicator */}
        {!voiceNotePath && mediaCount > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center justify-center h-[26px] w-[26px] bg-[#1A1612] z-10">
            <ImageIcon size={13} className="text-white" strokeWidth={1.6} />
          </div>
        )}
      </div>

      {/* Content */}
     <div className="flex flex-col flex-1 px-4 py-4 sm:px-5 sm:py-5 bg-[#FFFDF8]">
        <div className="mb-3 min-h-[20px]">
          {featuredLabel ? (
            <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.12em] text-[#C8A557]">
              {featuredLabel}
            </span>
          ) : category && CATEGORY_LABELS[category] ? (
            <span className="inline-flex px-2.5 py-0.5 bg-[#FAF5EB] text-[10px] font-semibold uppercase tracking-[0.06em] text-[#8C857A]">
              {CATEGORY_LABELS[category]}
            </span>
          ) : null}
        </div>

        <h3
          className="text-[17px] sm:text-[19px] leading-[1.2] tracking-[-0.02em] text-[#1A1612] group-hover:text-[#A9782F] transition line-clamp-2"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
        >
          {title}
        </h3>

        <p className="mt-2 text-[12px] sm:text-[13px] leading-[1.7] text-[#6F6255] line-clamp-2">
          {preview}
        </p>

        {/* Author */}
        <div className="mt-auto pt-3 flex items-center gap-2">
         <div className="h-[28px] w-[28px] sm:h-[30px] sm:w-[30px] flex-shrink-0 rounded-full overflow-hidden border border-[#E4D2AE] bg-[#FAF5EB] flex items-center justify-center">
            {authorAvatarUrl ? (
              <Image
                src={authorAvatarUrl}
                alt=""
                width={30}
                height={30}
                className="h-full w-full object-cover"
              />
            ) : (
             <span className="text-[9px] font-bold text-[#A9782F]">{initials}</span>
            )}
          </div>
          <div>
            <span className="text-[11px] sm:text-[12px] font-medium text-[#1A1612] block">
              By {authorName}
            </span>
            {authorTitle && (
              <span className="block text-[10px] sm:text-[11px] text-[#A9782F]">{authorTitle}</span>
            )}
          </div>
          {timeAgo && (
            <>
              <span className="text-[#E4D2AE] text-[10px]">·</span>
              <span className="text-[10px] sm:text-[11px] text-[#9C9488]">{timeAgo}</span>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="mt-3 pt-3 border-t border-[#EDE8DF] flex items-center gap-5">
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#1A1612]">
            <Heart size={14} strokeWidth={1.6} className="text-[#D94F4F]" fill="#D94F4F" />
            {reactionCount}
          </span>
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#1A1612]">
            <MessageCircle size={14} strokeWidth={1.6} className="text-[#5A87A8]" fill="#5A87A8" />
            {commentCount}
          </span>
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
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}