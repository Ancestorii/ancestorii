'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Images, MessageCircle, Mic, PenLine, Play, Users, Video } from 'lucide-react';
import { ui, Avatar, IconTile, toneFor } from '@/components/dashboard/ui/AppBits';
import s from './family.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/** One memory as the My Family list shows it (built in FamilyMemories). */
export type FamilyMemory = {
  id: string;
  title: string;
  /** The body as plain text, for the preview. */
  excerpt: string;
  createdAt: string;
  isOnboarding: boolean;
  /** The question it answers, when it was written for one. */
  question: string | null;
  authorName: string;
  authorAvatar: string | null;
  /** A signed URL: the first photo, or a video's poster frame when it has no photo. */
  cover: string | null;
  photoCount: number;
  /** The memory itself plus every perspective added to it. */
  perspectives: number;
  hasVoice: boolean;
  hasVideo: boolean;
  reactions: number;
  comments: number;
};

// Dates on the card, the British way: "19 Oct 2026".
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function FamilyMemoryCard({ memory }: { memory: FamilyMemory }) {
  const [coverLoaded, setCoverLoaded] = useState(false);

  // A stable frame colour for this memory, as the other lists do.
  const frame = toneFor(memory.id);

  // Without a photo the frame says what kind of memory it is.
  const fallback = memory.hasVideo
    ? { Icon: Video, label: 'Video memory' }
    : memory.hasVoice
    ? { Icon: Mic, label: 'Voice memory' }
    : { Icon: PenLine, label: 'Written memory' };

  const cues = [
    memory.photoCount > 1 && { key: 'photos', Icon: Images, label: `${memory.photoCount} photos` },
    memory.perspectives > 1 && { key: 'perspectives', Icon: Users, label: `${memory.perspectives} perspectives` },
    memory.hasVoice && { key: 'voice', Icon: Mic, label: 'Voice note' },
    memory.hasVideo && { key: 'video', Icon: Video, label: 'Video' },
  ].filter(Boolean) as { key: string; Icon: typeof Mic; label: string }[];

  return (
    <Link
      href={`/dashboard/memories/${memory.id}`}
      id={`memory-${memory.id}`}
      className={cx(ui.card, ui.cardLink, s.memoryCard)}
    >
      {/* Cover in a solid colour frame */}
      <div className={ui.frame} style={{ '--frame': frame.bg } as CSSProperties}>
        <div className={cx(ui.frameInner, s.memoryCover)}>
          {memory.cover ? (
            <>
              <Image
                src={memory.cover}
                alt=""
                fill
                sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 400px"
                quality={90}
                className={cx(s.memoryImg, coverLoaded ? 'opacity-100' : 'opacity-0')}
                onLoad={() => setCoverLoaded(true)}
              />
              {memory.hasVideo && memory.photoCount === 0 && (
                <span className={s.memoryPlay} aria-hidden="true">
                  <Play size={22} strokeWidth={2.4} fill="currentColor" />
                </span>
              )}
            </>
          ) : (
            // Stands in for the missing photo only: the link's name starts with its title, and a
            // voice or video memory's cue chip already says what it is.
            <div className={s.memoryNoCover} aria-hidden="true">
              <IconTile Icon={fallback.Icon} tone={frame} size="lg" />
              {fallback.label}
            </div>
          )}

          {memory.question ? (
            <span className={ui.photoChip} style={{ '--frame': 'var(--c1)' } as CSSProperties}>
              Answered a question
            </span>
          ) : memory.isOnboarding ? (
            <span className={ui.photoChip} style={{ '--frame': 'var(--c0)' } as CSSProperties}>
              First memory
            </span>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className={s.memoryBody}>
        {memory.question && <p className={s.memoryQuestion}>&ldquo;{memory.question}&rdquo;</p>}
        <h3 className={s.memoryTitle}>{memory.title}</h3>
        {memory.excerpt && <p className={s.memoryText}>{memory.excerpt}</p>}

        {cues.length > 0 && (
          <div className={s.memoryCues}>
            {cues.map(({ key, Icon, label }) => (
              <span key={key} className={cx(ui.chip, ui.chipSm)}>
                <Icon size={13} strokeWidth={2.4} aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Who wrote it, when, and what the family made of it */}
        <div className={s.memoryFoot}>
          {/* The name follows, so the photo stays silent (Avatar's own img would repeat it) */}
          <Avatar name={memory.authorName} size={34}>
            {memory.authorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={memory.authorAvatar} alt="" />
            ) : undefined}
          </Avatar>
          <span className={s.memoryAuthor}>
            <span className={s.memoryAuthorName}>{memory.authorName}</span>
            <span className={s.memoryDate}>{formatDate(memory.createdAt)}</span>
          </span>
          <span className={s.memoryCounts}>
            <span className={s.memoryCount}>
              <Heart size={15} strokeWidth={2.4} aria-hidden="true" />
              {memory.reactions}
              <span className={ui.srOnly}>{memory.reactions === 1 ? ' heart' : ' hearts'}</span>
            </span>
            <span className={s.memoryCount}>
              <MessageCircle size={15} strokeWidth={2.4} aria-hidden="true" />
              {memory.comments}
              <span className={ui.srOnly}>{memory.comments === 1 ? ' comment' : ' comments'}</span>
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
