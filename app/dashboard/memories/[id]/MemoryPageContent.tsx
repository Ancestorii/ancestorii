'use client';

import { useState, useRef, useCallback, useEffect, useId, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Mic,
  Heart,
  MessageCircle,
  Users,
  Plus,
  ImagePlus,
  X,
  Send,
  Trash2,
  PenLine,
  MoreVertical,
  Flag,
  Share2,
} from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { ensureDisplayableImage } from '@/lib/convertImage';
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';
import { safeToast } from '@/lib/safeToast';
import CommentItem from '@/components/stories/comments/CommentItem';
import CommentInput from '@/components/stories/comments/CommentInput';
import VoiceNotePlayer from '@/components/voice/VoiceNotePlayer';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import {
  ui,
  Accent,
  Avatar,
  Btn,
  Eyebrow,
  IconBtn,
  IconTile,
  Spinner,
  Tag,
  tone,
  toneByKey,
  useDialog,
} from '@/components/dashboard/ui/AppBits';
import type { MemoryTab, MemoryComment, MemoryVoiceNote } from './page';
import s from './memory.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// The photo on show: the screen's width on phones, the photo column beside the words after.
const STAGE_SIZES = '(max-width: 759px) 100vw, (max-width: 1279px) 46vw, 560px';

type PendingPhoto = { id: string; file: File; preview: string };

