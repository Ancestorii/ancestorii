'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Mic,
  Heart,
  MessageCircle,
  Users,
  Plus,
  Download,
  ImagePlus,
  X,
  Loader2,
  Send,
  Trash2,
} from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { ensureDisplayableImage } from '@/lib/convertImage';
import MemoryCommentSection from './MemoryCommentSection';
import type { MemoryTab, MemoryComment } from './page';

type PendingPhoto = { id: string; file: File; preview: string };

type Props = {
  memoryId: string;
  familyId: string;
  tabs: MemoryTab[];
  reactionCount: number;
  userHasReacted: boolean;
  comments: MemoryComment[];
  currentUserId: string;
  promptQuestion: string | null;
};

export default function MemoryPageContent({
  memoryId,
  familyId,
  tabs,
  reactionCount: initialReactionCount,
  userHasReacted: initialHasReacted,
  comments,
  currentUserId,
  promptQuestion,
}: Props) {
  const router = useRouter();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [reactionCount, setReactionCount] = useState(initialReactionCount);
  const [hasReacted, setHasReacted] = useState(initialHasReacted);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activeTab = tabs[activeTabIndex] || tabs[0];
  const firstName = activeTab.authorName.split(' ')[0];

  const handleReaction = async () => {
    const supabase = getBrowserClient();
    if (hasReacted) {
      await supabase
        .from('family_memory_reactions')
        .delete()
        .eq('memory_id', memoryId)
        .eq('user_id', currentUserId);
      setReactionCount((c) => c - 1);
      setHasReacted(false);
    } else {
      await supabase.from('family_memory_reactions').insert({
        memory_id: memoryId,
        family_id: familyId,
        user_id: currentUserId,
      });
      setReactionCount((c) => c + 1);
      setHasReacted(true);

      // Notify memory author
      const rootAuthorId = tabs[0]?.authorId;
      if (rootAuthorId && rootAuthorId !== currentUserId) {
        try {
          await supabase.from('notifications').insert({
            user_id: rootAuthorId,
            type: 'memory_reaction',
            actor_id: currentUserId,
            target_id: memoryId,
            target_type: 'family_memory',
          });
        } catch {}
      }
    }
  };

  const handleDeleteTab = async () => {
    if (!deleteModalId || deleting) return;
    setDeleting(true);
    const supabase = getBrowserClient();
    const { error } = await supabase.from('family_memories').delete().eq('id', deleteModalId);
    if (!error) {
      setDeleteModalId(null);
      setDeleting(false);
      if (deleteModalId === memoryId) {
        router.replace('/dashboard/home');
      } else {
        router.refresh();
        setActiveTabIndex(0);
      }
    } else {
      setDeleting(false);
    }
  };

  const dateLabel = activeTab.createdAt
    ? new Date(activeTab.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const initials = activeTab.authorName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <article className="min-h-screen bg-[#FCFAF7]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style jsx global>{`
        .memory-body-rich p { margin-bottom: 1.5rem; }
        .memory-body-rich strong { font-weight: 700; }
        .memory-body-rich em { font-style: italic; }
        .memory-body-rich u { text-decoration: underline; }
        .memory-body-rich ul { padding-left: 1.25rem; margin-bottom: 1.5rem; list-style-type: disc; }
        .memory-body-rich ol { padding-left: 1.25rem; margin-bottom: 1.5rem; list-style-type: decimal; }
        .memory-body-rich li { margin-bottom: 0.4rem; }
      `}</style>

      {/* ── Back button ── */}
      <div className="px-5 sm:px-8 pt-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[13px] font-medium text-[#8A7F72] hover:text-[#B8932A] transition-colors"
        >
          <ChevronLeft size={16} />
          Back to feed
        </button>
      </div>

      {/* ── Memory Tabs ── */}
      {tabs.length > 1 && (
        <div className="px-5 sm:px-8 pt-5">
          <div className="mx-auto max-w-[800px]">
            <div className="flex items-center gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {tabs.map((tab, i) => {
                const tabFirstName = tab.authorName.split(' ')[0];
                const isActive = i === activeTabIndex;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabIndex(i)}
                    className={`flex-shrink-0 px-4 py-2.5 text-[13px] font-medium transition-all ${
                      isActive
                        ? 'bg-[#B8932A] text-white'
                        : 'border border-[#EAD8B8] text-[#4A4030] hover:border-[#B8932A] hover:text-[#B8932A]'
                    }`}
                  >
                    {tabFirstName}&apos;s Memory
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Hero Section ── */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-5 sm:pt-6 pb-6 sm:pb-8">
        <div className="mx-auto max-w-[800px]">
          <div className="border border-[#EAD8B8] overflow-hidden bg-white">
            {/* Image */}
            {activeTab.images.length > 0 && (
              <ImageCarousel images={activeTab.images} title={activeTab.title} />
            )}

            {/* Content */}
            <div className="px-6 sm:px-8 lg:px-10 py-8 sm:py-10">
              {/* Prompt question badge */}
              {promptQuestion && activeTabIndex === 0 && (
                <div className="mb-4 px-4 py-3 bg-[#FBF7EE] border border-[#EAD8B8]">
                  <p className="text-[11px] font-medium text-[#B8932A] uppercase tracking-[0.08em] mb-1">In response to</p>
                  <p className="text-[14px] text-[#4A4030] italic">&ldquo;{promptQuestion}&rdquo;</p>
                </div>
              )}

              {/* Date */}
              {dateLabel && (
                <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#B8932A] mb-3">{dateLabel}</p>
              )}

              {/* Title */}
              <h1 className="text-[28px] sm:text-[36px] md:text-[42px] leading-[1.05] tracking-[-0.03em] text-[#1A1612] font-semibold">
                {activeTab.title}
              </h1>

              {/* Author */}
              <div className="mt-5 flex items-center gap-3">
                <div className="h-[44px] w-[44px] rounded-full overflow-hidden border-[1.5px] border-[#E4D2AE] bg-[#FAF5EB] flex items-center justify-center flex-shrink-0">
                  {activeTab.authorAvatarUrl ? (
                    <Image src={activeTab.authorAvatarUrl} alt="" width={44} height={44} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[12px] font-bold text-[#A9782F]">{initials}</span>
                  )}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#1A1612]">{activeTab.authorName}</p>
                  <p className="text-[12px] text-[#9B8E7D]">{getTimeAgo(activeTab.createdAt)}</p>
                </div>
              </div>

              {/* Engagement row */}
              <div className="mt-6 pt-5 border-t border-[#F0EBE3] flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button onClick={handleReaction} className="flex items-center gap-2 group">
                    <Heart
                      size={18}
                      strokeWidth={1.6}
                      className={`transition-transform duration-200 group-hover:scale-110 ${hasReacted ? 'text-[#C8A557]' : 'text-[#C0B9AE]'}`}
                      fill={hasReacted ? '#C8A557' : 'none'}
                    />
                    <span className="text-[14px] font-medium text-[#1A1612]">{reactionCount}</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={18} strokeWidth={1.6} className="text-[#8B7355]" />
                    <span className="text-[14px] font-medium text-[#1A1612]">{comments.length}</span>
                  </div>
                  {tabs.length > 1 && (
                    <div className="flex items-center gap-2 text-[13px] font-medium text-[#A9782F]">
                      <Users size={16} strokeWidth={1.6} />
                      {tabs.length} perspectives
                    </div>
                  )}
                </div>
                {activeTab.isAuthor && (
                  <button
                    onClick={() => setDeleteModalId(activeTab.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EDE8DF] text-[#9C9488] transition-colors hover:bg-[#FEF2F2] hover:text-[#EF4444] hover:border-[#FECACA]"
                    aria-label="Delete this memory"
                  >
                    <Trash2 size={15} strokeWidth={1.8} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body Section ── */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pb-8">
        <div className="mx-auto max-w-[800px]">
          <div className="bg-white border border-[#EAD8B8] overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="h-[2px] lg:h-auto lg:w-[3px] w-full lg:flex-shrink-0" style={{ background: 'linear-gradient(180deg, #C8A557 0%, #E4D2AE 50%, #C8A557 100%)' }} />
              <div className="flex-1 px-6 sm:px-8 lg:px-10 py-10 sm:py-12">
                {activeTab.body.includes('<') ? (
                  <div
                    className="memory-body-rich text-[15px] sm:text-[16px] leading-[1.9] text-[#2E2820]"
                    dangerouslySetInnerHTML={{ __html: activeTab.body }}
                  />
                ) : (
                  <div>
                    {activeTab.body.split('\n').filter((p) => p.trim().length > 0).map((paragraph, i) => (
                      <p key={i} className={`text-[15px] sm:text-[16px] leading-[1.9] text-[#2E2820] ${i > 0 ? 'mt-6' : ''}`}>
                        {i === 0 && paragraph.length > 0 && !'IJijl|'.includes(paragraph[0]) ? (
                          <>
                            <span className="float-left text-[#C8A557] leading-[0.8] mr-3 mt-1 text-center" style={{ fontWeight: 700, fontSize: '3.5rem', minWidth: '2.5rem' }}>
                              {paragraph[0]}
                            </span>
                            {paragraph.slice(1)}
                          </>
                        ) : paragraph}
                      </p>
                    ))}
                  </div>
                )}

                {activeTab.voiceNotePath && (
                  <div className="mt-10">
                    <VoiceNotePlayer src={activeTab.voiceNotePath} />
                  </div>
                )}

                {/* Add your memory button */}
                <div className="mt-10 pt-8 border-t border-[#F0EBE3]">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full flex items-center justify-center gap-3 py-4 border-2 border-dashed border-[#DCC7A4] bg-[#FFFDF9] text-[14px] font-semibold text-[#A9782F] transition-all hover:border-[#C8A557] hover:bg-[#FBF7EE]"
                  >
                    <Plus size={18} strokeWidth={1.8} />
                    Add your memory of this moment
                  </button>
                </div>

                {/* Comments */}
                <div className="mt-10 pt-8 border-t border-[#F0EBE3]">
                  <MemoryCommentSection
                    memoryId={memoryId}
                    familyId={familyId}
                    initialComments={comments}
                    currentUserId={currentUserId}
                    memoryAuthorId={tabs[0]?.authorId || ''}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Memory Modal ── */}
      {showAddModal && (
        <AddMemoryModal
          memoryId={memoryId}
          familyId={familyId}
          promptQuestion={promptQuestion}
          parentAuthorId={tabs[0]?.authorId || ''}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            router.refresh();
          }}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setDeleteModalId(null)} />
          <div className="relative w-[90%] max-w-[400px] bg-white px-6 py-7 sm:px-8 sm:py-8 border border-[#EDE8DF] shadow-xl">
            <h3 className="text-[18px] font-semibold text-[#1A1612]">Delete this memory?</h3>
            <p className="mt-3 text-[14px] leading-[1.7] text-[#6F6255]">
              This is permanent. All photos and comments on this memory will be removed.
            </p>
            <div className="mt-6 flex items-center gap-3 justify-end">
              <button onClick={() => setDeleteModalId(null)} disabled={deleting} className="px-4 py-2.5 text-[14px] font-medium text-[#6F6255] border border-[#EDE8DF] transition-colors hover:bg-[#FAF5EB] disabled:opacity-50">Cancel</button>
              <button onClick={handleDeleteTab} disabled={deleting} className="px-4 py-2.5 text-[14px] font-semibold text-white bg-red-600 transition-colors hover:bg-red-700 disabled:opacity-50">
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
   IMAGE CAROUSEL
   ═══════════════════════════════════════════════════════════════ */

