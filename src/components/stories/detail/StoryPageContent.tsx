'use client';

import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { getTopicByKey } from '@/lib/stories/topics';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Mic,
  Heart,
  MessageCircle,
  PenLine,
  MoreVertical,
  Trash2,
  Flag,
} from 'lucide-react';
import ShareButton from '@/components/stories/shares/ShareButton';
import ReactionButton from '@/components/stories/reactions/ReactionButton';
import CommentSection from '@/components/stories/comments/CommentSection';
import { deleteStory } from '@/lib/stories/mutations';
import { getTimeAgo, plainTextFromHtml } from '@/lib/stories/format';
import type { StoryComment } from '@/lib/stories/types';
import { getBrowserClient } from '@/lib/supabase/browser';
import { Accent } from '@/components/site/SiteBits';
import landing from '@/components/landing/landing.module.css';
import site from '@/components/site/site.module.css';
import StoryVoicePlayer from './StoryVoicePlayer';
import StoryLayer from './StoryLayer';
import s from './storyPage.module.css';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type StoryImage = { url: string; alt?: string };

type RelatedStory = {
  slug: string;
  title: string;
  coverUrl: string | null;
  reactionCount: number;
  commentCount: number;
};

type Props = {
  story: {
    id: string;
    slug: string;
    title: string;
    body: string;
    authorName: string;
    authorAvatarUrl: string | null;
    authorId: string;
    category: string | null;
    voiceNotePath: string | null;
    publishedAt: string | null;
    excerpt: string | null;
  };
  images: StoryImage[];
  video: string | null;
  reactionCount: number;
  commentCount: number;
  userHasReacted: boolean;
  isLoggedIn: boolean;
  isAuthor: boolean;
  authorBio: string | null;
  authorLocation: string | null;
  authorTitle: string | null;
  relatedStories: RelatedStory[];
  initialComments?: StoryComment[];
};

const CATEGORY_LABELS: Record<string, string> = {
  family: 'Family',
  food_and_recipes: 'Food & Recipes',
  childhood: 'Childhood',
  love: 'Love',
  life_lessons: 'Life Lessons',
  traditions: 'Traditions',
  travel: 'Travel',
};

// Photo frames take the landing's four colours in turn.
const FRAME_COLORS = ['var(--c0)', 'var(--c1)', 'var(--c2)', 'var(--c3)'];

