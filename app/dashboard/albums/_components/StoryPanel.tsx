'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';
import VoiceNoteDrawer from './VoiceNoteDrawer';
import { X, Trash2, Mic, Send, Maximize2, Pencil, Calendar, Images } from 'lucide-react';
import { ui, Btn, IconBtn, IconTile, Tag, toneByKey } from '@/components/dashboard/ui/AppBits';
import s from './albums.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type ProfileShape = { full_name: string | null } | { full_name: string | null }[];
type Comment = { id: string; media_id: string; user_id: string; text: string; created_at: string; Profiles?: ProfileShape };
type VoiceNote = { id: string; media_id: string; user_id: string; file_path: string; created_at: string; Profiles?: ProfileShape };
type Media = { id: string; album_id: string; user_id?: string | null; file_path: string | null; file_type: string | null; library_media_id?: string | null; library_media?: { id: string; file_path: string; file_type: string; created_at: string | null } | null; created_at: string; signed_url?: string | null; caption?: string | null; memory_date?: string | null };

/* ───────────────────── section ───────────────────── */

function Section({ title, dot, children, right }: { title: string; dot: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className={s.storySection}>
      <div className={s.storySectionHead}>
        <Tag dot={dot}>{title}</Tag>
        {right}
      </div>
      {children}
    </section>
  );
}

/* ───────────────────── waveform ───────────────────── */

function AudioWaveform({ count = 40 }: { count?: number }) {
  const pattern = [4,8,6,12,5,9,7,11,6,8,4,9,6,12,7,10,5,8,6,9,5,7,10,6];
  const bars = Array.from({ length: count }, (_, i) => pattern[i % pattern.length]);
  const w = count * 6;
  return (
    <svg viewBox={`0 0 ${w} 18`} style={{ width: '100%', height: 18, color: 'var(--c1)' }} preserveAspectRatio="none" aria-hidden="true">
      {bars.map((h, i) => (<rect key={i} x={i * 6} y={9 - h / 2} width={3} height={h} rx={1.5} fill="currentColor" opacity={0.8} />))}
    </svg>
  );
}

/* ───────────────────── edit button ───────────────────── */

function EditBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <IconBtn label={label} ghost size="sm" onClick={onClick} className="-my-1">
      <Pencil size={17} strokeWidth={2.2} aria-hidden="true" />
    </IconBtn>
  );
}

/* ───────────────────── main ───────────────────── */