// The lead and the live preview show the words without their tags; the entities the editor
// writes ("Mum &amp; Dad") read as typed.
function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

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

  const [voiceNotesByTab, setVoiceNotesByTab] = useState<Record<string, MemoryVoiceNote[]>>(
    () => Object.fromEntries(tabs.map((t) => [t.id, t.voiceNotes]))
  );
  const [addingVoiceNote, setAddingVoiceNote] = useState(false);
  const [recordingComment, setRecordingComment] = useState(false);

  // The options menu and the two dialogs: Escape closes them (as Cancel and the backdrop do,
  // never while they work), Tab stays inside a dialog, and focus returns to its button.
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const reportTitleId = useId();
  const reportTextId = useId();
  const deleteTitleId = useId();
  const deleteTextId = useId();
  const voiceTitleId = useId();
  const commentsTitleId = useId();
  const reportRef = useDialog<HTMLDivElement>(reportOpen, () => {
    if (!reporting) setReportOpen(false);
  });
  const deleteRef = useDialog<HTMLDivElement>(!!deleteModalId, () => {
    if (!deleting) setDeleteModalId(null);
  });

  const activeTab = tabs[activeTabIndex] || tabs[0];
  const activeVoiceNotes = voiceNotesByTab[activeTab.id] || [];
  const initials = activeTab.authorName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const dateLabel = activeTab.createdAt
    ? new Date(activeTab.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const timeAgo = activeTab.createdAt ? getTimeAgo(activeTab.createdAt) : '';
  const isHtmlBody = activeTab.body.includes('<');
  const strippedBody = (isHtmlBody ? decodeEntities(activeTab.body.replace(/<[^>]*>/g, ' ')) : activeTab.body)
    .replace(/\s+/g, ' ')
    .trim();
  const preview = strippedBody.length > 160 ? strippedBody.slice(0, 160).trim() + '…' : strippedBody;

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [menuOpen]);

  // The menu is drawn at the end of the page (over everything), so a keyboard user is taken
  // into it as it opens.
  useEffect(() => {
    if (menuOpen) menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
  }, [menuOpen]);

  // While a dialog is open the page behind it stays put (the root ScrollLockGutter keeps the
  // width steady, so nothing here compensates for the scrollbar).
  const dialogOpen = reportOpen || !!deleteModalId || showAddModal;
  useEffect(() => {
    if (!dialogOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [dialogOpen]);

  // A note to the memory's author (never to themselves); it never blocks the action.
  const notifyAuthor = async (type: 'memory_reaction' | 'memory_comment') => {
    const memoryAuthorId = tabs[0]?.authorId;
    if (!memoryAuthorId || memoryAuthorId === currentUserId) return;
    try {
      await getBrowserClient().from('notifications').insert({ user_id: memoryAuthorId, type, actor_id: currentUserId, target_id: memoryId, target_type: 'family_memory' });
    } catch {}
  };

  // The heart flips at once and the row follows; if the row is refused, the heart goes back.
  // One toggle at a time, so a double tap can't send two rows.
  const reactingRef = useRef(false);
  const handleReaction = async () => {
    if (reactingRef.current) return;
    reactingRef.current = true;
    const supabase = getBrowserClient();
    const wasReacted = hasReacted;
    setHasReacted(!wasReacted);
    setReactionCount((c) => c + (wasReacted ? -1 : 1));
    try {
      if (wasReacted) {
        const { data, error } = await supabase.from('family_memory_reactions').delete().eq('memory_id', memoryId).eq('user_id', currentUserId).select('id');
        if (error || !data?.length) throw error || new Error('Nothing deleted');
      } else {
        const { error } = await supabase.from('family_memory_reactions').insert({ memory_id: memoryId, family_id: familyId, user_id: currentUserId });
        // 23505: the heart was already there (another tab, the app); the page just caught up.
        if (error && error.code !== '23505') throw error;
        if (!error) void notifyAuthor('memory_reaction');
      }
    } catch {
      setHasReacted(wasReacted);
      setReactionCount((c) => c + (wasReacted ? 1 : -1));
      safeToast.error('Could not save your heart. Please try again.');
    } finally {
      reactingRef.current = false;
    }
  };

  const handleDeleteTab = async () => {
    if (!deleteModalId || deleting) return;
    setDeleting(true);
    const supabase = getBrowserClient();
    const targetId = deleteModalId;
    try {
      // The row first: row security only lets the author delete, and a refused delete returns
      // no rows (deleteWithOwnerCheck says so). Photos, comments, hearts and voice notes cascade.
      const ok = await deleteWithOwnerCheck(supabase, 'family_memories', targetId, 'memory');
      if (!ok) { setDeleting(false); return; }
      // Then the author's own files for it (photos, video, voice note). Other members' voice
      // notes and voice comments live in their own folders, which only they can clear.
      try {
        const folder = `${currentUserId}/${targetId}`;
        const { data: files } = await supabase.storage.from('memory-media').list(folder, { limit: 1000 });
        if (files?.length) await supabase.storage.from('memory-media').remove(files.map((f) => `${folder}/${f.name}`));
      } catch {}
      window.dispatchEvent(new Event('dashboard-data-changed'));
      setDeleteModalId(null);
      setDeleting(false);
      if (targetId === memoryId) { router.replace('/dashboard/our-family'); } else { router.refresh(); setActiveTabIndex(0); }
    } catch (err) {
      console.error('Memory delete failed:', err);
      setDeleting(false);
      safeToast.error('Could not delete this memory. Please try again.');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/dashboard/memories/${memoryId}`;
    const text = `${activeTab.title}, a memory on Ancestorii`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Ancestorii', text, url }); } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      safeToast.success('Link copied. Only members of your family can open it.');
    } catch {
      safeToast.error('Could not copy the link.');
    }
  };

  // The signed-in member's name and photo, read once (for their first comment or voice note).
  // The id comes from the server, so nothing here asks the auth server again.
  const selfRef = useRef<{ name: string; avatarPath: string | null; avatarUrl: string | null } | null>(null);
  const loadSelf = async () => {
    if (selfRef.current) return selfRef.current;
    const supabase = getBrowserClient();
    const { data: profile } = await supabase.from('Profiles').select('full_name, profile_image_url, avatar_url').eq('id', currentUserId).maybeSingle();
    const avatarPath = profile?.profile_image_url || profile?.avatar_url || null;
    let avatarUrl = avatarPath;
    if (avatarPath && !avatarPath.startsWith('http')) {
      const { data: s } = await supabase.storage.from('user-media').createSignedUrl(avatarPath, 3600);
      avatarUrl = s?.signedUrl || null;
    }
    selfRef.current = { name: profile?.full_name || 'Family Member', avatarPath, avatarUrl };
    return selfRef.current;
  };

  // The files behind a voice note or voice comment: the path on the row (the converted .m4a
  // once the converter has run) and the .webm it was uploaded as. Only the uploader's own.
  const removeVoiceFiles = async (path: string) => {
    const paths = [...new Set([path, path.replace(/\.[^/.]+$/, '.webm')])];
    try { await getBrowserClient().storage.from('memory-media').remove(paths); } catch {}
  };

  const handleVoiceComment = async (file: File) => {
    const supabase = getBrowserClient();
    const self = await loadSelf();
    const path = `${currentUserId}/${memoryId}/comment-voice-${Date.now()}.webm`;
    const { error: upErr } = await supabase.storage.from('memory-media').upload(path, file, { contentType: file.type || 'audio/webm', upsert: true });
    if (upErr) throw upErr;
    const parentId = replyingTo?.id || null;
    const { data: row, error } = await supabase
      .from('family_memory_comments')
      .insert({ memory_id: memoryId, family_id: familyId, user_id: currentUserId, author_name: self.name, author_avatar_url: self.avatarPath, content: null, voice_note_path: path, parent_id: parentId })
      .select('id, created_at')
      .single();
    if (error || !row) throw error || new Error('Could not save your voice note.');
    // Played from the file just uploaded (the converted copy takes over on the next visit).
    const { data: signed } = await supabase.storage.from('memory-media').createSignedUrl(path, 3600);
    setComments((prev) => [...prev, {
      id: row.id, user_id: currentUserId, author_name: self.name, author_avatar_url: self.avatarUrl,
      content: null, voice_note_path: signed?.signedUrl || null, voice_path: path, created_at: row.created_at, parent_id: parentId,
    }]);
    void notifyAuthor('memory_comment');
    setReplyingTo(null);
    setRecordingComment(false);
  };

  const handleAddVoiceNote = async (file: File) => {
    const supabase = getBrowserClient();
    const targetId = activeTab.id;
    const path = `${currentUserId}/${targetId}/voice-${Date.now()}.webm`;
    const { error: upErr } = await supabase.storage.from('memory-media').upload(path, file, { contentType: file.type || 'audio/webm', upsert: true });
    if (upErr) throw upErr;
    const [{ data: row, error: insErr }, self, { data: signed }] = await Promise.all([
      supabase.from('family_memory_voice_notes').insert({ memory_id: targetId, family_id: familyId, user_id: currentUserId, file_path: path }).select('id, created_at').single(),
      loadSelf(),
      supabase.storage.from('memory-media').createSignedUrl(path, 3600),
    ]);
    if (insErr || !row) throw insErr || new Error('Could not save your voice note.');
    const newNote: MemoryVoiceNote = {
      id: row.id, memoryId: targetId, recorderId: currentUserId,
      recorderName: self.name, recorderAvatarUrl: self.avatarUrl,
      url: signed?.signedUrl || '', path, createdAt: row.created_at, isRecorder: true,
    };
    setVoiceNotesByTab((prev) => ({ ...prev, [targetId]: [...(prev[targetId] || []), newNote] }));
    setAddingVoiceNote(false);
  };

  const handleDeleteVoiceNote = async (note: MemoryVoiceNote) => {
    try {
      const ok = await deleteWithOwnerCheck(getBrowserClient(), 'family_memory_voice_notes', note.id, 'voice note');
      if (!ok) return;
      setVoiceNotesByTab((prev) => ({ ...prev, [note.memoryId]: (prev[note.memoryId] || []).filter((n) => n.id !== note.id) }));
      void removeVoiceFiles(note.path);
    } catch {
      safeToast.error('Could not delete this voice note. Please try again.');
    }
  };

  const handleCommentSubmit = async (content: string) => {
    const supabase = getBrowserClient();
    const self = await loadSelf();
    const parentId = replyingTo?.id || null;
    const { data: row, error } = await supabase
      .from('family_memory_comments')
      .insert({ memory_id: memoryId, family_id: familyId, user_id: currentUserId, author_name: self.name, author_avatar_url: self.avatarPath, content, parent_id: parentId })
      .select('id, created_at')
      .single();
    if (error || !row) {
      console.error('Comment insert failed:', error?.message);
      safeToast.error('Could not post your comment. Please try again.');
      return;
    }
    setComments((prev) => [...prev, {
      id: row.id, user_id: currentUserId, author_name: self.name, author_avatar_url: self.avatarUrl,
      content, voice_note_path: null, voice_path: null, created_at: row.created_at, parent_id: parentId,
    }]);
    void notifyAuthor('memory_comment');
    setReplyingTo(null);
  };

  const handleCommentDelete = async (commentId: string) => {
    try {
      const ok = await deleteWithOwnerCheck(getBrowserClient(), 'family_memory_comments', commentId, 'comment');
      if (!ok) return;
      // Replies to it go with it (the database cascades), and so do its own voice files.
      const gone = comments.filter((c) => c.id === commentId || c.parent_id === commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId));
      gone.forEach((c) => { if (c.voice_path && c.user_id === currentUserId) void removeVoiceFiles(c.voice_path); });
    } catch {
      safeToast.error('Could not delete this comment. Please try again.');
    }
  };

  const topLevelComments = comments.filter((c) => !c.parent_id);
  const repliesByParent = new Map<string, MemoryComment[]>();
  comments.filter((c) => c.parent_id).forEach((c) => {
    const existing = repliesByParent.get(c.parent_id!) || [];
    existing.push(c);
    repliesByParent.set(c.parent_id!, existing);
  });

  const mapToStoryComment = (c: MemoryComment) => ({
    id: c.id, story_id: memoryId, user_id: c.user_id, author_name: c.author_name, author_avatar_url: c.author_avatar_url, author_title: null, content: c.content || '', voice_note_path: c.voice_note_path, created_at: c.created_at, updated_at: c.created_at, parent_id: c.parent_id,
  });

  // Long titles take the kit's smaller title size, so they stay a few lines long.
  const longTitle = activeTab.title.length > 48;

  return (
    <article className={cx(ui.page, s.page)} data-mounted={mounted}>
      <div className={ui.wrap}>
        {/* ═══ HEADER: back, the memory's actions, its perspectives, title and photos ═══ */}
        <header className={cx(ui.header, s.reveal)}>
          <div className={ui.headerGlow} aria-hidden="true" />

          <div className={s.topRow}>
            {/* A real link: the shell hides its navigation here, and a fresh tab (a notification,
                an email) has no page to go back to. */}
            <Btn
              variant="soft"
              size="sm"
              href="/dashboard/our-family"
              icon={<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />}
            >
              Back to My Family
            </Btn>

            <div className={s.topActions}>
              {!activeTab.isAuthor && !reportDone && (
                <IconBtn label="Report memory" onClick={() => setReportOpen(true)} aria-haspopup="dialog">
                  <Flag size={18} strokeWidth={2.2} aria-hidden="true" />
                </IconBtn>
              )}
              {reportDone && (
                <span
                  className={cx(ui.chip, ui.chipDot, s.reported)}
                  style={{ '--dot': 'var(--c3)' } as CSSProperties}
                  role="status"
                >
                  Reported
                </span>
              )}
              {activeTab.isAuthor && (
                <IconBtn
                  ref={menuBtnRef}
                  label="Memory options"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-expanded={menuOpen}
                  aria-controls={menuOpen ? menuId : undefined}
                >
                  <MoreVertical size={19} strokeWidth={2.4} aria-hidden="true" />
                </IconBtn>
              )}
              <IconBtn label="Share memory" onClick={handleShare}>
                <Share2 size={18} strokeWidth={2.2} aria-hidden="true" />
              </IconBtn>
            </div>
          </div>

          {/* ═══ PERSPECTIVES ═══ */}
          {tabs.length > 1 && (
            <div className={cx(ui.tabs, s.tabs)} role="group" aria-label="Perspectives">
              {tabs.map((tab, i) => {
                const tabFirstName = tab.authorName.split(' ')[0];
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTabIndex(i)}
                    aria-pressed={i === activeTabIndex}
                    className={ui.tab}
                  >
                    {tabFirstName}&apos;s Memory
                  </button>
                );
              })}
            </div>
          )}

          {/* ═══ HERO ═══ */}
          <div className={s.heroGrid}>
            <div className={s.heroCopy}>
              <Eyebrow dot="var(--c0)">Memory</Eyebrow>

              <h1 className={cx(ui.title, longTitle && ui.titleMd, s.title)}>{activeTab.title}</h1>

              {dateLabel && (
                <div className={ui.meta}>
                  <span className={ui.chip} suppressHydrationWarning>
                    <CalendarDays size={15} strokeWidth={2.4} aria-hidden="true" />
                    {dateLabel}
                  </span>
                </div>
              )}

              {promptQuestion && activeTabIndex === 0 && (
                <div className={cx(ui.card, s.prompt)}>
                  <Tag dot="var(--c1)">In response to</Tag>
                  <p className={s.promptText}>&ldquo;{promptQuestion}&rdquo;</p>
                </div>
              )}

              {preview && <p className={ui.lead}>{preview}</p>}

              <div className={s.byline}>
                <AuthorAvatar avatarUrl={activeTab.authorAvatarUrl} name={activeTab.authorName} initials={initials} size={48} />
                <div className={s.bylineText}>
                  <span className={s.authorName}>{activeTab.authorName}</span>
                  <span className={s.when} suppressHydrationWarning>{timeAgo || 'Just shared'}</span>
                </div>
              </div>

              {/* Engagement row */}
              <div className={s.engage}>
                <button
                  type="button"
                  onClick={handleReaction}
                  aria-pressed={hasReacted}
                  aria-label={`Heart this memory, ${reactionCount} ${reactionCount === 1 ? 'heart' : 'hearts'}`}
                  className={cx(ui.btn, ui.btnSoft, ui.btnSm, s.heart)}
                >
                  <Heart size={18} strokeWidth={2.4} fill={hasReacted ? 'currentColor' : 'none'} aria-hidden="true" className={s.heartIcon} />
                  <span>{reactionCount}</span>
                </button>
                <span className={cx(ui.chip, s.stat)}>
                  <MessageCircle size={17} strokeWidth={2.2} fill="currentColor" aria-hidden="true" className={s.commentIcon} />
                  {comments.length}
                  <span className={ui.srOnly}> {comments.length === 1 ? 'comment' : 'comments'}</span>
                </span>
                {tabs.length > 1 && (
                  <span className={cx(ui.chip, s.stat)}>
                    <Users size={16} strokeWidth={2.4} aria-hidden="true" />
                    {tabs.length} perspectives
                  </span>
                )}
              </div>
            </div>

            {/* Photos (a fresh carousel for each perspective) */}
            <div className={s.media}>
              {activeTab.images.length > 0 ? (
                <HeroImageCarousel key={activeTab.id} images={activeTab.images} title={activeTab.title} />
              ) : (
                <EmptyImagePlaceholder />
              )}
            </div>
          </div>
        </header>

        {/* ═══ BODY: the story, the voice notes beside it, the comments under it ═══ */}
        <div className={s.body}>
          <div className={s.story}>
            {isHtmlBody ? (
              <div className={s.richBody} dangerouslySetInnerHTML={{ __html: sanitiseHtml(activeTab.body) }} />
            ) : (
              <div className={s.richBody}>
                {activeTab.body.split('\n').filter((p: string) => p.trim().length > 0).map((paragraph: string, i: number) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            {activeTab.videoPath && (
              <div className={s.block}>
                <div>
                  <Tag dot="var(--c2)">Video</Tag>
                </div>
                <div className={s.videoFrame}>
                  <video src={activeTab.videoPath} controls playsInline preload="metadata" className={s.video} />
                </div>
              </div>
            )}
          </div>

          <div className={s.aside}>
            {/* ═══ VOICE NOTES ═══ */}
            <section className={cx(ui.card, s.voiceCard)} aria-labelledby={voiceTitleId}>
              <div className={s.cardHead}>
                <IconTile Icon={Mic} tone={toneByKey('blue')} size="sm" />
                <h2 id={voiceTitleId} className={s.cardTitle}>Voice Notes</h2>
                {activeVoiceNotes.length > 0 && (
                  <span className={cx(ui.chip, ui.chipSm)}>{activeVoiceNotes.length}</span>
                )}
              </div>

              {activeVoiceNotes.length > 0 && (
                <ul className={s.voiceList}>
                  {activeVoiceNotes.map((note) => (
                    <MemoryVoiceNoteItem key={note.id} note={note} onDelete={() => handleDeleteVoiceNote(note)} />
                  ))}
                </ul>
              )}

              <div className={s.voiceAdd}>
                {addingVoiceNote ? (
                  <VoiceRecorder onSubmit={handleAddVoiceNote} onCancel={() => setAddingVoiceNote(false)} allowUpload />
                ) : (
                  <Btn
                    variant="soft"
                    block
                    onClick={() => setAddingVoiceNote(true)}
                    icon={<Mic size={18} strokeWidth={2.4} aria-hidden="true" />}
                  >
                    Add a voice note
                  </Btn>
                )}
              </div>
            </section>

            {tabs[0]?.authorId !== currentUserId && (
              <Btn
                variant="outline"
                block
                onClick={() => setShowAddModal(true)}
                aria-haspopup="dialog"
                icon={<Plus size={18} strokeWidth={2.4} aria-hidden="true" />}
                className={s.wrapBtn}
              >
                Add your memory of this moment
              </Btn>
            )}
          </div>

          {/* ═══ COMMENTS ═══ */}
          <section className={s.comments} aria-labelledby={commentsTitleId}>
            <h2 id={commentsTitleId} className={s.commentsTitle}>
              {comments.length > 0 ? `${comments.length} ${comments.length === 1 ? 'Comment' : 'Comments'}` : 'Comments'}
            </h2>

            {topLevelComments.length > 0 && (
              <ul className={s.commentList}>
                {topLevelComments.map((comment) => (
                  <li key={comment.id} className={ui.listRow}>
                    <CommentItem authorName={comment.author_name} authorAvatarUrl={comment.author_avatar_url} content={comment.content || ''} voiceNoteUrl={comment.voice_note_path} createdAt={comment.created_at} isOwn={currentUserId === comment.user_id} onDelete={() => handleCommentDelete(comment.id)} isTopLevel onReply={() => setReplyingTo({ id: comment.id, name: comment.author_name })} replies={(repliesByParent.get(comment.id) || []).map(mapToStoryComment)} currentUserId={currentUserId} onDeleteReply={(id) => handleCommentDelete(id)} />
                  </li>
                ))}
              </ul>
            )}

            <div className={s.composer}>
              {replyingTo && (
                <div className={s.replying}>
                  <p className={s.replyingText}>
                    Replying to <span className={s.replyingName}>{replyingTo.name}</span>
                  </p>
                  <Btn variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                    Cancel
                  </Btn>
                </div>
              )}
              {recordingComment ? (
                <VoiceRecorder onSubmit={handleVoiceComment} onCancel={() => setRecordingComment(false)} compact />
              ) : (
                <div className={s.composerRow}>
                  <div className={s.composerInput}>
                    <CommentInput onSubmit={handleCommentSubmit} isLoggedIn={true} />
                  </div>
                  <IconBtn label="Record a voice note" onClick={() => setRecordingComment(true)} className={s.micBtn}>
                    <Mic size={19} strokeWidth={2.2} aria-hidden="true" />
                  </IconBtn>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ═══ THREE-DOT MENU: a catcher under it closes it; Escape too ═══ */}
      {menuOpen && (
        <>
          <div className={s.menuCatcher} onClick={() => setMenuOpen(false)} />
          <div
            id={menuId}
            ref={menuRef}
            className={cx(ui.menu, s.menu)}
            style={{
              top: menuBtnRef.current ? menuBtnRef.current.getBoundingClientRect().bottom + 8 : 0,
              // clientWidth leaves out the scrollbar, which window.innerWidth counts
              right: menuBtnRef.current ? document.documentElement.clientWidth - menuBtnRef.current.getBoundingClientRect().right : 0,
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                setMenuOpen(false);
                menuBtnRef.current?.focus();
              }
            }}
          >
            <button type="button" onClick={() => { setMenuOpen(false); router.push(`/dashboard/memories/${activeTab.id}/edit`); }} className={ui.menuItem}>
              <PenLine size={17} strokeWidth={2.2} aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                // The confirm hands focus back to the menu button when it closes.
                menuBtnRef.current?.focus();
                setDeleteModalId(activeTab.id);
              }}
              className={cx(ui.menuItem, ui.menuItemDanger)}
            >
              <Trash2 size={17} strokeWidth={2.2} aria-hidden="true" />
              Delete
            </button>
          </div>
        </>
      )}

      {/* ═══ REPORT MODAL ═══ */}
      {reportOpen && (
        <div className={s.layer}>
          <div className={cx(ui.scrim, ui.fadeIn, 'scrim-blur')} onClick={() => !reporting && setReportOpen(false)} />
          <div
            ref={reportRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={reportTitleId}
            aria-describedby={reportTextId}
            className={cx(ui.sheet, ui.confirm, ui.popIn)}
          >
            <h2 id={reportTitleId} className={ui.confirmTitle}>Report this memory</h2>
            <p id={reportTextId} className={ui.confirmText}>If this memory contains something inappropriate, let us know. We&apos;ll review it.</p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="What's wrong with this memory? (optional)"
              aria-label="What's wrong with this memory? (optional)"
              rows={3}
              className={cx(ui.textarea, s.reportField)}
            />
            <div className={ui.confirmActions}>
              <Btn variant="soft" onClick={() => setReportOpen(false)} disabled={reporting} className={s.confirmBtn}>
                Cancel
              </Btn>
              <Btn
                variant="danger"
                onClick={async () => { setReporting(true); try { const res = await fetch('/api/report-memory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memory_id: memoryId, reason: reportReason.trim() || null }) }); if (res.ok) { setReportDone(true); setReportOpen(false); } } finally { setReporting(false); } }}
                disabled={reporting}
                icon={reporting ? <Spinner size={16} /> : undefined}
                className={s.confirmBtn}
              >
                {reporting ? 'Submitting…' : 'Report'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELETE MODAL ═══ */}
      {deleteModalId && (
        <div className={s.layer}>
          <div className={cx(ui.scrim, ui.fadeIn, 'scrim-blur')} onClick={() => !deleting && setDeleteModalId(null)} />
          <div
            ref={deleteRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={deleteTitleId}
            aria-describedby={deleteTextId}
            className={cx(ui.sheet, ui.confirm, ui.popIn)}
          >
            <h2 id={deleteTitleId} className={ui.confirmTitle}>Delete this memory?</h2>
            <p id={deleteTextId} className={ui.confirmText}>This is permanent and cannot be undone. All photos, comments, and reactions will be removed.</p>
            <div className={ui.confirmActions}>
              <Btn variant="soft" onClick={() => setDeleteModalId(null)} disabled={deleting} className={s.confirmBtn}>
                Cancel
              </Btn>
              <Btn
                variant="danger"
                onClick={handleDeleteTab}
                disabled={deleting}
                icon={deleting ? <Spinner size={16} /> : undefined}
                className={s.confirmBtn}
              >
                {deleting ? 'Deleting…' : 'Delete forever'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADD MEMORY MODAL ═══ */}
      {showAddModal && (<AddMemoryModal memoryId={memoryId} familyId={familyId} currentUserId={currentUserId} promptQuestion={promptQuestion} parentAuthorId={tabs[0]?.authorId || ''} onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); router.refresh(); }} />)}
    </article>
  );
}

/* The photo on show in a colour frame (arrows, counter, dots, swipe), with the first five
   photos as small colour tiles underneath. The frame takes the four colours in turn. */
function HeroImageCarousel({ images, title }: { images: { url: string }[]; title: string }) {
  const [activeImage, setActiveImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const touchStart = useRef<number | null>(null);
  // Choosing the photo already on show used to blank it (no new load to fade it back in).
  const goTo = (i: number) => { if (i === activeImage) return; setImageLoaded(false); setActiveImage(i); };
  const goNext = () => goTo((activeImage + 1) % images.length);
  const goPrev = () => goTo((activeImage - 1 + images.length) % images.length);
  return (
    <div>
      <div className={s.frame} style={{ '--frame': tone(activeImage).bg } as CSSProperties}>
        <div className={s.stage} data-hover={isHovered} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }} onTouchEnd={(e) => { if (touchStart.current === null) return; const diff = touchStart.current - e.changedTouches[0].clientX; if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); } touchStart.current = null; }}>
          <Image key={activeImage} src={images[activeImage].url} alt={title} fill priority sizes={STAGE_SIZES} className={cx(s.stageImg, imageLoaded && s.stageImgIn)} onLoadingComplete={() => setImageLoaded(true)} />
          {images.length > 1 && (<>
            <div className={s.shade} />
            <span className={cx(ui.photoChip, ui.photoChipInk, s.counter)}>{activeImage + 1} / {images.length}</span>
            <IconBtn label="Previous image" onPhoto onClick={goPrev} className={cx(s.nav, s.navPrev)}>
              <ChevronLeft size={20} strokeWidth={2.6} aria-hidden="true" />
            </IconBtn>
            <IconBtn label="Next image" onPhoto onClick={goNext} className={cx(s.nav, s.navNext)}>
              <ChevronRight size={20} strokeWidth={2.6} aria-hidden="true" />
            </IconBtn>
            <div className={s.dots}>{images.map((_, i) => (<button type="button" key={i} onClick={() => goTo(i)} className={cx(s.dot, i === activeImage && s.dotActive)} aria-label={`Go to image ${i + 1}`} aria-current={i === activeImage ? 'true' : undefined} />))}</div>
          </>)}
        </div>
      </div>
      {images.length > 1 && (
        <div className={s.thumbs} aria-hidden="true">
          {images.slice(0, 5).map((img, i) => (
            <div key={i} className={s.thumb} style={{ '--frame': tone(i).bg } as CSSProperties}>
              <span className={s.thumbInner}>
                <Image src={img.url} alt="" fill sizes="120px" className={s.thumbImg} />
              </span>
              {i === 4 && images.length > 5 && (<span className={s.thumbMore}>+{images.length - 5}</span>)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyImagePlaceholder() {
  return (
    <div className={s.quote}>
      <span className={s.quoteMark} aria-hidden="true">&ldquo;</span>
      <p className={s.quoteText}>A memory worth reading</p>
    </div>
  );
}

function MemoryVoiceNoteItem({ note, onDelete }: { note: MemoryVoiceNote; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const initials = note.recorderName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const dateLabel = new Date(note.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <li className={ui.listRow}>
      <div className={s.voiceTop}>
        <span className={s.voiceAvatar}>
          <AuthorAvatar avatarUrl={note.recorderAvatarUrl} name={note.recorderName} initials={initials} size={32} />
        </span>
        <div className={s.voiceWho}>
          <p className={s.voiceName}>{note.recorderName}</p>
          <p className={s.voiceDate} suppressHydrationWarning>{dateLabel}</p>
        </div>
        {note.isRecorder && (
          <div className={s.voiceCtrl}>
            {confirming ? (
              <>
                <Btn variant="danger" size="sm" onClick={onDelete} className={s.voiceCtrlBtn}>Delete</Btn>
                <Btn variant="ghost" size="sm" onClick={() => setConfirming(false)} className={s.voiceCtrlBtn}>Cancel</Btn>
              </>
            ) : (
              <IconBtn label="Delete voice note" ghost size="sm" onClick={() => setConfirming(true)}>
                <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
              </IconBtn>
            )}
          </div>
        )}
      </div>
      <div className={s.voicePlayer}>
        <VoiceNotePlayer src={note.url} />
      </div>
    </li>
  );
}

/** The kit's round avatar with a ring in the person's colour: their photo, or their initials. */
function AuthorAvatar({ avatarUrl, name, initials, size }: { avatarUrl: string | null; name: string; initials: string; size: number }) {
  return (
    <Avatar name={name} size={size}>
      {avatarUrl ? (
        <Image src={avatarUrl} alt="" fill sizes={`${size}px`} />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </Avatar>
  );
}

function AddMemoryModal({ memoryId, familyId, currentUserId, promptQuestion, parentAuthorId, onClose, onSuccess }: { memoryId: string; familyId: string; currentUserId: string; promptQuestion: string | null; parentAuthorId: string; onClose: () => void; onSuccess: () => void }) {
  const supabase = getBrowserClient();
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState('');
  const [error, setError] = useState('');
  const [photoLimitNotice, setPhotoLimitNotice] = useState('');
  const titleId = useId();
  const bodyId = useId();
  const photosId = useId();
  // Escape closes it (as the close button and the backdrop do), never while it saves.
  const panelRef = useDialog<HTMLDivElement>(true, () => {
    if (!submitting) onClose();
  });
  const addPhotos = useCallback(async (files: FileList | File[]) => { const arr = Array.from(files).filter((f) => f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.heic')); if (!arr.length) return; const remaining = 10 - photos.length; setPhotoLimitNotice(arr.length > remaining ? "You can add up to 10 photos. The rest weren't added." : ''); setProcessing(true); try { const converted = await Promise.all(arr.slice(0, remaining).map((f) => ensureDisplayableImage(f))); setPhotos((prev) => [...prev, ...converted.map((file) => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, file, preview: URL.createObjectURL(file) }))]); } finally { setProcessing(false); } }, [photos.length]);
  const removePhoto = useCallback((id: string) => { setPhotos((prev) => { const item = prev.find((p) => p.id === id); if (item) URL.revokeObjectURL(item.preview); return prev.filter((p) => p.id !== id); }); }, []);
  const handleSubmit = async () => {
    if (!body.trim() || submitting) return; setSubmitting(true); setError('');
    try {
      setSubmitStep('Saving…');
      const { data: memory, error: memErr } = await supabase.from('family_memories').insert({ family_id: familyId, author_id: currentUserId, parent_memory_id: memoryId, title: promptQuestion || 'My memory of this moment', body: body.trim() }).select('id').single();
      if (memErr || !memory) throw memErr || new Error('Could not save your memory.');
      // The memory is saved by now: a photo that fails is reported, not a reason to stop (a
      // retry would save the memory twice).
      let failed = 0;
      for (let i = 0; i < photos.length; i++) {
        setSubmitStep(`Uploading photo ${i + 1}/${photos.length}…`);
        const ext = photos[i].file.name.split('.').pop() || 'jpg';
        const filePath = `${currentUserId}/${memory.id}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage.from('memory-media').upload(filePath, photos[i].file);
        if (upErr) { failed++; continue; }
        const { error: rowErr } = await supabase.from('family_memory_media').insert({ memory_id: memory.id, family_id: familyId, user_id: currentUserId, file_path: filePath, file_type: 'image', display_order: i });
        if (rowErr) failed++;
      }
      if (failed) safeToast.error(failed === 1 ? 'One photo could not be uploaded.' : `${failed} photos could not be uploaded.`);
      if (parentAuthorId && parentAuthorId !== currentUserId) { try { await supabase.from('notifications').insert({ user_id: parentAuthorId, type: 'memory_addition', actor_id: currentUserId, target_id: memoryId, target_type: 'family_memory' }); } catch {} }
      window.dispatchEvent(new Event('dashboard-data-changed'));
      onSuccess();
    } catch (err) { setError(err instanceof Error && err.message ? err.message : 'Something went wrong.'); setSubmitting(false); }
  };
  return (
    <div className={s.addLayer}>
      <div className={cx(ui.scrim, ui.fadeIn, 'scrim-blur')} onClick={() => !submitting && onClose()} />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className={cx(ui.sheet, ui.sheetBottom, s.addPanel)}>
        <div className={ui.sheetHeader}>
          <h2 id={titleId} className={ui.sheetTitle}>Add your <Accent>memory</Accent></h2>
          <IconBtn label="Close" onClick={onClose}>
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>
        </div>

        <div className={ui.sheetBody}>
          {promptQuestion && (
            <div className={cx(ui.card, s.prompt, s.addPrompt)}>
              <Tag dot="var(--c1)">The question</Tag>
              <p className={s.promptText}>&ldquo;{promptQuestion}&rdquo;</p>
            </div>
          )}

          <div className={s.addField}>
            <label htmlFor={bodyId} className={ui.label}>Your memory</label>
            <textarea id={bodyId} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What do you remember about this moment?" rows={5} className={cx(ui.textarea, s.addTextarea)} />
          </div>

          <div className={s.addField}>
            <p id={photosId} className={ui.label}>Photos <span className={s.optional}>(optional)</span></p>
            {photos.length > 0 && (
              <ul className={s.addPhotos} aria-labelledby={photosId}>
                {photos.map((p) => (
                  <li key={p.id} className={s.addPhoto}>
                    <Image src={p.preview} alt="" fill sizes="160px" className={s.addPhotoImg} />
                    {!submitting && (
                      <IconBtn label="Remove photo" size="sm" onPhoto onClick={() => removePhoto(p.id)} className={s.addPhotoRemove}>
                        <X size={15} strokeWidth={2.6} aria-hidden="true" />
                      </IconBtn>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {photos.length < 10 && (
              <label className={cx(ui.dropzone, processing && ui.dropzoneActive, s.addDrop)}>
                {processing ? <Spinner size={24} /> : <IconTile Icon={ImagePlus} tone={toneByKey('orange')} size="sm" />}
                <span className={ui.dropzoneTitle}>{processing ? 'Processing…' : photos.length > 0 ? 'Add more' : 'Add a photo'}</span>
                <input type="file" accept="image/*,.heic" multiple className={ui.srOnly} disabled={processing} onChange={(e) => { if (e.target.files?.length) addPhotos(e.target.files); e.target.value = ''; }} />
              </label>
            )}
            {photoLimitNotice && <p className={cx(ui.noticeWarn, s.addNotice)}>{photoLimitNotice}</p>}
          </div>

          {error && <p className={cx(ui.noticeError, s.addNotice)} role="alert">{error}</p>}
        </div>

        <div className={ui.sheetFooter}>
          <Btn
            block
            onClick={handleSubmit}
            disabled={!body.trim() || submitting}
            tile={submitting ? <Spinner size={16} /> : <Send size={16} strokeWidth={2.4} />}
          >
            {submitting ? submitStep || 'Saving…' : 'Share your memory'}
          </Btn>
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

// Bodies arrive already cleaned by the server (page.tsx, sanitize-html with an allow-list), so
// the server render and the browser agree. The old browser-only clean-up returned the raw HTML
// during the server render, so an onerror in a body ran before React even started.
function sanitiseHtml(html: string): string {
  return html;
}
