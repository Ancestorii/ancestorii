'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTopicByKey } from '@/lib/stories/topics';
import {
  ChevronRight,
  Play,
  Pause,
  Mic,
  Heart,
  MessageCircle,
  ArrowUpRight,
  ArrowRight,
  PenLine,
  Download,
  ImageIcon,
  MoreVertical,
  Trash2,
  Flag,
} from 'lucide-react';
import ShareButton from '@/components/stories/shares/ShareButton';
import ReactionButton from '@/components/stories/reactions/ReactionButton';
import CommentSection from '@/components/stories/comments/CommentSection';
import { deleteStory } from '@/lib/stories/mutations';
import type { StoryComment } from '@/lib/stories/types';
import { getBrowserClient } from '@/lib/supabase/browser';

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
      router.push('/');
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

  const dateLabel = story.publishedAt
    ? new Date(story.publishedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const timeAgo = story.publishedAt ? getTimeAgo(story.publishedAt) : '';

  const strippedBody = story.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const preview = story.excerpt
    || (strippedBody.length > 160
      ? strippedBody.slice(0, 160).trim() + '…'
      : strippedBody);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [menuOpen]);

  return (
    <article className="w-full" style={{ background: '#FFFDF8' }}>
      {/* Entrance animation styles */}
      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(169, 120, 47, 0.15); }
          50% { box-shadow: 0 0 0 8px rgba(169, 120, 47, 0); }
        }
        .story-body-rich p { margin-bottom: 1.5rem; }
        .story-body-rich strong { font-weight: 700; }
        .story-body-rich em { font-style: italic; }
        .story-body-rich u { text-decoration: underline; }
        .story-body-rich ul { padding-left: 1.25rem; margin-bottom: 1.5rem; list-style-type: disc; }
        .story-body-rich ol { padding-left: 1.25rem; margin-bottom: 1.5rem; list-style-type: decimal; }
        .story-body-rich li { margin-bottom: 0.4rem; }
        .animate-fade-up {
          animation: fadeUp 0.7s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-slide-right {
          animation: slideInRight 0.7s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 1: BREADCRUMBS
         ═══════════════════════════════════════════════════════════ */}
      <div className="w-full px-6 md:px-10 lg:px-20 xl:px-28 pt-5 sm:pt-6">
        <nav
          className={`flex items-center gap-1.5 text-[12px] sm:text-[13px] ${
            mounted ? 'animate-fade-in' : 'opacity-0'
          }`}
        >
          <Link
            href="/stories"
            className="text-[#9C9488] transition-colors duration-200 hover:text-[#A9782F]"
          >
            Explore
          </Link>
          {categoryLabel && (
            <>
              <ChevronRight size={12} className="text-[#D4CBC0]" />
              <Link
                href={categoryHref}
                className="text-[#9C9488] transition-colors duration-200 hover:text-[#A9782F]"
              >
                {categoryLabel}
              </Link>
            </>
          )}
          <ChevronRight size={12} className="text-[#D4CBC0]" />
          <span className="text-[#1A1612] font-medium truncate max-w-[260px]">
            {story.title}
          </span>
        </nav>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
   SECTION 2: HERO — REBUILT FROM HEROCARD TEMPLATE
   ═══════════════════════════════════════════════════════════════ */}

