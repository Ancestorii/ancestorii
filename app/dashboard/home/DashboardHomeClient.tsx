'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Plus,
  HandHeart,
  User as UserIcon,
} from 'lucide-react';

export default function DashboardHomeClient({
  displayName,
  firstName,
  homeImages,
  activeMemory,
  pinnedCount,
  showDesktopToast,
  onDismissDesktopToast,
  onNextMemory,
  onPrevMemory,
  onSetActiveMemory,
  onUploadHomeImage,
  onGoToFamilyAdd,
  onGoToLibrary,
  onGoToFamily,
  onGoToTimeline,
  onGoToCapsules,
  onGoToAlbums,
  onGoToBooks,
  metrics,
  lovedOnes,
  activity,
}: {
  displayName: string | null;
  firstName: string;
  email: string | null;
  homeImages: (string | null)[];
  activeMemory: number;
  pinnedCount: number;
  showDesktopToast?: boolean;
  onDismissDesktopToast?: () => void;
  onNextMemory: () => void;
  onPrevMemory: () => void;
  onSetActiveMemory: (index: number) => void;
  onUploadHomeImage: (file: File, index: number) => void | Promise<void>;
  onGoToFamilyAdd: () => void;
  onGoToLibrary: () => void;
  onGoToFamily: () => void;
  onGoToTimeline?: () => void;
  onGoToCapsules?: () => void;
  onGoToAlbums?: () => void;
  onGoToBooks?: () => void;
  metrics: {
  lovedOnes: number;
  memories: number;
  timelines: number;
  albums: number;
  capsules: number;
  voiceNotes: number;
  totalCollectionItems: number;
};
  lovedOnes: Array<{
  id: string;
  full_name: string;
  relationship_to_user?: string | null;
  relationship_label?: string;
  avatar_signed?: string | null;
  memories_count?: number;
}>;
  activity: Array<{
    id: string;
    action: string;
    target_type?: string;
    created_at: string;
  }>;
  latestCapsule?: any;
}) {
  const placeholders = [
    'A moment that changed everything. Add a memory that still means something.',
    'Someone who shaped your world. Keep their story close.',
    'A place or day that deserves to be remembered.',
    'A memory that still makes you smile.',
    'One moment you never want to lose.',
  ];

  const welcomeName = displayName || 'there';

  const welcomeNameClass =
    welcomeName.length > 24
      ? 'text-[clamp(2.15rem,4.2vw,5.2rem)]'
      : welcomeName.length > 18
      ? 'text-[clamp(2.4rem,4.7vw,5.8rem)]'
      : welcomeName.length > 12
      ? 'text-[clamp(2.65rem,5vw,6.2rem)]'
      : 'text-[clamp(2.9rem,5.3vw,6.6rem)]';

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  useEffect(() => {
  homeImages.forEach((src) => {
    if (!src) return;
    const img = new window.Image();
    img.src = src;
  });
}, [homeImages]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf8f1_0%,#f6f0e5_50%,#f7f1e8_100%)] text-[#20180f]">
      {showDesktopToast && (
  <div
    className="fixed inset-0 z-[9999] flex items-end justify-center p-4 sm:hidden"
    style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)' }}
  >
    <div
      style={{
        background: '#FDFAF5',
        borderRadius: 20,
        padding: '28px 24px 24px',
        width: '100%',
        maxWidth: 360,
        textAlign: 'center',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
        marginBottom: 12,
      }}
    >
      <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1714', lineHeight: 1.5 }}>
        Your memories deserve a bigger canvas.
      </p>
      <p style={{ fontSize: 13, color: '#6B6358', marginTop: 6, lineHeight: 1.5 }}>
        Switch to a laptop or tablet for the full experience.
      </p>
      <button
        onClick={onDismissDesktopToast}
        style={{
          marginTop: 18,
          fontSize: 13,
          fontWeight: 700,
          color: '#B8860B',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        I'll explore for now
      </button>
    </div>
  </div>
)}
      {/* ======================================== */}
      {/* TOP STRIP */}
      {/* ======================================== */}

      <section className="relative overflow-hidden bg-[linear-gradient(90deg,#100b06_0%,#16100a_45%,#1a130c_100%)]">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(171,130,50,0.12),transparent_35%),radial-gradient(circle_at_right,rgba(255,255,255,0.03),transparent_25%)]" />

  <div className="relative mx-auto max-w-[1700px] px-[clamp(1rem,3vw,4rem)] py-[clamp(1.5rem,1.8vw,2.25rem)]">
    <div className="flex flex-col gap-[clamp(1.25rem,1.5vw,1.75rem)] lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 flex-1 xl:max-w-none">
        <p className="text-[clamp(10px,0.9vw,12px)] font-semibold uppercase tracking-[0.28em] text-[#d3a847]">
          {todayLabel}
        </p>

        <h1 className={`mt-[clamp(0.75rem,0.8vw,1rem)] font-serif leading-[1.10] text-[#fff7eb] ${welcomeNameClass}`}>
  <span className="block">Welcome back,</span>
  <span className="block italic text-[#c99732]">
    {welcomeName}.
  </span>
</h1>

       <p className="mt-[clamp(1rem,1.2vw,1.5rem)] text-[clamp(15px,1.2vw,16px)] leading-[1.55] lg:leading-[1.6] text-[#f0dfc6]">
          {metrics.totalCollectionItems > 0 ? 'Your collection is growing.' : 'Your collection starts here.'}{' '}
          <span className="text-[#ffffff]">
            {metrics.totalCollectionItems > 0
            ? `${metrics.totalCollectionItems} stories preserved.`
            : 'Add your first memory to begin.'}
          </span>
        </p>
      </div>
    </div>
  </div>
</section>

{/* ======================================== */}
{/* HERO */}
{/* ======================================== */}
<section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fdfbf7_55%,#fcfaf6_100%)]">
  {/* Soft background shapes */}
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute left-[-110px] top-[10px] h-[250px] w-[250px] rounded-full bg-gradient-to-tr from-[#d4af37]/10 via-[#e7c76d]/6 to-transparent blur-3xl" />
    <div className="absolute right-[-90px] top-[40px] h-[220px] w-[220px] rounded-full bg-gradient-to-br from-[#c9d8f0]/10 via-[#102347]/4 to-transparent blur-3xl" />
    <div className="absolute left-[18%] top-[65%] h-[140px] w-[140px] rounded-full bg-white/70 blur-3xl" />
  </div>

  <div className="relative mx-auto max-w-[1500px] px-[clamp(1.5rem,3vw,3.5rem)] py-[clamp(4rem,4.5vw,5rem)]">
    <div className="flex flex-col-reverse items-center gap-[clamp(3rem,3.5vw,3.5rem)] lg:flex-row lg:items-start">
      {/* LEFT */}
      <div className="w-full lg:w-1/2 text-center lg:text-left">
        <div className="flex items-center justify-center gap-3 lg:justify-start">
          <div className="h-[2px] w-12 rounded-full bg-[#d4af37]" />
          <p className="text-[12px] font-bold uppercase tracking-[0.32em] text-[#8f774e]">
            Build your story
          </p>
        </div>

        <h2 className="mt-6 font-serif text-[clamp(2.8rem,4vw,4.6rem)] leading-[0.96] text-[#102347]">
          Start with one memory.
          <br />
          <span className="italic text-[#c99732]">Keep what matters.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-[620px] text-[clamp(15px,1.3vw,18px)] leading-[1.95] text-[#42536d] lg:mx-0">
          Add the people you love, upload your most meaningful moments from any device, and build
          a family library that feels beautiful, personal, and worth returning to.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
          <button
            onClick={onGoToFamilyAdd}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#d4af37] to-[#ebc96e] px-7 py-3 text-[15px] font-semibold text-[#1f2837] shadow-[0_12px_28px_rgba(212,175,55,0.18)] transition hover:-translate-y-[1px]"
          >
            <HandHeart size={17} />
            Add a Loved One
          </button>

          <button
            onClick={onGoToLibrary}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#102347]/10 bg-white px-7 py-3 text-[15px] font-semibold text-[#102347] shadow-[0_8px_18px_rgba(16,35,71,0.05)] transition hover:bg-[#fdfdfd]"
          >
            <BookOpen size={17} />
            Upload to My Library
          </button>
        </div>

        {/* MEMORY BOOKS SUB-SECTION */}
        <div className="relative mt-8">
         <div className="absolute left-0 top-0 hidden h-full w-[2px] rounded-full bg-[linear-gradient(180deg,#d4af37_0%,#b9811f_100%)] lg:block" />

         <div className="relative overflow-hidden rounded-[clamp(20px,2vw,26px)] border border-[#d7bf91] bg-[linear-gradient(180deg,#fffdf9_0%,#f6eee0_100%)] px-[clamp(1.25rem,1.8vw,1.5rem)] py-[clamp(1.25rem,1.8vw,1.5rem)] shadow-[0_18px_42px_rgba(22,18,12,0.12)] lg:ml-5">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-[-35px] top-[-35px] h-[110px] w-[110px] rounded-full bg-[#d4af37]/8 blur-3xl" />
              <div className="absolute inset-x-0 top-0 h-[1px] bg-[linear-gradient(90deg,rgba(212,175,55,0),rgba(212,175,55,0.55),rgba(212,175,55,0))]" />
            </div>

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-[520px] text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a6781f]">
                  Memory Books
                </p>

                <h3 className="mt-2 font-serif text-[clamp(1.5rem,2.2vw,1.7rem)] leading-[1.02] text-[#16120C]">
                  Start your
                  <span className="italic text-[#b67f18]"> physical library.</span>
                </h3>

                <p className="mt-3 text-[clamp(13px,1.1vw,15px)] leading-[1.8] text-[#4f4334]">
                  Turn your memories into a printed book made to sit on a real shelf and be held for generations.
                </p>
              </div>

              <button
                onClick={onGoToBooks}
               className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[linear-gradient(90deg,#100b06_0%,#16100a_45%,#1a130c_100%)] px-6 py-3 text-[14px] font-semibold whitespace-nowrap text-white shadow-[0_14px_28px_rgba(22,18,12,0.18)] transition hover:-translate-y-[1px] sm:self-auto"
              >
                Create your book
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative flex w-full justify-center lg:w-1/2 lg:justify-end">
        <div className="relative w-full max-w-[620px]">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[12px] font-bold uppercase tracking-[0.34em] text-[#a27622]">
                Highlighted memories
              </p>
              <h3 className="mt-2 text-[clamp(23px,2.5vw,28px)] font-semibold italic text-[#102347]">
                Your <span className="text-[#d4af37]">most meaningful memories</span>
              </h3>
            </div>

            <div className="hidden items-center gap-3 xl:flex">
              <button
                onClick={onPrevMemory}
                aria-label="Previous Memory"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#102347]/10 bg-white/95 text-[#102347] shadow-[0_8px_18px_rgba(16,35,71,0.06)] transition hover:bg-white"
              >
                <ArrowLeft size={18} />
              </button>

              <button
                onClick={onNextMemory}
                aria-label="Next Memory"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#102347]/10 bg-white/95 text-[#102347] shadow-[0_8px_18px_rgba(16,35,71,0.06)] transition hover:bg-white"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <MemoryDropCard
            index={activeMemory}
            image={homeImages[activeMemory]}
            placeholder={placeholders[activeMemory]}
            className="w-full"
            innerHeightClass="aspect-square max-h-[520px]"
            onUpload={onUploadHomeImage}
          />

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[14px] leading-[1.75] text-[#445774]">
              Choose up to <span className="font-semibold text-[#102347]">five</span>{' '}
              moments to live here.
            </p>

            <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-start">
              <div className="flex gap-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <button
                    key={i}
                    onClick={() => onSetActiveMemory(i)}
                    aria-label={`Select memory ${i + 1}`}
                    className={`h-3 w-3 rounded-full transition ${
                      activeMemory === i ? 'bg-[#d4af37]' : 'bg-[#aab6c8]'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2 xl:hidden">
                <button
                  onClick={onPrevMemory}
                  aria-label="Previous"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#102347]/10 bg-white/95 text-[#102347] shadow-[0_8px_18px_rgba(16,35,71,0.05)] transition hover:bg-white"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={onNextMemory}
                  aria-label="Next"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#102347]/10 bg-white/95 text-[#102347] shadow-[0_8px_18px_rgba(16,35,71,0.05)] transition hover:bg-white"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

   {/* ======================================== */}
{/* COLLECTION STRIP */}
{/* ======================================== */}
<section className="border-y border-transparent bg-[linear-gradient(180deg,#fffdfa_0%,#fbf8f2_100%)] [border-image:linear-gradient(90deg,#d4af37_0%,#ecd598_50%,#d4af37_100%)_1]">
  <div className="mx-auto max-w-[1700px] px-[clamp(1.5rem,3vw,4rem)] py-[clamp(2.5rem,3vw,3.5rem)]">
    <div className="mb-[clamp(1.5rem,2.5vw,2.5rem)] flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.28em] text-[#a86f12]">
          Your collection
        </p>
        <h3 className="mt-2 text-[clamp(2rem,3vw,2.5rem)] font-semibold tracking-[-0.04em] text-[#16120C]">
          Everything you're building
        </h3>
      </div>

      <p className="max-w-[540px] text-[15px] leading-[1.7] text-[#4f4334]">
        A clear view of the spaces where your memories are taking shape.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricBlock
  value={metrics.lovedOnes}
  label="Loved ones"
  actionLabel={
    metrics.lovedOnes === 0
      ? '+ Add your first loved one'
      : '+ Add another loved one'
  }
  onAction={onGoToFamilyAdd}
/>
<MetricBlock
  value={metrics.timelines}
  label="Timelines"
  actionLabel={
    metrics.timelines === 0
      ? '+ Add your first timeline'
      : '+ Add another timeline'
  }
  onAction={onGoToTimeline}
/>
<MetricBlock
  value={metrics.capsules}
  label="Capsules"
  actionLabel={
    metrics.capsules === 0
      ? '+ Add your first capsule'
      : '+ Add another capsule'
  }
  onAction={onGoToCapsules}
/>
<MetricBlock
  value={metrics.albums}
  label="Albums"
  actionLabel={
    metrics.albums === 0
      ? '+ Add your first album'
      : '+ Add another album'
  }
  onAction={onGoToAlbums}
/>
    </div>
  </div>
</section>


      {/* ======================================== */}
{/* FAMILY + ACTIVITY — LIGHTER / SMALLER */}
{/* ======================================== */}
<section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fcfaf6_100%)]">
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute left-[-120px] top-[110px] h-[200px] w-[200px] rounded-full bg-[#d4af37]/8 blur-3xl" />
    <div className="absolute right-[-90px] top-[30px] h-[170px] w-[170px] rounded-full bg-[#efe4c8]/55 blur-3xl" />
  </div>

  <div className="relative mx-auto max-w-[1420px] px-[clamp(1.25rem,2vw,2.5rem)] py-[clamp(2rem,2.5vw,2.5rem)]">
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.03fr_0.97fr] xl:gap-6">
      {/* LEFT — FAMILY */}
      <div className="relative overflow-hidden rounded-[26px] border border-[#dcc8a5] bg-white shadow-[0_16px_36px_rgba(22,18,12,0.08)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#d4af37_0%,#ecd598_50%,#d4af37_100%)]" />

        <div className="px-[clamp(1.25rem,1.5vw,1.75rem)] py-[clamp(1.5rem,1.8vw,1.75rem)]">
          <div className="max-w-[500px]">
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#a86f12]">
              Your family
            </p>

            <h3 className="mt-3 font-serif text-[clamp(1.55rem,1.8vw,2.05rem)] leading-[0.96] text-[#16120C]">
              The people
              <br />
              <span className="italic text-[#c99732]">who shaped your story.</span>
            </h3>

            <p className="mt-4 max-w-[380px] text-[clamp(12px,1vw,13px)] leading-[1.7] text-[#4b3f31]">
              Open a profile, revisit someone important, or start someone new.
            </p>
          </div>

          <div className="mt-6 border-t border-[#ece2d2]">
            {lovedOnes.map((person, idx) => (
              <button
                key={person.id}
                onClick={onGoToFamily}
               className="group grid w-full grid-cols-[18px_auto_1fr_auto] items-center gap-[clamp(0.75rem,1vw,1rem)] border-b border-[#e4d4bb] py-[clamp(0.875rem,1vw,1rem)] text-left transition hover:bg-[#faf5ec] sm:grid-cols-[22px_auto_1fr_auto]"
              >
                <div className="text-[clamp(10px,0.85vw,11px)] font-bold tracking-[0.18em] text-[#a86f12]">
                  {String(idx + 1).padStart(2, '0')}
                </div>

                {person.avatar_signed ? (
  <div className="h-[clamp(40px,4vw,52px)] w-[clamp(40px,4vw,52px)] overflow-hidden rounded-full ring-1 ring-[#e4d3b2]">
    <Image
      src={person.avatar_signed}
      alt={person.full_name}
      width={52}
      height={52}
      quality={100}
      className="h-full w-full object-cover"
    />
  </div>
) : (
  <div className="h-[clamp(40px,4vw,52px)] w-[clamp(40px,4vw,52px)] overflow-hidden rounded-full ring-1 ring-[#e4d3b2]">
    <div className="flex h-full w-full items-center justify-center bg-[#f6efe2]">
      <UserIcon className="h-[clamp(1rem,1.6vw,22px)] w-[clamp(1rem,1.6vw,22px)] text-[#8b6a2d]" />
    </div>
  </div>
)}

                <div className="min-w-0">
                  <div className="truncate font-serif text-[clamp(16px,1.3vw,18px)] leading-none text-[#16120C]">
                    {person.full_name}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[clamp(10px,0.85vw,11px)] font-semibold uppercase tracking-[0.12em] text-[#72685b]">
                    <span>
                      {person.relationship_label || person.relationship_to_user || 'Loved one'}
                    </span>
                    {typeof person.memories_count === 'number' && (
                      <>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-[clamp(17px,1.4vw,19px)] font-semibold text-[#7d5b14] transition duration-200 group-hover:translate-x-[4px]">
                  →
                </div>
              </button>
            ))}

            <button
              onClick={onGoToFamilyAdd}
              className="group grid w-full grid-cols-[18px_auto_1fr_auto] items-center gap-[clamp(0.75rem,1vw,1rem)] py-[clamp(0.875rem,1vw,1rem)] text-left transition hover:bg-[#fcfaf6] sm:grid-cols-[22px_auto_1fr_auto]"
            >
              <div className="text-[11px] font-semibold tracking-[0.18em] text-[#b3872f]">
                +
              </div>

            <div className="flex h-[clamp(40px,3.5vw,48px)] w-[clamp(40px,3.5vw,48px)] items-center justify-center">
  <Plus className="h-[clamp(1.25rem,1.5vw,1.5rem)] w-[clamp(1.25rem,1.5vw,1.5rem)] text-[#b99751]" strokeWidth={1.75} />
</div>

              <div className="min-w-0">
                <div className="font-serif text-[clamp(16px,1.3vw,18px)] leading-none text-[#16120C]">
                  Add a loved one
                </div>
                <div className="mt-2 text-[clamp(10px,0.85vw,11px)] font-semibold uppercase tracking-[0.12em] text-[#72685b]">
                  Start a new profile
                </div>
              </div>

              <div className="text-[clamp(17px,1.4vw,19px)] font-light text-[#8f7440] transition duration-200 group-hover:translate-x-[4px]">
                →
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT — ACTIVITY */}
      <div className="relative overflow-hidden rounded-[26px] border border-[#dcc8a5] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe2_100%)] shadow-[0_16px_36px_rgba(22,18,12,0.08)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#100b06_0%,#16100a_45%,#1a130c_100%)]" />
          <div className="absolute right-[-50px] top-[70px] h-[130px] w-[130px] rounded-full bg-[#d4af37]/8 blur-3xl" />
        </div>

        <div className="relative px-[clamp(1.25rem,1.5vw,1.75rem)] py-[clamp(1.5rem,1.8vw,1.75rem)]">
          <div className="max-w-[420px]">
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#a86f12]">
              Recent activity
            </p>

            <h3 className="mt-3 font-serif text-[clamp(1.55rem,1.8vw,2.05rem)] leading-[0.96] text-[#16120C]">
              The latest
              <br />
              <span className="italic text-[#c99732]">changes you made.</span>
            </h3>

           <p className="mt-4 max-w-[340px] text-[clamp(12px,1vw,13px)] leading-[1.7] text-[#4b3f31]">
              A tighter view of what was added most recently.
            </p>
          </div>

          {activity.length > 0 ? (
            <div className="mt-6">
              {activity.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[30px_1fr] gap-[clamp(0.75rem,1vw,1rem)] border-t border-[#e4d4bb] py-[clamp(0.875rem,1vw,1rem)] sm:grid-cols-[36px_1fr]"
                >
                  <div className="pt-1">
                    <div className="text-[clamp(15px,1.3vw,17px)] font-semibold leading-none tracking-[-0.04em] text-[#c99732]">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                  </div>

                  <div>
                    <div className="font-serif text-[clamp(16px,1.3vw,18px)] leading-[1.35] text-[#16120C]">
                      {item.action}
                    </div>
                    <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5f5142]">
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t border-[#ece2d2]" />
            </div>
          ) : (
            <div className="mt-6 border-y border-[#ece2d2] py-5">
              <div className="font-serif text-[clamp(16px,1.3vw,18px)] text-[#16120C]">
                No recent activity yet.
              </div>
              <div className="mt-2 max-w-[320px] text-[12px] leading-[1.7] text-[#786c5d]">
                Once you start adding memories, updates will appear here.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</section>
    </div>
  );
}

function MetricBlock({
  value,
  label,
  actionLabel,
  onAction,
}: {
  value: number;
  label: string;
  actionLabel: string;
  onAction?: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-[#dcc8a5] bg-[linear-gradient(180deg,#fffdfa_0%,#f6efe3_100%)] px-[clamp(1.25rem,1.5vw,1.5rem)] py-[clamp(1.5rem,1.8vw,1.75rem)] shadow-[0_12px_30px_rgba(22,18,12,0.08)] transition duration-300 hover:-translate-y-[2px] hover:shadow-[0_18px_38px_rgba(22,18,12,0.12)]">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#d4af37_0%,#ecd598_50%,#d4af37_100%)]" />
      <div className="pointer-events-none absolute right-[-24px] top-[-24px] h-20 w-20 rounded-full bg-[#d4af37]/8 blur-2xl" />

      <div className="relative z-10">
        <div className="text-[clamp(3.2rem,4.5vw,3.8rem)] font-semibold leading-none tracking-[-0.06em] text-[#16120C]">
          {value}
        </div>

        <div className="mt-3 text-[17px] font-semibold text-[#231b14]">
          {label}
        </div>

        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center text-[14px] font-bold text-[#a86f12] transition hover:text-[#7d5306]"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function AvatarInitial({ name }: { name: string }) {
  const initial = name?.trim()?.[0]?.toUpperCase() || '?';

  const styles = [
    'bg-[#f2e3bf] text-[#8b6520]',
    'bg-[#e6efe7] text-[#2f6a42]',
    'bg-[#ece7f6] text-[#56419a]',
    'bg-[#f4e5dc] text-[#95563d]',
  ];

  const picked = styles[(initial.charCodeAt(0) || 0) % styles.length];

  return (
    <div
      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ring-1 ring-[#e4d3b2] font-serif text-[19px] ${picked}`}
    >
      {initial}
    </div>
  );
}

function MemoryDropCard({
  index,
  image,
  placeholder,
  className,
  innerHeightClass,
  onUpload,
}: {
  index: number;
  image: string | null;
  placeholder: string;
  className: string;
  innerHeightClass: string;
  onUpload: (file: File, index: number) => void | Promise<void>;
}) {
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [image]);

  return (
    <label
      className={`group relative block overflow-hidden rounded-[22px] bg-transparent p-0 shadow-none transition duration-300 ${className}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) {
          setLoaded(false);
          setUploading(true);
          Promise.resolve(onUpload(f, index)).finally(() => {
            setUploading(false);
          });
        }
      }}
    >
      <div
        className={`relative overflow-hidden rounded-[22px] border border-[#102347]/6 bg-[#efe6d8] ${innerHeightClass}`}
      >
        {uploading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#d4af37]/35 border-t-[#d4af37]" />
          </div>
        )}

        {image ? (
          <div className="relative h-full w-full">
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 70vw, 620px"
              className={`object-contain bg-[#efe6d8] transition-opacity duration-300 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
              priority
              onLoadingComplete={() => {
                setLoaded(true);
                setUploading(false);
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/24 via-black/5 to-transparent" />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#102347] shadow-[0_10px_20px_rgba(16,35,71,0.08)]">
              <Plus size={20} />
            </div>
            <p className="text-[clamp(18px,2.5vw,20px)] font-semibold leading-[1.45] text-[#102347]">
              {placeholder.split('.')[0]}.
            </p>
            <p className="mt-3 text-[clamp(13px,1.8vw,15px)] leading-[1.75] text-[#4f5e77]">
              {placeholder.split('.').slice(1).join('.')}
            </p>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setLoaded(false);
            setUploading(true);
            Promise.resolve(onUpload(f, index)).finally(() => {
              setUploading(false);
            });
          }
        }}
      />
    </label>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}