// The main photo's width: the screen width on phones (the 4:5 frame crops landscape photos, so
// they need more than the frame's own width), the 560px column on small tablets, then the photo
// column. The photos either side are fetched with it too, so the browser picks the same file.
const STAGE_SIZES = '(max-width: 599px) 100vw, (max-width: 759px) 560px, 44vw';

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function StoryPageContent({
  story,
  images,
  reactionCount,
  commentCount,
  userHasReacted,
  isLoggedIn,
  isAuthor,
  authorBio,
  authorLocation,
  authorTitle,
  relatedStories,
  video,
  initialComments,
}: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    const supabase = getBrowserClient();
    const success = await deleteStory(supabase, story.id);
    if (success) {
      router.push('/stories');
    } else {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const categoryLabel = story.category ? CATEGORY_LABELS[story.category] : null;
  const categoryTopic = story.category ? getTopicByKey(story.category) : null;
  const categoryHref = categoryTopic
    ? `/stories/topics/${categoryTopic.slug}`
    : `/stories?category=${story.category ?? ''}`;
  const initials = story.authorName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // A fixed time zone, so the server and the browser print the same day (a reader's own
  // zone could tip a late-evening story into the next day and break hydration).
  const dateLabel = story.publishedAt
    ? new Date(story.publishedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/London',
      })
    : '';

  const timeAgo = story.publishedAt ? getTimeAgo(story.publishedAt) : '';

  const strippedBody = plainTextFromHtml(story.body);
  const preview = story.excerpt
    || (strippedBody.length > 160
      ? strippedBody.slice(0, 160).trim() + '…'
      : strippedBody);

  // Long titles step down a size so they stay a few lines long.
  const titleSize =
    story.title.length > 34 ? s.titleLong : story.title.length > 20 ? s.titleMid : '';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [menuOpen]);

  // The comment count jumps to the comments: a smooth scroll (instant for readers who prefer
  // less motion), then focus on the comments heading so keyboard and screen reader users
  // land there too. Without JavaScript the link still jumps there.
  const jumpToComments = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const heading = document.getElementById('comments');
    if (!heading) return;
    e.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    heading.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    heading.focus({ preventScroll: true });
  };

  // Signed-out readers who want to like or comment log in and come back to the story.
  const loginTo = (hash = '') =>
    router.push(`/login?redirect=${encodeURIComponent(`/stories/${story.slug}${hash}`)}`);
  const loginToComment = () => loginTo('#comments');

  return (
    <article className={s.article} data-mounted={mounted}>
      {/* ═══════════════════════════════════════════════════════════
         HERO: breadcrumbs, topic and date, title, author, actions, photos
         ═══════════════════════════════════════════════════════════ */}
      <header className={s.hero}>
        <div className={landing.wrap}>
          <nav aria-label="Breadcrumb" className={`${s.crumbs} ${s.reveal}`}>
            <ol className={site.crumbs}>
              <li>
                <Link href="/stories">Explore</Link>
              </li>
              {categoryLabel && (
                <li>
                  <Link href={categoryHref}>{categoryLabel}</Link>
                </li>
              )}
              <li>
                <span aria-current="page" className={s.crumbTitle}>
                  {story.title}
                </span>
              </li>
            </ol>
          </nav>

          <div className={`${s.heroGrid} ${s.reveal}`}>
            <div className={s.heroCopy}>
              {/* Overline: category + date */}
              {(categoryLabel || dateLabel) && (
                <div className={s.meta}>
                  {categoryLabel && <span className={s.topicPill}>{categoryLabel}</span>}
                  {dateLabel && <span>{dateLabel}</span>}
                </div>
              )}

              {/* Title */}
              <h1 className={`${s.title} ${titleSize}`}>{story.title}</h1>

              {/* Preview */}
              <p className={s.lead}>{preview}</p>

              {/* Author */}
              <div className={s.byline}>
                <AuthorAvatar avatarUrl={story.authorAvatarUrl} name={story.authorName} initials={initials} size={56} />
                <div className={s.bylineText}>
                  <span className={s.authorName}>{story.authorName}</span>
                  <span className={s.authorSub}>
                    {authorTitle && (
                      <>
                        {authorTitle}
                        {/* the dot stays on the title's line when the text wraps */}
                        {' '}
                        <span className={s.sep} aria-hidden="true">
                          •
                        </span>{' '}
                      </>
                    )}
                    {/* Counted from now, so the browser can land a minute past the server */}
                    <span className={s.when} suppressHydrationWarning>
                      {timeAgo || 'Just shared'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Engagement row */}
              <div className={s.actions}>
                <ReactionButton
                  storyId={story.id}
                  initialCount={reactionCount}
                  initialReacted={userHasReacted}
                  isLoggedIn={isLoggedIn}
                  onLoginPrompt={() => loginTo()}
                />
                <a
                  href="#comments"
                  onClick={jumpToComments}
                  className={`${s.pill} ${s.pillSoft}`}
                  aria-label={`Jump to comments (${commentCount})`}
                >
                  <MessageCircle size={18} strokeWidth={2.2} fill="currentColor" aria-hidden="true" className={s.commentIcon} />
                  <span>{commentCount}</span>
                </a>
                <ShareButton storyId={story.id} slug={story.slug} title={story.title} />
                {!isAuthor && isLoggedIn && !reportDone && (
                  <button
                    type="button"
                    onClick={() => setReportOpen(true)}
                    className={`${s.pill} ${s.pillSoft} ${s.pillIcon}`}
                    aria-label="Report story"
                    title="Report story"
                  >
                    <Flag size={17} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                )}
                {reportDone && <span className={s.reported}>Reported</span>}
                {isAuthor && (
                  <button
                    type="button"
                    ref={menuBtnRef}
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={`${s.pill} ${s.pillSoft} ${s.pillIcon}`}
                    aria-label="Story options"
                    aria-expanded={menuOpen}
                  >
                    <MoreVertical size={18} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Photos */}
            <div className={s.media}>
              {images.length > 0 ? <HeroImageCarousel images={images} title={story.title} /> : <EmptyImagePlaceholder />}
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
         STORY: text, video, voice note, tags and comments, with the author alongside
         ═══════════════════════════════════════════════════════════ */}
      <section className={s.bodySection}>
        <div className={`${landing.wrap} ${s.bodyGrid}`}>
          <div className={s.bodyCol}>
            {/* Story Body: supports both rich text (HTML) and plain text */}
            {story.body.includes('<') ? (
              <div className={s.richBody} dangerouslySetInnerHTML={{ __html: story.body }} />
            ) : (
              <div className={s.richBody}>
                {story.body.split('\n').filter((p: string) => p.trim().length > 0).map((paragraph: string, i: number) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            {video && (
              <div className={s.block}>
                <div className={s.blockLabel}>
                  <span className={s.blockTile} style={{ '--tile': 'var(--c1)' } as CSSProperties}>
                    <Play size={14} strokeWidth={2.6} aria-hidden="true" />
                  </span>
                  Video
                </div>
                <div className={s.videoFrame}>
                  <video
                    src={video}
                    controls
                    playsInline
                    preload="metadata"
                    className={s.video}
                  />
                </div>
              </div>
            )}

            {story.voiceNotePath && (
              <div className={`${s.block} ${s.voiceCard}`}>
                <div className={s.blockLabel}>
                  <span className={s.blockTile}>
                    <Mic size={14} strokeWidth={2.6} aria-hidden="true" />
                  </span>
                  Voice Note
                </div>
                <StoryVoicePlayer src={story.voiceNotePath} />
              </div>
            )}

            {categoryLabel && <TagList category={story.category!} label={categoryLabel} />}

            <div className={s.comments}>
              <CommentSection
                storyId={story.id}
                initialComments={initialComments ?? []}
                isLoggedIn={isLoggedIn}
                onLoginPrompt={loginToComment}
              />
            </div>
          </div>

          {/* About the Author */}
          <aside className={s.aside}>
            <div className={s.asideInner}>
              <div className={s.authorCard}>
                <h2 className={s.cardLabel}>About the author</h2>
                <div className={s.authorRow}>
                  <AuthorAvatar avatarUrl={story.authorAvatarUrl} name={story.authorName} initials={initials} size={64} />
                  <div className={s.authorRowText}>
                    <p className={s.authorCardName}>{story.authorName}</p>
                    {authorTitle && <p className={s.authorCardMeta}>{authorTitle}</p>}
                    {authorLocation && <p className={s.authorCardMeta}>{authorLocation}</p>}
                  </div>
                </div>
                {authorBio && <p className={s.authorBio}>{authorBio}</p>}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         MORE STORIES
         ═══════════════════════════════════════════════════════════ */}
      <section className={s.moreSection}>
        <div className={landing.wrap}>
          <div className={s.moreHead}>
            <h2 className={s.moreTitle}>More stories you might love</h2>
            {relatedStories.length > 0 && (
              <Link href="/stories" className={landing.btnGhost}>
                View all stories <span className={landing.arrowGlyph} aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          {relatedStories.length > 0 ? (
            <div className={s.moreGrid}>
              {relatedStories.map((rs) => (
                <Link
                  key={rs.slug}
                  href={`/stories/${rs.slug}`}
                  // A story page is rendered per request, so a prefetch brought nothing back.
                  prefetch={false}
                  className={landing.storyCard}
                >
                  <div className={landing.storyMedia}>
                    {rs.coverUrl ? (
                      <Image
                        src={rs.coverUrl}
                        alt=""
                        fill
                        sizes="(max-width: 599px) 40vw, (max-width: 1099px) 50vw, 300px"
                        className={landing.coverImg}
                      />
                    ) : (
                      <div className={`${landing.mediaFallback} ${s.fallbackPink}`} aria-hidden="true">
                        “
                      </div>
                    )}
                  </div>
                  <div className={landing.storyBody}>
                    <div className={landing.storyTitle}>{rs.title}</div>
                    <div className={s.cardStats}>
                      <span className={s.stat}>
                        <Heart size={14} strokeWidth={2.2} fill="currentColor" aria-hidden="true" className={s.statLike} />
                        {rs.reactionCount}
                      </span>
                      <span className={s.stat}>
                        <MessageCircle size={14} strokeWidth={2.2} fill="currentColor" aria-hidden="true" className={s.statComment} />
                        {rs.commentCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={s.moreEmpty}>
              <p className={s.moreEmptyText}>More stories coming soon</p>
              <Link href="/stories" className={landing.btnGhost}>
                Explore all stories <span className={landing.arrowGlyph} aria-hidden="true">→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         BOTTOM CTA BANNER
         ═══════════════════════════════════════════════════════════ */}
      <BottomCTABanner isLoggedIn={isLoggedIn} />

      {/* ═══════════════════════════════════════════════════════════
         THREE-DOT MENU DROPDOWN
         ═══════════════════════════════════════════════════════════ */}
      {menuOpen && (
        <StoryLayer>
          <div className={s.menuCatcher} onClick={() => setMenuOpen(false)} />
          <div
            className={s.menu}
            style={{
              top: menuBtnRef.current
                ? menuBtnRef.current.getBoundingClientRect().bottom + 8
                : 0,
              // clientWidth leaves out the scrollbar, which window.innerWidth counts
              right: menuBtnRef.current
                ? document.documentElement.clientWidth - menuBtnRef.current.getBoundingClientRect().right
                : 0,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                router.push(`/stories/${story.slug}/edit`);
              }}
              className={s.menuItem}
            >
              <PenLine size={16} strokeWidth={2.2} aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setDeleteModalOpen(true);
              }}
              className={`${s.menuItem} ${s.menuItemDanger}`}
            >
              <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
              Delete
            </button>
          </div>
        </StoryLayer>
      )}

      {/* ═══════════════════════════════════════════════════════════
         REPORT MODAL
         ═══════════════════════════════════════════════════════════ */}
      {reportOpen && (
        <StoryLayer>
          <div className={s.modalWrap}>
            <div
              className={s.modalScrim}
              onClick={() => !reporting && setReportOpen(false)}
            />
            <div className={s.modal} role="dialog" aria-labelledby="report-story-title">
              <h2 id="report-story-title" className={s.modalTitle}>
                Report this story
              </h2>
              <p className={s.modalText}>
                If this story doesn&apos;t belong on Our Stories, let us know. We&apos;ll review it.
              </p>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="What's wrong with this story? (optional)"
                aria-label="What's wrong with this story? (optional)"
                rows={3}
                className={`${site.textarea} ${s.modalTextarea}`}
              />
              <div className={s.modalActions}>
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  disabled={reporting}
                  className={s.modalCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setReporting(true);
                    try {
                      const res = await fetch('/api/report-story', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ story_id: story.id, reason: reportReason.trim() || null }),
                      });
                      if (res.ok) {
                        setReportDone(true);
                        setReportOpen(false);
                      }
                    } finally {
                      setReporting(false);
                    }
                  }}
                  disabled={reporting}
                  className={s.modalDanger}
                >
                  {reporting ? 'Submitting…' : 'Report'}
                </button>
              </div>
            </div>
          </div>
        </StoryLayer>
      )}

      {/* ═══════════════════════════════════════════════════════════
         DELETE CONFIRMATION MODAL
         ═══════════════════════════════════════════════════════════ */}
      {deleteModalOpen && (
        <StoryLayer>
          <div className={s.modalWrap}>
            <div
              className={s.modalScrim}
              onClick={() => !deleting && setDeleteModalOpen(false)}
            />
            <div className={s.modal} role="dialog" aria-labelledby="delete-story-title">
              <h2 id="delete-story-title" className={s.modalTitle}>
                Delete this story?
              </h2>
              <p className={s.modalText}>
                This is permanent and cannot be undone. All photos, comments, and reactions will be removed.
              </p>
              <div className={s.modalActions}>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleting}
                  className={s.modalCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className={s.modalDanger}
                >
                  {deleting ? 'Deleting…' : 'Delete forever'}
                </button>
              </div>
            </div>
          </div>
        </StoryLayer>
      )}
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO IMAGE CAROUSEL
   The main photo in a colour frame (arrows, counter, dots, swipe),
   with the first five photos as small colour tiles underneath.
   ═══════════════════════════════════════════════════════════════ */

function HeroImageCarousel({
  images,
  title,
}: {
  images: StoryImage[];
  title: string;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const goTo = (index: number) => {
    // Tapping the dot of the photo already showing used to blank it (no new load to fade it back in).
    if (index === activeImage) return;
    setImageLoaded(false);
    setActiveImage(index);
  };

  const goNext = () => goTo((activeImage + 1) % images.length);
  const goPrev = () => goTo((activeImage - 1 + images.length) % images.length);

  // Once the photo on show has loaded, fetch the ones either side into the cache, so a swipe
  // or an arrow shows the next photo straight away instead of waiting on the network.
  useEffect(() => {
    if (!imageLoaded || images.length < 2) return;
    const next = (activeImage + 1) % images.length;
    const prev = (activeImage - 1 + images.length) % images.length;
    for (const i of next === prev ? [next] : [next, prev]) {
      const { props } = getImageProps({ src: images[i].url, alt: '', fill: true, sizes: STAGE_SIZES });
      const img = new window.Image();
      if (props.sizes) img.sizes = props.sizes;
      if (props.srcSet) img.srcset = props.srcSet;
      img.src = props.src;
    }
  }, [imageLoaded, activeImage, images]);

  const touchStart = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStart.current = null;
  };

  return (
    <div className={s.gallery}>
      <div
        className={s.frame}
        style={{ '--card': FRAME_COLORS[activeImage % FRAME_COLORS.length] } as CSSProperties}
      >
        <div
          className={s.stage}
          data-hover={isHovered}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main image */}
          <Image
            key={activeImage}
            src={images[activeImage].url}
            alt={images[activeImage].alt || title}
            fill
            preload
            sizes={STAGE_SIZES}
            className={`${s.stageImg} ${imageLoaded ? s.stageImgIn : ''}`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Soft shade at the bottom so the dots stay visible */}
          <div className={s.vignette} />

          {/* Image counter pill */}
          {images.length > 1 && (
            <div className={s.counter}>
              {activeImage + 1} / {images.length}
            </div>
          )}

          {/* Prev / Next arrows (show on hover) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className={`${s.navBtn} ${s.navPrev}`}
                aria-label="Previous image"
              >
                <ChevronLeft size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className={`${s.navBtn} ${s.navNext}`}
                aria-label="Next image"
              >
                <ChevronRight size={20} strokeWidth={2.6} aria-hidden="true" />
              </button>
            </>
          )}

          {/* Navigation dots */}
          {images.length > 1 && (
            <div className={s.dots}>
              {images.map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => goTo(i)}
                  className={`${s.dot} ${i === activeImage ? s.dotActive : ''}`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* The first five photos as a static strip of tiles; the fifth shows how many more there are */}
      {images.length > 1 && (
        <div className={s.thumbs}>
          {images.slice(0, 5).map((img, i) => (
            <div
              key={i}
              className={s.thumb}
              style={{ '--card': FRAME_COLORS[i % FRAME_COLORS.length] } as CSSProperties}
            >
              <span className={s.thumbInner}>
                <Image src={img.url} alt={img.alt || ''} fill sizes="120px" className={s.thumbImg} />
              </span>
              {i === 4 && images.length > 5 && (
                <span className={s.thumbMore}>+{images.length - 5}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NO PHOTOS: a solid colour card in the photo's place
   ═══════════════════════════════════════════════════════════════ */

function EmptyImagePlaceholder() {
  return (
    <div className={s.quoteCard}>
      <span className={s.quoteMark} aria-hidden="true">
        “
      </span>
      <p className={s.quoteText}>A memory worth reading</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAG LIST
   ═══════════════════════════════════════════════════════════════ */

function TagList({ category, label }: { category: string; label: string }) {
  // Show the primary category plus related contextual tags
  const contextTags: Record<string, string[]> = {
    family: ['Family', 'Heritage'],
    food_and_recipes: ['Food & Recipes', 'Family', 'Traditions'],
    childhood: ['Childhood', 'Family'],
    love: ['Love', 'Family'],
    life_lessons: ['Life Lessons', 'Family'],
    traditions: ['Traditions', 'Family', 'Heritage'],
    travel: ['Travel', 'Family'],
  };

  const tags = contextTags[category] || [label];

  return (
    <div className={s.tags}>
      {tags.map((tag) => (
        <span key={tag} className={s.tag}>
          {tag}
        </span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BOTTOM CTA BANNER (the landing's dark closing slab)
   ═══════════════════════════════════════════════════════════════ */

function BottomCTABanner({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();

  return (
    <section className={`${landing.ctaSection} ${s.ctaEnd}`}>
      <div className={`${landing.wrap} ${landing.ctaSlab}`}>
        <div className={landing.ctaGlowPink} aria-hidden="true" />
        <div className={landing.ctaGlowBlue} aria-hidden="true" />
        <div className={landing.ctaCopy}>
          <h2 className={`${landing.ctaTitle} ${s.ctaTitle}`}>
            Every family has a story{' '}
            <Accent tone="pink">worth remembering.</Accent>
          </h2>

          <p className={landing.ctaLead}>
            Share your memory. Inspire someone. Preserve what truly matters.
          </p>

          <div className={landing.ctaButtons}>
            <button
              type="button"
              onClick={() =>
                router.push(isLoggedIn ? '/stories/create' : '/signup')
              }
              className={`${landing.btnPrimary} ${landing.btnLight} ${s.ctaButton}`}
            >
              Share Your Memory
              <span className={landing.arrowTile} aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function AuthorAvatar({
  avatarUrl,
  name,
  initials,
  size,
}: {
  avatarUrl: string | null;
  name: string;
  initials: string;
  size: number;
}) {
  return (
    <div
      className={`${s.avatar} ${avatarUrl ? s.avatarPhoto : ''}`}
      style={{ '--size': `${size}px` } as CSSProperties}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          width={size}
          height={size}
          className={s.avatarImg}
        />
      ) : (
        <span style={{ fontSize: Math.max(10, size * 0.32) }}>
          {initials}
        </span>
      )}
    </div>
  );
}
