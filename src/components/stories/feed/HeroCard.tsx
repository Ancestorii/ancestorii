'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Play, ArrowRight } from 'lucide-react';
import feed from '@/components/site/stories-browse/feed.module.css';
import { getTimeAgo, plainTextFromHtml } from '@/lib/stories/format';

const CATEGORY_LABELS: Record<string, string> = {
  family: 'Family', food_and_recipes: 'Food & Recipes', childhood: 'Childhood',
  love: 'Love', life_lessons: 'Life Lessons', traditions: 'Traditions', travel: 'Travel',
};

// The lead story as the landing's featured card: the photo in a pink frame with a white
// badge, the words in white on pink beside it (below it on phones).
export default function HeroCard({
 slug, title, body, excerpt, authorName, authorAvatarUrl, authorTitle, coverUrl,
  voiceNotePath, voiceNoteDuration, coverType, category, reactionCount,
  commentCount, publishedAt, activeCategory, overlineLabel,
}: {
  slug: string; title: string; body: string; excerpt?: string | null; authorName: string;
  authorAvatarUrl: string | null; authorTitle?: string | null; coverUrl: string | null;
  coverType?: 'image' | 'video' | null;
  voiceNotePath: string | null; voiceNoteDuration: string | null;
  category: string | null; reactionCount: number; commentCount: number;
  publishedAt: string | null; activeCategory?: string;
  overlineLabel?: string | null;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

 const strippedBody = plainTextFromHtml(body);
  const preview = excerpt || (strippedBody.length > 260 ? strippedBody.slice(0, 260).trim() + '…' : strippedBody);
  const initials = authorName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const timeAgo = publishedAt ? getTimeAgo(publishedAt) : '';

  const handleImageLoad = (img: HTMLImageElement) => {
    setImageLoaded(true);
    if (img.naturalHeight > img.naturalWidth) setIsPortrait(true);
  };

  return (
    <Link
      href={`/stories/${slug}`}
      className={`${feed.featured} ${isPortrait ? feed.featuredPortrait : ''}`}
    >
      {/* ── Photo ── */}
      <div className={feed.featuredMedia}>
        {coverUrl && coverType === 'video' ? (
          <video
            src={coverUrl}
            muted
            playsInline
            preload="metadata"
            className={feed.coverVideo}
          />
        ) : coverUrl ? (
          <Image
            src={coverUrl} alt="" fill preload
            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 54vw, 470px"
            className={`${feed.cover} ${feed.featuredCover} ${imageLoaded ? feed.coverShown : feed.coverHidden}`}
            onLoad={(e) => handleImageLoad(e.currentTarget)}
          />
        ) : (
          <div className={`${feed.fallback} ${feed.fallbackLight}`}>
            <span className={feed.fallbackMark} aria-hidden="true">
              “
            </span>
            <p className={feed.fallbackText}>A memory worth reading</p>
          </div>
        )}

        {/* Overline */}
        <span className={feed.featuredBadge}>
          {overlineLabel
            ? overlineLabel
            : (!activeCategory || activeCategory === 'all')
              ? 'Latest Story'
              : `Latest in ${CATEGORY_LABELS[activeCategory] || activeCategory}`
          }
          {category && CATEGORY_LABELS[category] && (
            <> · {CATEGORY_LABELS[category]}</>
          )}
        </span>

        {voiceNotePath && (
          <span className={`${feed.voice} ${feed.voiceTop}`}>
            <span className={feed.voicePlay}>
              <Play size={10} fill="currentColor" aria-hidden="true" />
            </span>
            {voiceNoteDuration && <span className={feed.voiceTime}>{voiceNoteDuration}</span>}
          </span>
        )}
      </div>

      {/* ── Words ── */}
      <div className={feed.featuredBody}>
        <h2 className={feed.featuredTitle}>{title}</h2>

        <p className={feed.featuredExcerpt}>{preview}</p>

        {/* Author */}
        <div className={feed.featuredAuthor}>
          <div className={feed.featuredAvatar}>
            {authorAvatarUrl ? (
              <Image src={authorAvatarUrl} alt="" width={48} height={48} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className={feed.authorText}>
            <span className={feed.authorName}>{authorName}</span>
            {authorTitle && (
              <span className={feed.authorMeta}>{authorTitle}</span>
            )}
            {timeAgo && (
              // Counted from now, so the browser can land a minute past the server
              <span className={feed.authorMeta} suppressHydrationWarning>{timeAgo}</span>
            )}
          </div>
        </div>

        {/* Stats + CTA */}
        <div className={feed.featuredMeta}>
          <div className={feed.stats}>
            <span className={feed.stat}>
              <Heart size={18} strokeWidth={2} fill="currentColor" aria-hidden="true" />{reactionCount}
            </span>
            <span className={feed.stat}>
              <MessageCircle size={18} strokeWidth={2} fill="currentColor" aria-hidden="true" />{commentCount}
            </span>
          </div>
          <span className={feed.readMore}>
            Read story <ArrowRight size={16} strokeWidth={2.6} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
