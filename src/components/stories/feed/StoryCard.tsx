'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Play, ImageIcon } from 'lucide-react';
import feed from '@/components/site/stories-browse/feed.module.css';
import { topicToneClass } from '@/components/site/stories-browse/topicTone';
import { getTimeAgo, plainTextFromHtml } from '@/lib/stories/format';

const CATEGORY_LABELS: Record<string, string> = {
  family: 'Family',
  food_and_recipes: 'Food & Recipes',
  childhood: 'Childhood',
  love: 'Love',
  life_lessons: 'Life Lessons',
  traditions: 'Traditions',
  travel: 'Travel',
};

// The landing's story card: white with the hairline ring, the topic's colour square
// on the label (and on the panel when a story has no photo).
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
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

 const strippedBody = plainTextFromHtml(body);
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
      className={`${feed.card} ${topicToneClass(category)}`}
    >
      {/* Cover image */}
      <div className={feed.cardMedia}>
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
            src={coverUrl}
            alt=""
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 959px) 50vw, (max-width: 1279px) 34vw, 420px"
            className={`${feed.cover} ${imageLoaded ? feed.coverShown : feed.coverHidden}`}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className={feed.fallback}>
            <span className={feed.fallbackMark} aria-hidden="true">
              “
            </span>
            <p className={feed.fallbackText}>A memory worth reading</p>
          </div>
        )}

        {/* Voice note overlay */}
        {voiceNotePath && (
          <div className={feed.voice}>
            <div className={feed.voicePlay}>
              <Play size={9} fill="currentColor" aria-hidden="true" />
            </div>
            <div className={feed.wave}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={feed.waveBar}
                  style={{ height: `${Math.round(6 + Math.sin(i * 0.9) * 5 + (i % 3))}px` }}
                />
              ))}
            </div>
            {voiceNoteDuration && (
              <span className={feed.voiceTime}>
                {voiceNoteDuration}
              </span>
            )}
          </div>
        )}

        {/* Gallery indicator */}
        {!voiceNotePath && mediaCount > 1 && (
          <div className={feed.gallery}>
            <ImageIcon size={16} strokeWidth={2.2} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={feed.cardBody}>
        <div className={feed.cardTop}>
          {featuredLabel ? (
            <span className={feed.topicTag}>
              {featuredLabel}
            </span>
          ) : category && CATEGORY_LABELS[category] ? (
            <span className={feed.topicTag}>
              {CATEGORY_LABELS[category]}
            </span>
          ) : null}
        </div>

        <h3 className={feed.cardTitle}>
          {title}
        </h3>

        <p className={feed.cardPreview}>
          {preview}
        </p>

        {/* Author */}
        <div className={feed.cardAuthor}>
          <div className={feed.cardAvatar}>
            {authorAvatarUrl ? (
              <Image
                src={authorAvatarUrl}
                alt=""
                width={36}
                height={36}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className={feed.cardAuthorText}>
            <span className={feed.cardBy}>
              By {authorName}
            </span>
            {authorTitle && (
              <span className={feed.cardByTitle}>{authorTitle}</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className={feed.cardFoot}>
          <div className={feed.stats}>
            <span className={feed.stat}>
              <Heart size={16} strokeWidth={2} fill="currentColor" className={feed.heart} aria-hidden="true" />
              {reactionCount}
            </span>
            <span className={feed.stat}>
              <MessageCircle size={16} strokeWidth={2} fill="currentColor" className={feed.comment} aria-hidden="true" />
              {commentCount}
            </span>
          </div>
          {timeAgo && (
            // Counted from now, so the browser can land a minute past the server
            <span className={feed.cardTime} suppressHydrationWarning>{timeAgo}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