export default function StoryPanel({ selectedMedia, albumId, user, allMedia, taggedPeople, onClose, onDelete, onLightbox, onCaptionSaved, onDateSaved, onCommentCountChanged, onVoiceNoteCountChanged }: {
  selectedMedia: Media | null; albumId: string; user: { id: string } | null; allMedia: Media[];
  taggedPeople: { id: string; full_name: string; avatar_signed?: string | null }[];
  onClose: () => void; onDelete: (media: Media) => void; onLightbox: (media: Media) => void;
  onCaptionSaved: (mediaId: string, caption: string) => void; onDateSaved: (mediaId: string, date: string) => void;
  onCommentCountChanged: (mediaId: string, delta: number) => void; onVoiceNoteCountChanged: (mediaId: string, delta: number) => void;
}) {
  const supabase = getBrowserClient();

  /* story entries = comments table, relabelled */
  const [storyEntries, setStoryEntries] = useState<Comment[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [newStory, setNewStory] = useState('');

  /* heading = caption field */
  const [headingDraft, setHeadingDraft] = useState('');
  const [headingEditing, setHeadingEditing] = useState(false);
  const [headingSaving, setHeadingSaving] = useState(false);

  /* date */
  const [dateDraft, setDateDraft] = useState('');
  const [dateEditing, setDateEditing] = useState(false);
  const [dateSaving, setDateSaving] = useState(false);

  const headingRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  /* sync drafts on selection change */
  useEffect(() => {
    setHeadingDraft(selectedMedia?.caption || '');
    setDateDraft(selectedMedia?.memory_date || '');
    setHeadingEditing(false);
    setDateEditing(false);
  }, [selectedMedia?.id]);

  /* load story entries (comments) + voice notes. A quick switch to another memory used to let the
     earlier memory's entries land afterwards; the notes are signed in one request. */
  useEffect(() => {
    if (!selectedMedia) { setStoryEntries([]); setVoiceNotes([]); return; }
    let cancelled = false;
    (async () => {
      try {
        const [cRes, vRes] = await Promise.all([
          supabase.from('album_media_comments').select('id,media_id,user_id,text,created_at,Profiles(full_name)').eq('media_id', selectedMedia.id).order('created_at', { ascending: true }),
          supabase.from('album_media_voice_notes').select('id,media_id,user_id,file_path,created_at,Profiles(full_name)').eq('media_id', selectedMedia.id).order('created_at', { ascending: false }),
        ]);
        if (cRes.error) throw cRes.error;
        if (vRes.error) throw vRes.error;
        const notes = (vRes.data ?? []) as VoiceNote[];
        let signed: VoiceNote[] = [];
        if (notes.length > 0) {
          const { data } = await supabase.storage.from('album-media').createSignedUrls(notes.map((v) => v.file_path), 3600);
          signed = notes.map((v, i) => ({ ...v, file_path: data?.[i]?.signedUrl ?? '' }));
        }
        if (cancelled) return;
        setStoryEntries(cRes.data ?? []);
        setVoiceNotes(signed);
      } catch { if (!cancelled) toast.error('Failed to load details.'); }
    })();
    return () => { cancelled = true; };
  }, [selectedMedia?.id, supabase]);

  /* ── save heading (caption) ── */
  const saveHeading = async () => {
    if (!selectedMedia || headingSaving) return;
    const t = headingDraft.trim();
    if (t === (selectedMedia.caption || '')) { setHeadingEditing(false); return; }
    setHeadingSaving(true);
    try {
      const { error } = await supabase.from('album_media').update({ caption: t || null }).eq('id', selectedMedia.id);
      if (error) throw error;
      onCaptionSaved(selectedMedia.id, t);
      setHeadingEditing(false);
    } catch { toast.error('Failed to save.'); }
    finally { setHeadingSaving(false); }
  };

  /* ── save date ── */
  const saveDate = async () => {
    if (!selectedMedia || dateSaving) return;
    const t = dateDraft.trim();
    if (t === (selectedMedia.memory_date || '')) { setDateEditing(false); return; }
    setDateSaving(true);
    try {
      const { error } = await supabase.from('album_media').update({ memory_date: t || null }).eq('id', selectedMedia.id);
      if (error) throw error;
      onDateSaved(selectedMedia.id, t);
      setDateEditing(false);
    } catch { toast.error('Failed to save.'); }
    finally { setDateSaving(false); }
  };

  /* ── add story entry (insert into comments table) ── */
  const addStoryEntry = async () => {
    if (!newStory.trim() || !selectedMedia) return;
    try {
      const userId = (await supabase.auth.getSession()).data?.session?.user?.id;
      if (!userId) throw new Error('Not signed in');
      const { data, error } = await supabase.from('album_media_comments')
        .insert({ media_id: selectedMedia.id, user_id: userId, text: newStory.trim() })
        .select('id,media_id,user_id,text,created_at,Profiles(full_name)')
        .single();
      if (error) throw error;
      setStoryEntries((p) => [...p, data as Comment]);
      setNewStory('');
      onCommentCountChanged(selectedMedia.id, 1);
    } catch { toast.error('Failed.'); }
  };

  /* ── delete story entry ── */
  const deleteStoryEntry = async (id: string) => {
    if (!selectedMedia) return;
    try {
      // RLS lets only the album's creator delete; a blocked delete returns 0 rows silently.
      const removed = await deleteWithOwnerCheck(supabase, 'album_media_comments', id, 'album');
      if (!removed) return;
      setStoryEntries((p) => p.filter((c) => c.id !== id));
      onCommentCountChanged(selectedMedia.id, -1);
    } catch { toast.error('Failed.'); }
  };

  /* ── delete voice note ── */
  const deleteVoiceNote = async (id: string) => {
    if (!selectedMedia) return;
    try {
      const removed = await deleteWithOwnerCheck(supabase, 'album_media_voice_notes', id, 'album');
      if (!removed) return;
      setVoiceNotes((p) => p.filter((v) => v.id !== id));
      onVoiceNoteCountChanged(selectedMedia.id, -1);
    } catch { toast.error('Failed.'); }
  };

  const profileName = (p?: ProfileShape) => { if (!p) return 'You'; return (Array.isArray(p) ? p[0]?.full_name : p.full_name) || 'You'; };

  /* ── empty state ── */
  if (!selectedMedia) {
    return (
      <div className={s.storyIdle}>
        <IconTile Icon={Images} tone={toneByKey('orange')} size="lg" />
        <p className={s.storyIdleTitle}>Select a memory</p>
        <p className={s.storyIdleText}>to see its story</p>
      </div>
    );
  }

  const realType = (selectedMedia.file_type ?? selectedMedia.library_media?.file_type) || '';

  return (
    <div className={s.story}>

      {/* ══════════ HEADER: date chip + heading + edit ══════════ */}
      <div className={s.storyHead}>
        <div className="min-w-0 flex-1">
          {selectedMedia.memory_date && (
            <span
              className={cx(ui.chip, ui.chipSm, ui.chipDot, s.storyDate)}
              style={{ '--dot': 'var(--c3)' } as CSSProperties}
            >
              {selectedMedia.memory_date}
            </span>
          )}

          {headingEditing ? (
            <div>
              {/* Escape cancels the edit and stops there, so the phone sheet around it stays open */}
              <input
                ref={headingRef} type="text" value={headingDraft}
                onChange={(e) => setHeadingDraft(e.target.value)}
                onBlur={saveHeading}
                onKeyDown={(e) => { if (e.key === 'Enter') saveHeading(); if (e.key === 'Escape') { e.nativeEvent.stopImmediatePropagation(); setHeadingDraft(selectedMedia.caption || ''); setHeadingEditing(false); } }}
                autoFocus placeholder="Give this memory a name…"
                aria-label="Memory title"
                className={cx(ui.input, s.titleInput)}
              />
              <p className={ui.hint}>Enter to save · Esc to cancel</p>
            </div>
          ) : (
            <div className="flex items-start gap-1.5">
              <h2 className={s.storyTitle}>
                {selectedMedia.caption || 'Untitled Memory'}
              </h2>
              <EditBtn label="Edit the title" onClick={() => { setHeadingEditing(true); setTimeout(() => headingRef.current?.focus(), 50); }} />
            </div>
          )}
        </div>

        <IconBtn label="Close" onClick={onClose}>
          <X size={20} strokeWidth={2.4} aria-hidden="true" />
        </IconBtn>
      </div>

      {/* ══════════ SCROLLABLE BODY ══════════ */}
      <div className={cx(s.storyBody, s.scroll)}>

        {/* ── Image / Video ── */}
        <div className={cx(ui.frame, s.storyFrame)} style={{ '--frame': 'var(--c2)' } as CSSProperties}>
          <div className={cx(ui.frameInner, s.storyMedia)}>
            {realType === 'video'
              ? <video src={selectedMedia.signed_url || ''} controls playsInline preload="metadata" />
              // eslint-disable-next-line @next/next/no-img-element
              : <img src={selectedMedia.signed_url || ''} alt={selectedMedia.caption || ''} />
            }
          </div>
          {realType !== 'video' && (
            <IconBtn label="View full screen" onPhoto size="sm" onClick={() => onLightbox(selectedMedia)} className={s.fullBtn}>
              <Maximize2 size={17} strokeWidth={2.4} aria-hidden="true" />
            </IconBtn>
          )}
        </div>

        {/* ── The Story (powered by comments table) ── */}
        <Section title="The Story" dot="var(--c2)">
          {/* existing story entries */}
          {storyEntries.length > 0 && (
            <ul className={s.entries}>
              {storyEntries.map((entry) => (
                <li key={entry.id} className={s.entry}>
                  <p className={s.entryText}>{entry.text}</p>
                  <div className={s.entryMeta}>
                    <span>
                      {profileName(entry.Profiles)} · {new Date(entry.created_at).toLocaleDateString('en-GB')}
                    </span>
                    {entry.user_id === user?.id && (
                      <IconBtn label="Delete this entry" ghost size="sm" onClick={() => deleteStoryEntry(entry.id)}>
                        <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
                      </IconBtn>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {storyEntries.length === 0 && (
            <p className={s.storyNote}>
              No story yet. What do you remember about this moment?
            </p>
          )}

          {/* add new story entry */}
          <div className={s.composer}>
            <textarea
              value={newStory}
              onChange={(e) => {
                setNewStory(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addStoryEntry(); } }}
              placeholder="Add to the story…"
              aria-label="Add to the story"
              rows={1}
              className={cx(ui.textarea, s.composerInput)}
            />
            <IconBtn
              label="Add to the story"
              active
              onClick={addStoryEntry} disabled={!newStory.trim()}
              className={s.composerSend}
            >
              <Send size={18} strokeWidth={2.4} aria-hidden="true" />
            </IconBtn>
          </div>
        </Section>

        {/* ── When Was This? ── */}
        <Section
          title="When Was This?"
          dot="var(--c3)"
          right={!dateEditing ? <EditBtn label="Edit the date" onClick={() => { setDateEditing(true); setTimeout(() => dateRef.current?.focus(), 50); }} /> : null}
        >
          {dateEditing ? (
            <div>
              {/* Escape cancels the edit and stops there, so the phone sheet around it stays open */}
              <input
                ref={dateRef} type="text" value={dateDraft} onChange={(e) => setDateDraft(e.target.value)}
                onBlur={saveDate}
                onKeyDown={(e) => { if (e.key === 'Enter') saveDate(); if (e.key === 'Escape') { e.nativeEvent.stopImmediatePropagation(); setDateDraft(selectedMedia.memory_date || ''); setDateEditing(false); } }}
                autoFocus placeholder='e.g. "Summer 1994"'
                aria-label="When was this?"
                className={ui.input}
              />
              <p className={ui.hint}>Enter to save · Esc to cancel</p>
            </div>
          ) : (
            <div className={s.dateRow}>
              <IconTile Icon={Calendar} tone={toneByKey('aqua')} size="sm" />
              <span className="min-w-0">{selectedMedia.memory_date || 'Not set'}</span>
            </div>
          )}
        </Section>

        {/* ── Voice Note ── */}
        <Section
          title="Voice Note"
          dot="var(--c1)"
          right={
            <Btn size="sm" onClick={() => setVoiceOpen(true)} aria-haspopup="dialog" icon={<Mic size={16} strokeWidth={2.4} aria-hidden="true" />}>
              Record
            </Btn>
          }
        >
          {voiceNotes.length > 0 ? (
            <ul className={s.voices}>
              {voiceNotes.map((v) => (
                <li key={v.id} className={cx(ui.card, s.voiceCard)}>
                  <div className={s.voiceRow}>
                    <IconTile Icon={Mic} tone={toneByKey('blue')} size="sm" />
                    <audio controls src={v.file_path || undefined} className={s.audio} />
                    {v.user_id === user?.id && (
                      <IconBtn label="Delete this voice note" ghost size="sm" onClick={() => deleteVoiceNote(v.id)}>
                        <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
                      </IconBtn>
                    )}
                  </div>
                  <p className={s.voiceMeta}>
                    {profileName(v.Profiles)} · {new Date(v.created_at).toLocaleDateString('en-GB')}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={s.storyNote}>
              No voice notes yet. Tap Record to preserve a voice with this memory.
            </p>
          )}
        </Section>

        {/* ── Delete ── */}
        <div className={s.storyEnd}>
          <Btn
            variant="dangerSoft"
            block
            onClick={() => onDelete(selectedMedia)}
            icon={<Trash2 size={17} strokeWidth={2.2} aria-hidden="true" />}
          >
            Remove From Album
          </Btn>
        </div>
      </div>

      {selectedMedia && <VoiceNoteDrawer albumId={albumId} mediaId={selectedMedia.id} open={voiceOpen} onClose={() => setVoiceOpen(false)} onUploaded={(note: VoiceNote) => { setVoiceNotes((p) => [note, ...p]); onVoiceNoteCountChanged(selectedMedia.id, 1); toast.success('Voice note added!'); }} />}
    </div>
  );
}
