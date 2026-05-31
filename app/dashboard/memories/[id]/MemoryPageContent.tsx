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
  ImageIcon,
  X,
  Loader2,
  Send,
  Trash2,
  PenLine,
  MoreVertical,
  Flag,
  Share2,
} from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { ensureDisplayableImage } from '@/lib/convertImage';
import CommentItem from '@/components/stories/comments/CommentItem';
import CommentInput from '@/components/stories/comments/CommentInput';
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
  comments: initialComments,
  currentUserId,
  promptQuestion,
}: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [reactionCount, setReactionCount] = useState(initialReactionCount);
  const [hasReacted, setHasReacted] = useState(initialHasReacted);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  const [comments, setComments] = useState(initialComments);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

  const activeTab = tabs[activeTabIndex] || tabs[0];
  const initials = activeTab.authorName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const dateLabel = activeTab.createdAt
    ? new Date(activeTab.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const timeAgo = activeTab.createdAt ? getTimeAgo(activeTab.createdAt) : '';
  const strippedBody = activeTab.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const preview = strippedBody.length > 160 ? strippedBody.slice(0, 160).trim() + '…' : strippedBody;

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [menuOpen]);

  const handleReaction = async () => {
    const supabase = getBrowserClient();
    if (hasReacted) {
      const { error } = await supabase.from('family_memory_reactions').delete().eq('memory_id', memoryId).eq('user_id', currentUserId);
      if (!error) { setReactionCount((c) => c - 1); setHasReacted(false); }
    } else {
      const { error } = await supabase.from('family_memory_reactions').insert({ memory_id: memoryId, family_id: familyId, user_id: currentUserId });
      if (!error) {
        setReactionCount((c) => c + 1);
        setHasReacted(true);
        const rootAuthorId = tabs[0]?.authorId;
        if (rootAuthorId && rootAuthorId !== currentUserId) {
          try { await supabase.from('notifications').insert({ user_id: rootAuthorId, type: 'memory_reaction', actor_id: currentUserId, target_id: memoryId, target_type: 'family_memory' }); } catch {}
        }
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
      if (deleteModalId === memoryId) { router.replace('/dashboard/home'); } else { router.refresh(); setActiveTabIndex(0); }
    } else { setDeleting(false); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/dashboard/memories/${memoryId}`;
    const text = `${activeTab.title} — a memory on Ancestorii`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Ancestorii', text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const fetchComments = async () => {
    const supabase = getBrowserClient();
    const { data } = await supabase.from('family_memory_comments').select('id, user_id, author_name, author_avatar_url, content, created_at, parent_id').eq('memory_id', memoryId).order('created_at');
    if (data) {
      const withSignedAvatars = await Promise.all(
        data.map(async (c) => {
          if (c.author_avatar_url && !c.author_avatar_url.startsWith('http')) {
            const { data: s } = await supabase.storage.from('user-media').createSignedUrl(c.author_avatar_url, 3600);
            return { ...c, author_avatar_url: s?.signedUrl || null };
          }
          return c;
        })
      );
      setComments(withSignedAvatars);
    }
  };

  const handleCommentSubmit = async (content: string) => {
    const supabase = getBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('Profiles').select('full_name, profile_image_url, avatar_url').eq('id', user.id).single();
    const avatarPath = profile?.profile_image_url || profile?.avatar_url || null;
    const { error } = await supabase.from('family_memory_comments').insert({ memory_id: memoryId, family_id: familyId, user_id: user.id, author_name: profile?.full_name || 'Family Member', author_avatar_url: avatarPath, content, parent_id: replyingTo?.id || null });
    if (!error) {
      const memoryAuthorId = tabs[0]?.authorId;
      if (memoryAuthorId && memoryAuthorId !== user.id) {
        try { await supabase.from('notifications').insert({ user_id: memoryAuthorId, type: 'memory_comment', actor_id: user.id, target_id: memoryId, target_type: 'family_memory' }); } catch {}
      }
      await fetchComments();
      setReplyingTo(null);
    } else {
      console.error('Comment insert failed:', error.message);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    const supabase = getBrowserClient();
    const { error } = await supabase.from('family_memory_comments').delete().eq('id', commentId);
    if (!error) { setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId)); }
  };

  const topLevelComments = comments.filter((c) => !c.parent_id);
  const repliesByParent = new Map<string, MemoryComment[]>();
  comments.filter((c) => c.parent_id).forEach((c) => {
    const existing = repliesByParent.get(c.parent_id!) || [];
    existing.push(c);
    repliesByParent.set(c.parent_id!, existing);
  });

  const mapToStoryComment = (c: MemoryComment) => ({
    id: c.id, story_id: memoryId, user_id: c.user_id, author_name: c.author_name, author_avatar_url: c.author_avatar_url, author_title: null, content: c.content, created_at: c.created_at, updated_at: c.created_at, parent_id: c.parent_id,
  });

  return (
    <article className="w-full" style={{ background: '#FFFDF8' }}>
      <style jsx global>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .memory-body-rich p { margin-bottom: 1.5rem; }
        .memory-body-rich strong { font-weight: 700; }
        .memory-body-rich em { font-style: italic; }
        .memory-body-rich u { text-decoration: underline; }
        .memory-body-rich ul { padding-left: 1.25rem; margin-bottom: 1.5rem; list-style-type: disc; }
        .memory-body-rich ol { padding-left: 1.25rem; margin-bottom: 1.5rem; list-style-type: decimal; }
        .memory-body-rich li { margin-bottom: 0.4rem; }
        .animate-fade-up { animation: fadeUp 0.7s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-slide-right { animation: slideInRight 0.7s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.5s ease-out forwards; }
      `}</style>

      {/* ═══ BREADCRUMB ═══ */}
      <div className="w-full px-6 md:px-10 lg:px-20 xl:px-28 pt-5 sm:pt-6">
        <nav className={`flex items-center gap-1.5 text-[12px] sm:text-[13px] ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[#9C9488] transition-colors duration-200 hover:text-[#A9782F]">
            <ChevronLeft size={14} />
            Back to feed
          </button>
          <ChevronRight size={12} className="text-[#D4CBC0]" />
          <span className="text-[#1A1612] font-medium truncate max-w-[260px]">{activeTab.title}</span>
        </nav>
      </div>

      {/* ═══ TABS ═══ */}
      {tabs.length > 1 && (
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-5">
          <div className="flex items-center gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {tabs.map((tab, i) => {
              const tabFirstName = tab.authorName.split(' ')[0];
              return (
                <button key={tab.id} onClick={() => setActiveTabIndex(i)} className={`flex-shrink-0 px-4 py-2.5 text-[13px] font-medium transition-all ${i === activeTabIndex ? 'bg-[#B8932A] text-white' : 'border border-[#EAD8B8] text-[#4A4030] hover:border-[#B8932A] hover:text-[#B8932A]'}`}>
                  {tabFirstName}&apos;s Memory
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ HERO ═══ */}
      <div className={`w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-4 sm:pt-6 pb-6 sm:pb-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="border border-[#EDE8DF] overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:min-h-[480px]">
            {/* Content left */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-12 xl:px-14 2xl:px-16 py-8 sm:py-10 lg:py-12 bg-white order-last lg:order-first">
              {promptQuestion && activeTabIndex === 0 && (
                <div className="mb-5 px-4 py-3 bg-[#FBF7EE] border border-[#EAD8B8]">
                  <p className="text-[11px] font-medium text-[#B8932A] uppercase tracking-[0.08em] mb-1">In response to</p>
                  <p className="text-[14px] text-[#4A4030] italic" style={{ fontFamily: "'DM Sans', sans-serif" }}>&ldquo;{promptQuestion}&rdquo;</p>
                </div>
              )}
              {dateLabel && (<div className="flex items-center gap-2.5 mb-5"><span className="text-[11px] sm:text-[12px] lg:text-[13px] xl:text-[14px] font-bold uppercase tracking-[0.14em] text-[#C8A557]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{dateLabel}</span></div>)}
              <h1 className="text-[30px] sm:text-[38px] md:text-[46px] lg:text-[52px] xl:text-[58px] 2xl:text-[64px] leading-[1.0] tracking-[-0.04em] text-[#1A1612]" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{activeTab.title}</h1>
              <p className="mt-4 sm:mt-5 text-[15px] sm:text-[16px] lg:text-[17px] xl:text-[18px] 2xl:text-[19px] leading-[1.8] text-[#6F6255] max-w-[92%]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{preview}</p>
              <div className="mt-6 lg:mt-8 flex items-center gap-3">
                <AuthorAvatar avatarUrl={activeTab.authorAvatarUrl} name={activeTab.authorName} initials={initials} size={48} />
                <div>
                  <span className="text-[14px] sm:text-[15px] lg:text-[16px] xl:text-[17px] font-semibold text-[#1A1612] block" style={{ fontFamily: "'DM Sans', sans-serif" }}>{activeTab.authorName}</span>
                  <span className="block text-[12px] sm:text-[13px] lg:text-[14px] text-[#9C9488]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{timeAgo || 'Just shared'}</span>
                </div>
              </div>
              {/* Engagement row */}
              <div className="mt-6 lg:mt-8 pt-5 border-t border-[#F0EBE3] flex items-center">
                <div className="flex items-center gap-5">
                  <button onClick={handleReaction} className="flex items-center gap-2 group">
                  <Heart size={18} strokeWidth={1.6} className={`transition-transform duration-200 group-hover:scale-110 ${hasReacted ? 'text-[#D94F4F]' : 'text-[#C0B9AE]'}`} fill={hasReacted ? '#D94F4F' : 'none'} />
                    <span className="text-[14px] lg:text-[15px] xl:text-[16px] font-medium text-[#1A1612]">{reactionCount}</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={18} strokeWidth={1.6} className="text-[#5A87A8]" fill="#5A87A8" />
                    <span className="text-[14px] lg:text-[15px] xl:text-[16px] font-medium text-[#1A1612]">{comments.length}</span>
                  </div>
                  {tabs.length > 1 && (<div className="flex items-center gap-2 text-[13px] font-medium text-[#A9782F]"><Users size={16} strokeWidth={1.6} />{tabs.length} perspectives</div>)}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  {!activeTab.isAuthor && !reportDone && (<button onClick={() => setReportOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EDE8DF] text-[#9C9488] transition-colors hover:bg-[#FEF2F2] hover:text-[#EF4444] hover:border-[#FECACA]" aria-label="Report memory"><Flag size={16} strokeWidth={1.8} /></button>)}
                  {reportDone && (<span className="text-[12px] font-medium text-[#10B981]">Reported</span>)}
                  {activeTab.isAuthor && (<div className="relative"><button ref={menuBtnRef} onClick={() => setMenuOpen(!menuOpen)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EDE8DF] text-[#6F6255] transition-colors hover:bg-[#FAF4EA]" aria-label="Memory options"><MoreVertical size={18} strokeWidth={1.8} /></button></div>)}
                  <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EDE8DF] text-[#6F6255] transition-colors hover:bg-[#FAF4EA]" aria-label="Share memory"><Share2 size={16} strokeWidth={1.8} /></button>
                </div>
              </div>
            </div>
            {/* Image right */}
            <div className="w-full lg:w-[45%] flex-shrink-0 order-first lg:order-last flex flex-col bg-[#F5F0E8]">
              <div className="relative flex-1 min-h-[260px] sm:min-h-[360px] lg:min-h-0 overflow-hidden">
                {activeTab.images.length > 0 ? <HeroImageCarousel images={activeTab.images} title={activeTab.title} /> : <EmptyImagePlaceholder />}
              </div>
              {activeTab.images.length > 1 && (
                <div className="flex gap-[2px] bg-white/50">
                  {activeTab.images.slice(0, 5).map((img, i) => (
                    <div key={i} className="relative flex-1 h-[56px] sm:h-[68px] lg:h-[72px] overflow-hidden">
                      <Image src={img.url} alt="" fill sizes="20vw" className="object-cover" />
                      {i === 4 && activeTab.images.length > 5 && (<div className="absolute inset-0 bg-[#1A1612]/50 flex items-center justify-center"><span className="text-white text-[13px] font-semibold">+{activeTab.images.length - 5}</span></div>)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ═══ BODY ═══ */}
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pb-8 sm:pb-10 lg:pb-12">
        <div className="min-w-0">
          <div className="bg-white overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.03)' }}>
            <div className="flex flex-col lg:flex-row">
              <div className="h-[2px] lg:h-auto lg:w-[3px] w-full lg:flex-shrink-0" style={{ background: 'linear-gradient(180deg, #C8A557 0%, #E4D2AE 50%, #C8A557 100%)' }} />
              <div className="flex-1 px-6 sm:px-8 lg:px-12 xl:px-14 py-10 sm:py-12 lg:py-14">
                {activeTab.body.includes('<') ? (
                  <div className="memory-body-rich text-[15px] sm:text-[16px] leading-[1.9] text-[#2E2820]" style={{ fontFamily: "'DM Sans', sans-serif" }} dangerouslySetInnerHTML={{ __html: sanitiseHtml(activeTab.body) }} />
                ) : (
                  <div className="story-body">
                    {activeTab.body.split('\n').filter((p: string) => p.trim().length > 0).map((paragraph: string, i: number) => (
                      <p key={i} className={`text-[15px] sm:text-[16px] leading-[1.9] text-[#2E2820] ${i > 0 ? 'mt-6' : ''}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {i === 0 && paragraph.length > 0 && !'IJijl|'.includes(paragraph[0]) ? (<><span className="float-left text-[#C8A557] leading-[0.8] mr-3 mt-1 text-center" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '3.5rem', minWidth: '2.5rem' }}>{paragraph[0]}</span>{paragraph.slice(1)}</>) : paragraph}
                      </p>
                    ))}
                  </div>
                )}
                {activeTab.videoPath && (
                  <div className="mt-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Play size={13} className="text-[#A9782F]" strokeWidth={1.8} />
                      <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] text-[#A9782F]">Video</span>
                    </div>
                    <div className="relative overflow-hidden border border-[#EDE8DF]">
                      <video src={activeTab.videoPath} controls playsInline preload="metadata" className="w-full max-h-[500px] bg-[#1A1612]" />
                    </div>
                  </div>
                )}
               {activeTab.voiceNotePath && (<div className="mt-12"><VoiceNotePlayer src={activeTab.voiceNotePath} /></div>)}
                {tabs[0]?.authorId !== currentUserId && (
                  <div className="mt-10 pt-8 border-t border-[#F0EBE3]">
                    <button onClick={() => setShowAddModal(true)} className="w-full flex items-center justify-center gap-3 py-4 border-2 border-dashed border-[#DCC7A4] bg-[#FFFDF9] text-[14px] font-semibold text-[#A9782F] transition-all hover:border-[#C8A557] hover:bg-[#FBF7EE]"><Plus size={18} strokeWidth={1.8} />Add your memory of this moment</button>
                  </div>
                )}
                <div className="mt-12 pt-8 border-t border-[#F0EBE3]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#B8924A] mb-5">{comments.length > 0 ? `${comments.length} ${comments.length === 1 ? 'Comment' : 'Comments'}` : 'Comments'}</p>
                  {topLevelComments.length > 0 && (
                    <div className="space-y-4">
                      {topLevelComments.map((comment) => (
                        <CommentItem key={comment.id} authorName={comment.author_name} authorAvatarUrl={comment.author_avatar_url} content={comment.content} createdAt={comment.created_at} isOwn={currentUserId === comment.user_id} onDelete={() => handleCommentDelete(comment.id)} isTopLevel onReply={() => setReplyingTo({ id: comment.id, name: comment.author_name })} replies={(repliesByParent.get(comment.id) || []).map(mapToStoryComment)} currentUserId={currentUserId} onDeleteReply={(id) => handleCommentDelete(id)} />
                      ))}
                    </div>
                  )}
                  <div className={topLevelComments.length > 0 ? 'mt-5' : ''}>
                    {replyingTo && (<div className="flex items-center justify-between mb-2 px-1"><p className="text-[12px] text-[#A9782F]">Replying to <span className="font-semibold">{replyingTo.name}</span></p><button onClick={() => setReplyingTo(null)} className="text-[11px] font-medium text-[#9B8E7D] hover:text-[#6F6255] transition">Cancel</button></div>)}
                    <CommentInput onSubmit={handleCommentSubmit} isLoggedIn={true} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ THREE-DOT MENU ═══ */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-[199]" onClick={() => setMenuOpen(false)} />
          <div className="fixed z-[200] w-[160px] overflow-hidden border border-[#EDE8DF] shadow-xl" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FFFFFF', top: menuBtnRef.current ? menuBtnRef.current.getBoundingClientRect().bottom + 8 : 0, right: menuBtnRef.current ? window.innerWidth - menuBtnRef.current.getBoundingClientRect().right : 0 }}>
            <button onClick={() => { setMenuOpen(false); router.push(`/dashboard/memories/${activeTab.id}/edit`); }} className="flex w-full items-center gap-2.5 px-4 py-3 text-[14px] font-medium text-[#1A1612] transition-colors hover:bg-[#FAF5EB]"><PenLine size={15} strokeWidth={1.8} />Edit</button>
            <button onClick={() => { setMenuOpen(false); setDeleteModalId(activeTab.id); }} className="flex w-full items-center gap-2.5 px-4 py-3 text-[14px] font-medium text-red-600 transition-colors hover:bg-red-50"><Trash2 size={15} strokeWidth={1.8} />Delete</button>
          </div>
        </>
      )}

      {/* ═══ REPORT MODAL ═══ */}
      {reportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !reporting && setReportOpen(false)} />
          <div className="relative w-[90%] max-w-[420px] bg-white px-6 py-7 sm:px-8 sm:py-8 border border-[#EDE8DF] shadow-xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#1A1612] leading-tight">Report this memory</h3>
            <p className="mt-3 text-[14px] leading-[1.7] text-[#6F6255]">If this memory contains something inappropriate, let us know. We&apos;ll review it.</p>
            <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="What's wrong with this memory? (optional)" rows={3} className="mt-4 w-full border border-[#EDE8DF] px-4 py-3 text-[14px] text-[#1A1612] placeholder:text-[#C4B8A7] outline-none focus:border-[#C8A557] resize-none" />
            <div className="mt-6 flex items-center gap-3 justify-end">
              <button onClick={() => setReportOpen(false)} disabled={reporting} className="px-4 py-2.5 text-[14px] font-medium text-[#6F6255] border border-[#EDE8DF] transition-colors hover:bg-[#FAF5EB] disabled:opacity-50">Cancel</button>
              <button onClick={async () => { setReporting(true); try { const res = await fetch('/api/report-memory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memory_id: memoryId, reason: reportReason.trim() || null }) }); if (res.ok) { setReportDone(true); setReportOpen(false); } } finally { setReporting(false); } }} disabled={reporting} className="px-4 py-2.5 text-[14px] font-semibold text-white bg-[#EF4444] transition-colors hover:bg-[#DC2626] disabled:opacity-50">{reporting ? 'Submitting…' : 'Report'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE MODAL ═══ */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setDeleteModalId(null)} />
          <div className="relative w-[90%] max-w-[400px] bg-white px-6 py-7 sm:px-8 sm:py-8 border border-[#EDE8DF] shadow-xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#1A1612] leading-tight">Delete this memory?</h3>
            <p className="mt-3 text-[14px] leading-[1.7] text-[#6F6255]">This is permanent and cannot be undone. All photos, comments, and reactions will be removed.</p>
            <div className="mt-6 flex items-center gap-3 justify-end">
              <button onClick={() => setDeleteModalId(null)} disabled={deleting} className="px-4 py-2.5 text-[14px] font-medium text-[#6F6255] border border-[#EDE8DF] transition-colors hover:bg-[#FAF5EB] disabled:opacity-50">Cancel</button>
              <button onClick={handleDeleteTab} disabled={deleting} className="px-4 py-2.5 text-[14px] font-semibold text-white bg-red-600 transition-colors hover:bg-red-700 disabled:opacity-50">{deleting ? 'Deleting…' : 'Delete forever'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADD MEMORY MODAL ═══ */}
      {showAddModal && (<AddMemoryModal memoryId={memoryId} familyId={familyId} promptQuestion={promptQuestion} parentAuthorId={tabs[0]?.authorId || ''} onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); router.refresh(); }} />)}
    </article>
  );
}

function HeroImageCarousel({ images, title }: { images: { url: string }[]; title: string }) {
  const [activeImage, setActiveImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const touchStart = useRef<number | null>(null);
  const goTo = (i: number) => { setImageLoaded(false); setActiveImage(i); };
  const goNext = () => goTo((activeImage + 1) % images.length);
  const goPrev = () => goTo((activeImage - 1 + images.length) % images.length);
  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-[#F5F0E8] group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }} onTouchEnd={(e) => { if (touchStart.current === null) return; const diff = touchStart.current - e.changedTouches[0].clientX; if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); } touchStart.current = null; }}>
      <Image key={activeImage} src={images[activeImage].url} alt={title} fill priority sizes="(max-width: 1024px) 100vw, 52vw" className={`object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'}`} onLoadingComplete={() => setImageLoaded(true)} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.15) 100%)' }} />
      {images.length > 1 && (<>
        <div className="absolute top-4 right-4 bg-[#1A1612]/65 backdrop-blur-sm px-3 py-1.5 text-[11px] font-medium text-white tabular-nums tracking-wide">{activeImage + 1} / {images.length}</div>
        <button onClick={goPrev} className={`absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center bg-white/80 backdrop-blur-sm text-[#1A1612] transition-all duration-300 hover:bg-white ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} aria-label="Previous image"><ChevronRight size={16} className="rotate-180" /></button>
        <button onClick={goNext} className={`absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center bg-white/80 backdrop-blur-sm text-[#1A1612] transition-all duration-300 hover:bg-white ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`} aria-label="Next image"><ChevronRight size={16} /></button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">{images.map((_, i) => (<button key={i} onClick={() => goTo(i)} className={`h-2 transition-all duration-300 ${i === activeImage ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'}`} aria-label={`Go to image ${i + 1}`} />))}</div>
      </>)}
    </div>
  );
}

function EmptyImagePlaceholder() {
  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #FAF5EB 0%, #F0E8D8 40%, #E8DCC8 100%)' }} />
      <div className="absolute inset-0 opacity-[0.04]"><svg width="100%" height="100%"><defs><pattern id="memPat" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="30" cy="30" r="1.5" fill="#A9782F" /></pattern></defs><rect width="100%" height="100%" fill="url(#memPat)" /></svg></div>
      <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-[#D8BE8B]/30" /><div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-[#D8BE8B]/30" /><div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-[#D8BE8B]/30" /><div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-[#D8BE8B]/30" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"><div className="h-12 w-12 flex items-center justify-center border border-[#D8BE8B]/40"><ImageIcon size={20} strokeWidth={1.2} className="text-[#B8924A]/60" /></div><p className="text-[15px] italic text-[#B8924A]/70" style={{ fontFamily: "'Cormorant Garamond', serif" }}>A memory worth reading</p></div>
    </div>
  );
}

function VoiceNotePlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const barCount = 48;
  const [bars] = useState(() => Array.from({ length: barCount }, () => 0.2 + Math.random() * 0.8));
  const toggle = () => { const el = audioRef.current; if (!el) return; playing ? el.pause() : el.play(); setPlaying(!playing); };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => { const el = audioRef.current; if (!el || !duration) return; const rect = e.currentTarget.getBoundingClientRect(); const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); el.currentTime = pct * duration; };
  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const pPct = duration > 0 ? progress / duration : 0;
  return (
    <div className="border border-[#EDE8DF] bg-[#FEFDFB] transition-shadow duration-300 hover:shadow-[0_2px_12px_rgba(169,120,47,0.08)]">
      <audio ref={audioRef} src={src} preload="metadata" onTimeUpdate={(e) => setProgress((e.target as HTMLAudioElement).currentTime)} onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)} onEnded={() => setPlaying(false)} />
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-2 mb-4"><Mic size={13} className="text-[#A9782F]" strokeWidth={1.8} /><span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] text-[#A9782F]">Voice Note</span></div>
        <div className="flex items-center gap-4">
          <button onClick={toggle} className="flex h-[48px] w-[48px] sm:h-[52px] sm:w-[52px] flex-shrink-0 items-center justify-center text-white transition-transform duration-200 hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(135deg, #D8BE8B 0%, #A9782F 100%)' }} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause size={18} strokeWidth={2.2} /> : <Play size={18} strokeWidth={2.2} className="ml-0.5" />}</button>
          <div className="flex-1 min-w-0">
            <div className="flex items-end gap-[2px] h-[36px] cursor-pointer" onClick={seek} role="slider" aria-valuenow={Math.round(pPct * 100)} aria-valuemin={0} aria-valuemax={100}>{bars.map((h, i) => (<div key={i} className="flex-1 transition-colors duration-150" style={{ height: `${h * 100}%`, minWidth: '2px', backgroundColor: i / barCount <= pPct ? '#A9782F' : '#DDD6CC' }} />))}</div>
            <div className="mt-2 flex justify-between text-[10px] sm:text-[11px] text-[#9C9488] tabular-nums"><span>{fmt(progress)}</span><span>{fmt(duration)}</span></div>
          </div>
          <a href={src} download className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-[#9C9488] transition-colors duration-200 hover:text-[#A9782F]" aria-label="Download voice note"><Download size={16} strokeWidth={1.6} /></a>
        </div>
      </div>
    </div>
  );
}

function SectionDivider() {
  return (<div className="w-full px-6 md:px-10 lg:px-20 xl:px-28"><div className="relative border-t border-[#EDE8DF]"><div className="absolute left-1/2 -translate-x-1/2 -top-[5px] bg-[#FFFDF8] px-4"><div className="flex items-center gap-1.5"><div className="h-[3px] w-[3px] bg-[#D8BE8B]/60 rotate-45" /><div className="h-[4px] w-[4px] bg-[#D8BE8B] rotate-45" /><div className="h-[3px] w-[3px] bg-[#D8BE8B]/60 rotate-45" /></div></div></div></div>);
}

function AuthorAvatar({ avatarUrl, name, initials, size }: { avatarUrl: string | null; name: string; initials: string; size: number }) {
  return (<div className="flex-shrink-0 rounded-full overflow-hidden border-[1.5px] border-[#E4D2AE] bg-[#FAF5EB] flex items-center justify-center" style={{ height: size, width: size }}>{avatarUrl ? (<Image src={avatarUrl} alt={name} width={size} height={size} className="h-full w-full object-cover" />) : (<span className="font-bold text-[#A9782F]" style={{ fontSize: Math.max(10, size * 0.28) }}>{initials}</span>)}</div>);
}

function AddMemoryModal({ memoryId, familyId, promptQuestion, parentAuthorId, onClose, onSuccess }: { memoryId: string; familyId: string; promptQuestion: string | null; parentAuthorId: string; onClose: () => void; onSuccess: () => void }) {
  const supabase = getBrowserClient();
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState('');
  const [error, setError] = useState('');
  const addPhotos = useCallback(async (files: FileList | File[]) => { const arr = Array.from(files).filter((f) => f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.heic')); if (!arr.length) return; setProcessing(true); try { const converted = await Promise.all(arr.slice(0, 10 - photos.length).map((f) => ensureDisplayableImage(f))); setPhotos((prev) => [...prev, ...converted.map((file) => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, file, preview: URL.createObjectURL(file) }))]); } finally { setProcessing(false); } }, [photos.length]);
  const removePhoto = useCallback((id: string) => { setPhotos((prev) => { const item = prev.find((p) => p.id === id); if (item) URL.revokeObjectURL(item.preview); return prev.filter((p) => p.id !== id); }); }, []);
  const handleSubmit = async () => {
    if (!body.trim() || submitting) return; setSubmitting(true); setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not authenticated');
      setSubmitStep('Saving…');
      const { data: memory, error: memErr } = await supabase.from('family_memories').insert({ family_id: familyId, author_id: user.id, parent_memory_id: memoryId, title: promptQuestion || 'My memory of this moment', body: body.trim() }).select('id').single();
      if (memErr) throw memErr;
      for (let i = 0; i < photos.length; i++) { setSubmitStep(`Uploading photo ${i + 1}/${photos.length}…`); const ext = photos[i].file.name.split('.').pop() || 'jpg'; const filePath = `${user.id}/${memory.id}/${Date.now()}-${i}.${ext}`; const { error: upErr } = await supabase.storage.from('memory-media').upload(filePath, photos[i].file); if (upErr) throw upErr; await supabase.from('family_memory_media').insert({ memory_id: memory.id, family_id: familyId, user_id: user.id, file_path: filePath, file_type: 'image', display_order: i }); }
      if (parentAuthorId && parentAuthorId !== user.id) { try { await supabase.from('notifications').insert({ user_id: parentAuthorId, type: 'memory_addition', actor_id: user.id, target_id: memoryId, target_type: 'family_memory' }); } catch {} }
      onSuccess();
    } catch (err: any) { setError(err?.message || 'Something went wrong.'); setSubmitting(false); }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && onClose()} />
      <div className="relative w-full max-w-[520px] max-h-[90vh] overflow-y-auto bg-white border border-[#EAD8B8] shadow-xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-5">
          <div className="flex items-center justify-between"><h3 className="text-[20px] font-semibold text-[#1A1612]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>Add your <span className="italic text-[#A9782F]">memory</span></h3><button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F0E8] transition"><X size={16} className="text-[#7D6F5F]" /></button></div>
          {promptQuestion && (<div className="px-4 py-3 bg-[#FBF7EE] border border-[#EAD8B8]"><p className="text-[11px] font-medium text-[#B8932A] uppercase tracking-[0.08em] mb-1">The question</p><p className="text-[14px] text-[#4A4030] italic">&ldquo;{promptQuestion}&rdquo;</p></div>)}
          <div><label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">Your memory</label><textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What do you remember about this moment?" rows={5} className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] placeholder-[#C0B9AE] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A] resize-none leading-relaxed" style={{ background: '#FDFCFA' }} /></div>
          <div>
            <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">Photos <span className="text-[#B5AFA6] font-normal">(optional)</span></label>
            {photos.length > 0 && (<div className="grid grid-cols-3 gap-2 mb-3">{photos.map((p) => (<div key={p.id} className="group relative aspect-square overflow-hidden bg-[#F0EDE8] border border-[#ECE5D8]"><Image src={p.preview} alt="" fill className="object-cover" />{!submitting && <button onClick={() => removePhoto(p.id)} className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center bg-white/90 text-[#8B3A32] opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>}</div>))}</div>)}
            {photos.length < 10 && (<label className={`flex flex-col items-center justify-center border-2 border-dashed px-5 py-4 cursor-pointer transition-all ${processing ? 'border-[#B8932A] bg-[#FBF7EE]' : 'border-[#E0D6C8] bg-[#FDFCFA] hover:border-[#B8932A]'}`}>{processing ? <Loader2 size={20} className="animate-spin text-[#B8932A] mb-1" /> : <ImagePlus size={20} className="text-[#B8932A] mb-1" />}<p className="text-[12px] font-medium text-[#4A4030]">{processing ? 'Processing…' : photos.length > 0 ? 'Add more' : 'Add a photo'}</p><input type="file" accept="image/*,.heic" multiple hidden disabled={processing} onChange={(e) => { if (e.target.files?.length) addPhotos(e.target.files); e.target.value = ''; }} /></label>)}
          </div>
          {error && <div className="border border-[#E8C4C0] bg-[#FDF6F5] px-4 py-3"><p className="text-[13px] text-[#8B3A32]">{error}</p></div>}
          <button onClick={handleSubmit} disabled={!body.trim() || submitting} className="w-full py-3 text-[13px] font-semibold tracking-[0.04em] text-[#FFFDF8] transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)' }}>{submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}{submitting ? submitStep || 'Saving…' : 'Share your memory'}</button>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date(); const date = new Date(dateStr); const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000); const diffHours = Math.floor(diffMins / 60); const diffDays = Math.floor(diffHours / 24); const diffWeeks = Math.floor(diffDays / 7);
  if (diffMins < 1) return 'Just now'; if (diffMins < 60) return `${diffMins}m ago`; if (diffHours < 24) return `${diffHours}h ago`; if (diffDays < 7) return `${diffDays}d ago`; if (diffWeeks < 4) return `${diffWeeks}w ago`; return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function sanitiseHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,iframe,object,embed,form,link,meta,style').forEach((el) => el.remove());
  doc.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith('on') || attr.name === 'srcdoc' || (attr.value && attr.value.trim().toLowerCase().startsWith('javascript:'))) {
        el.removeAttribute(attr.name);
      }
    }
    if (el.tagName === 'A') {
      const href = el.getAttribute('href') || '';
      if (href.trim().toLowerCase().startsWith('javascript:')) el.removeAttribute('href');
    }
  });
  return doc.body.innerHTML;
}