function ImageCarousel({ images, title }: { images: { url: string }[]; title: string }) {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const touchStart = useRef<number | null>(null);

  const goTo = (i: number) => { setLoaded(false); setActive(i); };
  const goNext = () => goTo((active + 1) % images.length);
  const goPrev = () => goTo((active - 1 + images.length) % images.length);

  return (
    <div
      className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-[#F5F0E8] group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const diff = touchStart.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
        touchStart.current = null;
      }}
    >
      <Image
        key={active}
        src={images[active].url}
        alt={title}
        fill
        priority
        sizes="(max-width: 800px) 100vw, 800px"
        className={`object-cover transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoadingComplete={() => setLoaded(true)}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.12) 100%)' }} />

      {images.length > 1 && (
        <>
          <div className="absolute top-4 right-4 bg-[#1A1612]/60 backdrop-blur-sm px-3 py-1.5 text-[11px] font-medium text-white tabular-nums">{active + 1} / {images.length}</div>
          <button onClick={goPrev} className={`absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center bg-white/80 backdrop-blur-sm text-[#1A1612] transition-all ${hovered ? 'opacity-100' : 'opacity-0'}`}><ChevronLeft size={16} /></button>
          <button onClick={goNext} className={`absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center bg-white/80 backdrop-blur-sm text-[#1A1612] transition-all ${hovered ? 'opacity-100' : 'opacity-0'}`}><ChevronRight size={16} /></button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className={`h-2 transition-all ${i === active ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VOICE NOTE PLAYER
   ═══════════════════════════════════════════════════════════════ */

function VoiceNotePlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bars] = useState(() => Array.from({ length: 48 }, () => 0.2 + Math.random() * 0.8));

  const toggle = () => { const el = audioRef.current; if (!el) return; playing ? el.pause() : el.play(); setPlaying(!playing); };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => { const el = audioRef.current; if (!el || !duration) return; const pct = Math.max(0, Math.min(1, (e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.getBoundingClientRect().width)); el.currentTime = pct * duration; };
  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const pct = duration > 0 ? progress / duration : 0;

  return (
    <div className="border border-[#EAD8B8] bg-[#FEFDFB]">
      <audio ref={audioRef} src={src} preload="metadata" onTimeUpdate={(e) => setProgress((e.target as HTMLAudioElement).currentTime)} onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)} onEnded={() => setPlaying(false)} />
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-2 mb-4">
          <Mic size={13} className="text-[#A9782F]" strokeWidth={1.8} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A9782F]">Voice Note</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggle} className="flex h-[48px] w-[48px] flex-shrink-0 items-center justify-center text-white transition-transform hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(135deg, #D8BE8B 0%, #A9782F 100%)' }}>
            {playing ? <Pause size={18} strokeWidth={2.2} /> : <Play size={18} strokeWidth={2.2} className="ml-0.5" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-end gap-[2px] h-[36px] cursor-pointer" onClick={seek}>
              {bars.map((h, i) => <div key={i} className="flex-1 transition-colors" style={{ height: `${h * 100}%`, minWidth: 2, backgroundColor: i / bars.length <= pct ? '#A9782F' : '#DDD6CC' }} />)}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-[#9C9488] tabular-nums"><span>{fmt(progress)}</span><span>{fmt(duration)}</span></div>
          </div>
          <a href={src} download className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-[#9C9488] hover:text-[#A9782F] transition-colors"><Download size={16} strokeWidth={1.6} /></a>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADD MEMORY MODAL
   ═══════════════════════════════════════════════════════════════ */

function AddMemoryModal({
  memoryId,
  familyId,
  promptQuestion,
  parentAuthorId,
  onClose,
  onSuccess,
}: {
  memoryId: string;
  familyId: string;
  promptQuestion: string | null;
  parentAuthorId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const supabase = getBrowserClient();
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState('');
  const [error, setError] = useState('');

  const addPhotos = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.heic'));
    if (!arr.length) return;
    setProcessing(true);
    try {
      const converted = await Promise.all(arr.slice(0, 10 - photos.length).map((f) => ensureDisplayableImage(f)));
      setPhotos((prev) => [...prev, ...converted.map((file) => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, file, preview: URL.createObjectURL(file) }))]);
    } finally { setProcessing(false); }
  }, [photos.length]);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => { const item = prev.find((p) => p.id === id); if (item) URL.revokeObjectURL(item.preview); return prev.filter((p) => p.id !== id); });
  }, []);

  const handleSubmit = async () => {
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      setSubmitStep('Saving…');
      const { data: memory, error: memErr } = await supabase
        .from('family_memories')
        .insert({
          family_id: familyId,
          author_id: user.id,
          parent_memory_id: memoryId,
          title: promptQuestion || 'My memory of this moment',
          body: body.trim(),
        })
        .select('id')
        .single();
      if (memErr) throw memErr;

      for (let i = 0; i < photos.length; i++) {
        setSubmitStep(`Uploading photo ${i + 1}/${photos.length}…`);
        const ext = photos[i].file.name.split('.').pop() || 'jpg';
        const filePath = `${familyId}/${memory.id}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage.from('memory-media').upload(filePath, photos[i].file);
        if (upErr) throw upErr;
        await supabase.from('family_memory_media').insert({ memory_id: memory.id, family_id: familyId, user_id: user.id, file_path: filePath, file_type: 'image', display_order: i });
      }

      // Notify parent memory author
      if (parentAuthorId && parentAuthorId !== user.id) {
        try {
          await supabase.from('notifications').insert({
            user_id: parentAuthorId,
            type: 'memory_addition',
            actor_id: user.id,
            target_id: memoryId,
            target_type: 'family_memory',
          });
        } catch {}
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && onClose()} />
      <div className="relative w-full max-w-[520px] max-h-[90vh] overflow-y-auto bg-white border border-[#EAD8B8] shadow-xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-semibold text-[#1A1612]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              Add your <span className="italic text-[#A9782F]">memory</span>
            </h3>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F0E8] transition"><X size={16} className="text-[#7D6F5F]" /></button>
          </div>

          {promptQuestion && (
            <div className="px-4 py-3 bg-[#FBF7EE] border border-[#EAD8B8]">
              <p className="text-[11px] font-medium text-[#B8932A] uppercase tracking-[0.08em] mb-1">The question</p>
              <p className="text-[14px] text-[#4A4030] italic">&ldquo;{promptQuestion}&rdquo;</p>
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">Your memory</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What do you remember about this moment?" rows={5} className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] placeholder-[#C0B9AE] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A] resize-none leading-relaxed" style={{ background: '#FDFCFA' }} />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">Photos <span className="text-[#B5AFA6] font-normal">(optional)</span></label>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {photos.map((p) => (
                  <div key={p.id} className="group relative aspect-square overflow-hidden bg-[#F0EDE8] border border-[#ECE5D8]">
                    <Image src={p.preview} alt="" fill className="object-cover" />
                    {!submitting && <button onClick={() => removePhoto(p.id)} className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center bg-white/90 text-[#8B3A32] opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>}
                  </div>
                ))}
              </div>
            )}
            {photos.length < 10 && (
              <label className={`flex flex-col items-center justify-center border-2 border-dashed px-5 py-4 cursor-pointer transition-all ${processing ? 'border-[#B8932A] bg-[#FBF7EE]' : 'border-[#E0D6C8] bg-[#FDFCFA] hover:border-[#B8932A]'}`}>
                {processing ? <Loader2 size={20} className="animate-spin text-[#B8932A] mb-1" /> : <ImagePlus size={20} className="text-[#B8932A] mb-1" />}
                <p className="text-[12px] font-medium text-[#4A4030]">{processing ? 'Processing…' : photos.length > 0 ? 'Add more' : 'Add a photo'}</p>
                <input type="file" accept="image/*,.heic" multiple hidden disabled={processing} onChange={(e) => { if (e.target.files?.length) addPhotos(e.target.files); e.target.value = ''; }} />
              </label>
            )}
          </div>

          {error && <div className="border border-[#E8C4C0] bg-[#FDF6F5] px-4 py-3"><p className="text-[13px] text-[#8B3A32]">{error}</p></div>}

          <button onClick={handleSubmit} disabled={!body.trim() || submitting} className="w-full py-3 text-[13px] font-semibold tracking-[0.04em] text-[#FFFDF8] transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)' }}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {submitting ? submitStep || 'Saving…' : 'Share your memory'}
          </button>
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
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}