<div className={`w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-4 sm:pt-6 pb-6 sm:pb-8 ${
  mounted ? 'animate-fade-in' : 'opacity-0'
}`}>
  <div className="border border-[#EDE8DF] overflow-hidden">
    <div className="flex flex-col lg:flex-row lg:min-h-[480px]">

      {/* ── Content — left 2/3 ── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-12 xl:px-14 2xl:px-16 py-8 sm:py-10 lg:py-12 bg-white order-last lg:order-first">

        {/* Overline: category + date */}
        <div className="flex items-center gap-2.5 mb-5">
          {categoryLabel && (
            <span
              className="text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] font-bold uppercase tracking-[0.14em] text-[#C8A557]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {categoryLabel}
            </span>
          )}
          {categoryLabel && dateLabel && (
            <span className="text-[#D4CBC0]">·</span>
          )}
          {dateLabel && (
            <span
              className="text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] font-medium uppercase tracking-[0.1em] text-[#9C9488]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {dateLabel}
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="text-[30px] sm:text-[38px] md:text-[46px] lg:text-[52px] xl:text-[58px] 2xl:text-[64px] leading-[1.0] tracking-[-0.04em] text-[#1A1612]"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
        >
          {story.title}
        </h1>

        {/* Preview */}
        <p
          className="mt-4 sm:mt-5 text-[15px] sm:text-[16px] lg:text-[17px] xl:text-[18px] 2xl:text-[19px] leading-[1.8] text-[#6F6255] max-w-[92%]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {preview}
        </p>

        {/* Author */}
        <div className="mt-6 lg:mt-8 flex items-center gap-3">
          <AuthorAvatar avatarUrl={story.authorAvatarUrl} name={story.authorName} initials={initials} size={48} />
          <div>
            <span
              className="text-[14px] sm:text-[15px] lg:text-[16px] xl:text-[17px] font-semibold text-[#1A1612] block"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {story.authorName}
            </span>
            {authorTitle && (
              <span
                className="block text-[12px] sm:text-[13px] lg:text-[14px] text-[#A9782F]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {authorTitle}
              </span>
            )}
            <span
              className="block text-[12px] sm:text-[13px] lg:text-[14px] text-[#9C9488]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {timeAgo || 'Just shared'}
            </span>
          </div>
        </div>

        {/* Engagement row */}
        <div className="mt-6 lg:mt-8 pt-5 border-t border-[#F0EBE3] flex items-center">
          <div className="flex items-center gap-5">
            <ReactionButton
              storyId={story.id}
              initialCount={reactionCount}
              initialReacted={userHasReacted}
              isLoggedIn={isLoggedIn}
              onLoginPrompt={() => router.push('/login')}
            />
            <button className="flex items-center gap-2 group">
              <MessageCircle size={18} strokeWidth={1.6} className="text-[#5A87A8] group-hover:scale-110 transition-transform duration-200" fill="#5A87A8" />
             <span className="text-[14px] lg:text-[15px] xl:text-[16px] font-medium text-[#1A1612]">{commentCount}</span>
            </button>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {!isAuthor && isLoggedIn && !reportDone && (
              <button
                onClick={() => setReportOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EDE8DF] text-[#9C9488] transition-colors hover:bg-[#FEF2F2] hover:text-[#EF4444] hover:border-[#FECACA]"
                aria-label="Report story"
                title="Report story"
              >
                <Flag size={16} strokeWidth={1.8} />
              </button>
            )}
            {reportDone && (
              <span className="text-[12px] font-medium text-[#10B981]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Reported
              </span>
            )}
            {isAuthor && (
              <div className="relative">
                <button
                  ref={menuBtnRef}
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EDE8DF] text-[#6F6255] transition-colors hover:bg-[#FAF4EA]"
                  aria-label="Story options"
                >
                  <MoreVertical size={18} strokeWidth={1.8} />
                </button>
              </div>
            )}
            <ShareButton storyId={story.id} slug={story.slug} title={story.title} />
          </div>
        </div>
      </div>

      {/* ── Image — right ~45% ── */}
      <div className="w-full lg:w-[45%] flex-shrink-0 order-first lg:order-last flex flex-col bg-[#F5F0E8]">
        <div className="relative flex-1 min-h-[260px] sm:min-h-[360px] lg:min-h-0 overflow-hidden">
          {images.length > 0 ? <HeroImageCarousel images={images} title={story.title} /> : <EmptyImagePlaceholder />}
        </div>
        {images.length > 1 && (
          <div className="flex gap-[2px] bg-white/50">
            {images.slice(0, 5).map((img, i) => (
              <div key={i} className="relative flex-1 h-[56px] sm:h-[68px] lg:h-[72px] overflow-hidden">
                <Image src={img.url} alt={img.alt || ''} fill sizes="20vw" className="object-cover" />
                {i === 4 && images.length > 5 && (
                  <div className="absolute inset-0 bg-[#1A1612]/50 flex items-center justify-center">
                    <span className="text-white text-[13px] font-semibold">+{images.length - 5}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
</div>

      {/* ─── Section Divider ─── */}
      <SectionDivider />

      {/* ═══════════════════════════════════════════════════════════════
   SECTION 3 — FLOATING CARDS + DROP CAP
   
   No borders — soft shadow-lifted cards. Gold left-edge accent.
   Drop cap on first paragraph. Wider 5:2 column ratio.
   ═══════════════════════════════════════════════════════════════ */}

<div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pb-8 sm:pb-10 lg:pb-12">
  <div className="flex flex-col lg:grid lg:grid-cols-[5fr_2fr] gap-8 lg:gap-10 xl:gap-14">

    {/* ── Left: Story + Comments ── */}
    <div className="min-w-0">
      <div
        className="bg-white overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.03)' }}
      >
        <div className="flex flex-col lg:flex-row">
          {/* Gold left accent bar (top on mobile, left on desktop) */}
          <div className="h-[2px] lg:h-auto lg:w-[3px] w-full lg:flex-shrink-0" style={{ background: 'linear-gradient(180deg, #C8A557 0%, #E4D2AE 50%, #C8A557 100%)' }} />

          <div className="flex-1 px-6 sm:px-8 lg:px-12 xl:px-14 py-10 sm:py-12 lg:py-14">

           {/* Story Body — supports both rich text (HTML) and plain text */}
            {story.body.includes('<') ? (
              <div
                className="story-body-rich text-[15px] sm:text-[16px] leading-[1.9] text-[#2E2820]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                dangerouslySetInnerHTML={{ __html: story.body }}
              />
            ) : (
              <div className="story-body">
                {story.body.split('\n').filter((p: string) => p.trim().length > 0).map((paragraph: string, i: number) => (
                  <p
                    key={i}
                    className={`text-[15px] sm:text-[16px] leading-[1.9] text-[#2E2820] ${
                      i > 0 ? 'mt-6' : ''
                    }`}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {i === 0 && paragraph.length > 0 && !'IJijl|'.includes(paragraph[0]) ? (
                      <>
                        <span
                          className="float-left text-[#C8A557] leading-[0.8] mr-3 mt-1 text-center"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 700,
                            fontSize: '3.5rem',
                            minWidth: '2.5rem',
                          }}
                        >
                          {paragraph[0]}
                        </span>
                        {paragraph.slice(1)}
                      </>
                    ) : (
                      paragraph
                    )}
                  </p>
                ))}
              </div>
            )}

            {video && (
              <div className="mt-10">
                <div className="flex items-center gap-2 mb-4">
                  <Play size={13} className="text-[#A9782F]" strokeWidth={1.8} />
                  <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] text-[#A9782F]">
                    Video
                  </span>
                </div>
                <div className="relative overflow-hidden rounded-sm border border-[#EDE8DF]">
                  <video
                    src={video}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full max-h-[500px] bg-[#1A1612]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
              </div>
            )}

            {story.voiceNotePath && (
              <div className="mt-12">
                <VoiceNotePlayer src={story.voiceNotePath} />
              </div>
            )}

            {categoryLabel && (
              <div className="mt-10 pt-6 border-t border-[#F0EBE3]">
                <TagList category={story.category!} label={categoryLabel} />
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-[#F0EBE3]">
              <CommentSection
                storyId={story.id}
                initialComments={initialComments ?? []}
                isLoggedIn={isLoggedIn}
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ── Right: Sidebar ── */}
    <div className="w-full">
      <div className="lg:sticky lg:top-[100px] space-y-8">

        {/* About the Author */}
        <div className="overflow-hidden bg-white" style={{ border: '1px solid #E0E0E0' }}>
          <div className="h-[4px] w-full" style={{ background: '#1B2D4F' }} />
          <div className="px-6 pt-6 pb-6">
            <p
              className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#1B2D4F] mb-5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              About the author
            </p>
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-[#1B2D4F]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {story.authorName}
                </p>
                {authorTitle && (
                  <p className="mt-0.5 text-[13px] italic text-[#C8A557]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {authorTitle}
                  </p>
                )}
                {authorLocation && (
                  <p className="mt-0.5 text-[12px] text-[#8A8A8A]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {authorLocation}
                  </p>
                )}
              </div>
              <AuthorAvatar avatarUrl={story.authorAvatarUrl} name={story.authorName} initials={initials} size={56} />
            </div>
            {authorBio && (
              <p className="mt-4 text-[13px] leading-[1.8] text-[#3A3A3A]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {authorBio}
              </p>
            )}
          </div>
        </div>

        {/* More Stories */}
        <div className="overflow-hidden bg-white" style={{ border: '1px solid #E0E0E0' }}>
          <div className="h-[4px] w-full" style={{ background: '#1B2D4F' }} />
          <div className="px-6 pt-6 pb-6">
            <p
              className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#1B2D4F] mb-5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              More stories you might love
            </p>
            {relatedStories.length > 0 ? (
              <>
                {relatedStories.map((rs, i) => (
                  <Link
                    key={rs.slug}
                    href={`/stories/${rs.slug}`}
                    className={`group flex items-start gap-3.5 py-3.5 transition-colors duration-150 ${
                      i < relatedStories.length - 1 ? 'border-b border-[#EBEBEB]' : ''
                    }`}
                  >
                    <div className="relative h-[56px] w-[56px] xl:h-[64px] xl:w-[64px] flex-shrink-0 overflow-hidden bg-[#EEF1F6]" style={{ border: '1px solid #D0D5DD' }}>
                      {rs.coverUrl ? (
                        <Image src={rs.coverUrl} alt="" fill sizes="64px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ImageIcon size={14} strokeWidth={1.2} className="text-[#B0B5BD]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[13px] leading-[1.5] font-semibold text-[#1B2D4F] transition-colors duration-200 group-hover:text-[#C8A557] line-clamp-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {rs.title}
                      </p>
                      <span className="inline-flex items-center gap-3 mt-2 text-[11px] text-[#8A8A8A]">
                        <span className="inline-flex items-center gap-1">
                          <Heart size={11} strokeWidth={1.7} className="text-[#D94F4F]" fill="#D94F4F" />{rs.reactionCount}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle size={11} strokeWidth={1.7} className="text-[#5A87A8]" fill="#5A87A8" />{rs.commentCount}
                        </span>
                      </span>
                    </div>
                  </Link>
                ))}
                <Link
                  href="/stories"
                  className="group flex items-center gap-1.5 mt-4 pt-3.5 border-t border-[#EBEBEB] text-[12px] font-bold text-[#1B2D4F] transition-colors duration-200 hover:text-[#C8A557]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  View all stories
                  <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </>
            ) : (
              <div className="py-4 text-center">
                <p className="text-[13px] text-[#8A8A8A]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  More stories coming soon
                </p>
                <Link
                  href="/stories"
                  className="group inline-flex items-center gap-1.5 mt-3 text-[12px] font-bold text-[#1B2D4F] hover:text-[#C8A557] transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Explore all stories
                  <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

      {/* ═══════════════════════════════════════════════════════════
         SECTION 4: BOTTOM CTA BANNER
         ═══════════════════════════════════════════════════════════ */}
      <BottomCTABanner isLoggedIn={isLoggedIn} />

      {/* ═══════════════════════════════════════════════════════════
         THREE-DOT MENU DROPDOWN
         ═══════════════════════════════════════════════════════════ */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-[199]" onClick={() => setMenuOpen(false)} />
          <div
            className="fixed z-[200] w-[160px] overflow-hidden border border-[#EDE8DF] shadow-xl"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              backgroundColor: '#FFFFFF',
              top: menuBtnRef.current
                ? menuBtnRef.current.getBoundingClientRect().bottom + 8
                : 0,
              right: menuBtnRef.current
                ? window.innerWidth - menuBtnRef.current.getBoundingClientRect().right
                : 0,
            }}
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push(`/stories/${story.slug}/edit`);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-[14px] font-medium text-[#1A1612] transition-colors hover:bg-[#FAF5EB]"
            >
              <PenLine size={15} strokeWidth={1.8} />
              Edit
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                setDeleteModalOpen(true);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-[14px] font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 size={15} strokeWidth={1.8} />
              Delete
            </button>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
         REPORT MODAL
         ═══════════════════════════════════════════════════════════ */}
      {reportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !reporting && setReportOpen(false)}
          />
          <div
            className="relative w-[90%] max-w-[420px] bg-white px-6 py-7 sm:px-8 sm:py-8 border border-[#EDE8DF] shadow-xl"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#1A1612] leading-tight">
              Report this story
            </h3>
            <p className="mt-3 text-[14px] leading-[1.7] text-[#6F6255]">
              If this story doesn't belong on Our Stories, let us know. We'll review it.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="What's wrong with this story? (optional)"
              rows={3}
              className="mt-4 w-full rounded-[10px] border border-[#EDE8DF] px-4 py-3 text-[14px] text-[#1A1612] placeholder:text-[#C4B8A7] outline-none focus:border-[#C8A557] resize-none"
            />
            <div className="mt-6 flex items-center gap-3 justify-end">
              <button
                onClick={() => setReportOpen(false)}
                disabled={reporting}
                className="px-4 py-2.5 text-[14px] font-medium text-[#6F6255] rounded-[10px] border border-[#EDE8DF] transition-colors hover:bg-[#FAF5EB] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
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
                className="px-4 py-2.5 text-[14px] font-semibold text-white rounded-[10px] bg-[#EF4444] transition-colors hover:bg-[#DC2626] disabled:opacity-50"
              >
                {reporting ? 'Submitting…' : 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
         DELETE CONFIRMATION MODAL
         ═══════════════════════════════════════════════════════════ */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteModalOpen(false)}
          />
          <div
            className="relative w-[90%] max-w-[400px] bg-white px-6 py-7 sm:px-8 sm:py-8 border border-[#EDE8DF] shadow-xl"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#1A1612] leading-tight">
              Delete this story?
            </h3>
            <p className="mt-3 text-[14px] leading-[1.7] text-[#6F6255]">
              This is permanent and cannot be undone. All photos, comments, and reactions will be removed.
            </p>
            <div className="mt-6 flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="px-4 py-2.5 text-[14px] font-medium text-[#6F6255] rounded-[10px] border border-[#EDE8DF] transition-colors hover:bg-[#FAF5EB] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2.5 text-[14px] font-semibold text-white rounded-[10px] bg-red-600 transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO IMAGE CAROUSEL
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
    setImageLoaded(false);
    setActiveImage(index);
  };

  const goNext = () => goTo((activeImage + 1) % images.length);
  const goPrev = () => goTo((activeImage - 1 + images.length) % images.length);

  const touchStart = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
    touchStart.current = null;
  };

  return (
    <div
      className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-[#F5F0E8] group"
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
        priority
        sizes="(max-width: 1024px) 100vw, 52vw"
        className={`object-cover transition-all duration-500 ${
          imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
        }`}
        onLoadingComplete={() => setImageLoaded(true)}
      />

      {/* Subtle vignette overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.15) 100%)',
        }}
      />

      {/* Image counter pill */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 bg-[#1A1612]/65 backdrop-blur-sm px-3 py-1.5 text-[11px] font-medium text-white tabular-nums tracking-wide">
          {activeImage + 1} / {images.length}
        </div>
      )}

      {/* Prev / Next arrows (show on hover) */}
      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className={`absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center bg-white/80 backdrop-blur-sm text-[#1A1612] transition-all duration-300 hover:bg-white ${
              isHovered
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-2'
            }`}
            aria-label="Previous image"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button
            onClick={goNext}
            className={`absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center bg-white/80 backdrop-blur-sm text-[#1A1612] transition-all duration-300 hover:bg-white ${
              isHovered
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-2'
            }`}
            aria-label="Next image"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Navigation dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 transition-all duration-300 ${
                i === activeImage
                  ? 'w-6 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY IMAGE PLACEHOLDER
   ═══════════════════════════════════════════════════════════════ */

function EmptyImagePlaceholder() {
  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden">
      {/* Layered warm background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(145deg, #FAF5EB 0%, #F0E8D8 40%, #E8DCC8 100%)',
        }}
      />

      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="storyPattern"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="30" cy="30" r="1.5" fill="#A9782F" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#storyPattern)" />
        </svg>
      </div>

      {/* Decorative corner flourishes */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-[#D8BE8B]/30" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-[#D8BE8B]/30" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-[#D8BE8B]/30" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-[#D8BE8B]/30" />

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 flex items-center justify-center border border-[#D8BE8B]/40">
          <ImageIcon size={20} strokeWidth={1.2} className="text-[#B8924A]/60" />
        </div>
        <p
          className="text-[15px] italic text-[#B8924A]/70"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          A memory worth reading
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STORY BODY
   ═══════════════════════════════════════════════════════════════ */

function StoryBody({ body }: { body: string }) {
  const paragraphs = body
    .split('\n')
    .filter((p) => p.trim().length > 0);

  return (
    <div className="story-body">
      {paragraphs.map((paragraph, i) => (
        <p
          key={i}
          className={`text-[15px] sm:text-[16px] leading-[1.9] text-[#2E2820] ${
            i > 0 ? 'mt-5' : ''
          }`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VOICE NOTE PLAYER — Waveform Style
   ═══════════════════════════════════════════════════════════════ */

function VoiceNotePlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Generate pseudo-waveform bars
  const barCount = 48;
  const [bars] = useState(() =>
    Array.from({ length: barCount }, () => 0.2 + Math.random() * 0.8)
  );

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      el.play();
    }
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    el.currentTime = pct * duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPct = duration > 0 ? progress / duration : 0;

  return (
    <div className="border border-[#EDE8DF] bg-[#FEFDFB] transition-shadow duration-300 hover:shadow-[0_2px_12px_rgba(169,120,47,0.08)]">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) =>
          setProgress((e.target as HTMLAudioElement).currentTime)
        }
        onLoadedMetadata={(e) =>
          setDuration((e.target as HTMLAudioElement).duration)
        }
        onEnded={() => setPlaying(false)}
      />

      <div className="px-5 py-4 sm:px-6 sm:py-5">
        {/* Label */}
        <div className="flex items-center gap-2 mb-4">
          <Mic size={13} className="text-[#A9782F]" strokeWidth={1.8} />
          <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] text-[#A9782F]">
            Voice Note
          </span>
        </div>

        {/* Player controls */}
        <div className="flex items-center gap-4">
          {/* Play button */}
          <button
            onClick={toggle}
            className="flex h-[48px] w-[48px] sm:h-[52px] sm:w-[52px] flex-shrink-0 items-center justify-center text-white transition-transform duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #D8BE8B 0%, #A9782F 100%)',
            }}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <Pause size={18} strokeWidth={2.2} />
            ) : (
              <Play size={18} strokeWidth={2.2} className="ml-0.5" />
            )}
          </button>

          {/* Waveform */}
          <div className="flex-1 min-w-0">
            <div
              className="flex items-end gap-[2px] h-[36px] cursor-pointer"
              onClick={seek}
              role="slider"
              aria-valuenow={Math.round(progressPct * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {bars.map((height, i) => {
                const barPct = i / barCount;
                const isPlayed = barPct <= progressPct;
                return (
                  <div
                    key={i}
                    className="flex-1 transition-colors duration-150"
                    style={{
                      height: `${height * 100}%`,
                      minWidth: '2px',
                      backgroundColor: isPlayed ? '#A9782F' : '#DDD6CC',
                    }}
                  />
                );
              })}
            </div>

            {/* Time display */}
            <div className="mt-2 flex justify-between text-[10px] sm:text-[11px] text-[#9C9488] tabular-nums">
              <span>{fmt(progress)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* Download */}
          <a
            href={src}
            download
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-[#9C9488] transition-colors duration-200 hover:text-[#A9782F]"
            aria-label="Download voice note"
          >
            <Download size={16} strokeWidth={1.6} />
          </a>
        </div>
      </div>
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
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-3.5 py-1.5 border border-[#EDE8DF] text-[12px] font-medium text-[#6F6255] transition-all duration-200 cursor-pointer hover:border-[#A9782F] hover:text-[#A9782F] hover:bg-[#FAF5EB]"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR: ABOUT THE AUTHOR
   ═══════════════════════════════════════════════════════════════ */

function AboutAuthorCard({
  authorName,
  authorAvatarUrl,
  authorId,
  authorBio,
  authorLocation,
  initials,
}: {
  authorName: string;
  authorAvatarUrl: string | null;
  authorId: string;
  authorBio: string | null;
  authorLocation: string | null;
  initials: string;
}) {
  return (
    <div className="border border-[#EDE8DF] bg-white transition-shadow duration-300 hover:shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      <div className="px-5 pt-5 pb-1">
        <h4
          className="text-[18px] xl:text-[20px] leading-none tracking-[-0.04em] text-[#181512]"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 600,
          }}
        >
          About the author
        </h4>
      </div>

      <div className="px-5 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <AuthorAvatar
            avatarUrl={authorAvatarUrl}
            name={authorName}
            initials={initials}
            size={48}
          />
          <div>
            <p className="text-[14px] font-semibold text-[#1A1612]">
              {authorName}
            </p>
            {authorLocation && (
              <p className="text-[12px] text-[#9C9488] mt-0.5">
                {authorLocation}
              </p>
            )}
          </div>
        </div>

        {authorBio && (
          <p
            className="mt-4 text-[13px] leading-[1.7] text-[#6F6255]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {authorBio}
          </p>
        )}

        <Link
          href={`/profile/${authorId}`}
          className="group mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#A9782F] transition-colors duration-200 hover:text-[#8A6325]"
        >
          View profile
          <ArrowRight
            size={12}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR: RELATED STORIES
   ═══════════════════════════════════════════════════════════════ */

function RelatedStoriesCard({ stories }: { stories: RelatedStory[] }) {
  return (
    <div className="border border-[#EDE8DF] bg-white transition-shadow duration-300 hover:shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      <div className="px-5 pt-5 pb-1">
        <h4
          className="text-[18px] xl:text-[20px] leading-none tracking-[-0.04em] text-[#181512]"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 600,
          }}
        >
          More stories you might love
        </h4>
      </div>

      <div className="px-5 pb-5 pt-2">
        {stories.map((rs, i) => (
          <Link
            key={rs.slug}
            href={`/stories/${rs.slug}`}
            className={`group flex items-start gap-3 py-3.5 transition-colors duration-150 ${
              i < stories.length - 1 ? 'border-b border-[#F1ECE3]' : ''
            }`}
          >
            {/* Thumbnail */}
            <div className="relative h-[56px] w-[56px] xl:h-[64px] xl:w-[64px] flex-shrink-0 overflow-hidden bg-[#F6F1E8]">
              {rs.coverUrl ? (
                <Image
                  src={rs.coverUrl}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-[#F6F1E8] flex items-center justify-center">
                  <ImageIcon size={16} strokeWidth={1.2} className="text-[#D4CBC0]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[13px] leading-[1.4] font-medium text-[#1A1612] transition-colors duration-200 group-hover:text-[#A9782F] line-clamp-2">
                {rs.title}
              </p>
              <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] text-[#9C9488]">
                <Heart
                  size={11}
                  strokeWidth={1.7}
                  className="text-[#B38744]"
                />
                {rs.reactionCount}
              </span>
            </div>
          </Link>
        ))}

        {/* View all link */}
        <Link
          href="/stories"
          className="group flex items-center gap-1.5 mt-3 pt-3 border-t border-[#F1ECE3] text-[12px] font-medium text-[#A9782F] transition-colors duration-200 hover:text-[#8A6325]"
        >
          View all stories
          <ArrowRight
            size={12}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR: CTA CARD (Logged Out)
   ═══════════════════════════════════════════════════════════════ */

function SidebarCTA() {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden border border-[#2E2820] bg-[#1A1612]">
      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative px-5 py-6 xl:px-6">
        <h4
          className="text-[18px] xl:text-[20px] leading-[1.15] tracking-[-0.04em] text-[#F7F2EA]"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 600,
          }}
        >
          Every family has a story
          <span className="italic text-[#D8BE8B]"> worth keeping.</span>
        </h4>

        <p className="mt-3 text-[12px] xl:text-[13px] leading-[1.7] text-[#B5AFA5]">
          Two minutes. Completely free. No credit card.
        </p>

        <button
          onClick={() => router.push('/signup')}
          className="group mt-5 inline-flex items-center gap-2 text-[11px] xl:text-[12px] font-medium tracking-[0.08em] uppercase text-white transition-colors duration-200 hover:text-[#D8BE8B]"
        >
          Start Your Library
          <ArrowUpRight
            size={13}
            className="transition-transform duration-200 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
          />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BOTTOM CTA BANNER
   ═══════════════════════════════════════════════════════════════ */

function BottomCTABanner({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();

  return (
    <div className="w-full border-t border-[#EDE8DF]">
      <div className="w-full px-6 md:px-10 lg:px-20 xl:px-28 py-10 sm:py-14 lg:py-16">
        <div className="relative overflow-hidden bg-[#FEFAF3]">
          {/* Decorative border */}
          <div className="absolute inset-0 border border-[#E4D2AE]/50" />

          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="bannerDots"
                  x="0"
                  y="0"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="20" cy="20" r="1" fill="#A9782F" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#bannerDots)" />
            </svg>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-10 px-8 py-10 sm:px-12 sm:py-12 lg:px-16">
            {/* Decorative icon cluster */}
            <div className="flex-shrink-0 hidden sm:flex items-center justify-center w-[100px] h-[100px] lg:w-[120px] lg:h-[120px]">
              <div className="relative">
                {/* Layered squares */}
                <div className="absolute -top-2 -left-2 w-16 h-16 border border-[#D8BE8B]/30 rotate-6" />
                <div className="absolute -top-1 -left-1 w-16 h-16 border border-[#D8BE8B]/20 -rotate-3" />
                <div className="w-16 h-16 border border-[#D8BE8B]/40 bg-[#FAF5EB] flex items-center justify-center">
                  <PenLine size={24} strokeWidth={1.2} className="text-[#A9782F]" />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 text-center sm:text-left">
              <h3
                className="text-[24px] sm:text-[28px] lg:text-[32px] leading-[1.1] tracking-[-0.04em] text-[#181512]"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 600,
                }}
              >
                Every family has a story{' '}
                <span className="italic text-[#A9782F]">worth remembering.</span>
              </h3>

              <p
                className="mt-3 text-[14px] sm:text-[15px] leading-[1.7] text-[#6F6255] max-w-[440px] mx-auto sm:mx-0"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Share your memory. Inspire someone. Preserve what truly matters.
              </p>
            </div>

            {/* Button */}
            <div className="flex-shrink-0">
              <button
                onClick={() =>
                  router.push(isLoggedIn ? '/stories/create' : '/signup')
                }
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 text-[12px] sm:text-[13px] font-semibold tracking-[0.04em] text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    'linear-gradient(135deg, #2E2820 0%, #1A1612 100%)',
                }}
              >
                <PenLine size={15} strokeWidth={1.8} />
                Share Your Memory
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      className="flex-shrink-0 rounded-full overflow-hidden border-[1.5px] border-[#E4D2AE] bg-[#FAF5EB] flex items-center justify-center"
      style={{ height: size, width: size }}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className="font-bold text-[#A9782F]"
          style={{ fontSize: Math.max(10, size * 0.28) }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="w-full px-6 md:px-10 lg:px-20 xl:px-28">
      <div className="relative border-t border-[#EDE8DF]">
        {/* Centered ornament */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-[5px] bg-white px-4">
          <div className="flex items-center gap-1.5">
            <div className="h-[3px] w-[3px] bg-[#D8BE8B]/60 rotate-45" />
            <div className="h-[4px] w-[4px] bg-[#D8BE8B] rotate-45" />
            <div className="h-[3px] w-[3px] bg-[#D8BE8B]/60 rotate-45" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return '';
}