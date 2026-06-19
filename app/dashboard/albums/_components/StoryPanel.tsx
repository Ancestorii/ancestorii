'use client';

import { useEffect, useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import VoiceNoteDrawer from './VoiceNoteDrawer';
import { X, Trash2, Mic, Send, Maximize2, Pencil, Calendar, ArrowRight, Play } from 'lucide-react';

type ProfileShape = { full_name: string | null } | { full_name: string | null }[];
type Comment = { id: string; media_id: string; user_id: string; text: string; created_at: string; Profiles?: ProfileShape };
type VoiceNote = { id: string; media_id: string; user_id: string; file_path: string; created_at: string; Profiles?: ProfileShape };
type Media = { id: string; album_id: string; user_id?: string | null; file_path: string | null; file_type: string | null; library_media_id?: string | null; library_media?: { id: string; file_path: string; file_type: string; created_at: string | null } | null; created_at: string; signed_url?: string | null; caption?: string | null; memory_date?: string | null };

/* ───────────────────── section ───────────────────── */

function Section({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section style={{ padding: '32px 0', borderTop: '1px solid #d4af37' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 3, height: 14, borderRadius: 2, background: '#c4993d', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#3d2e1c', fontFamily: "'DM Sans', sans-serif" }}>
            {title}
          </span>
        </div>
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
    <svg viewBox={`0 0 ${w} 18`} style={{ width: '100%', height: 18 }} preserveAspectRatio="none">
      {bars.map((h, i) => (<rect key={i} x={i * 6} y={9 - h / 2} width={3} height={h} rx={1.5} fill="#b8922e" opacity={0.8} />))}
    </svg>
  );
}

/* ───────────────────── edit button ───────────────────── */

function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: 30, height: 30, borderRadius: '50%', border: '1px solid #d8cdb8',
      background: '#f5efe4', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#6b5d4d', cursor: 'pointer',
    }}>
      <Pencil size={13} />
    </button>
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

  /* load story entries (comments) + voice notes */
  useEffect(() => {
    if (!selectedMedia) { setStoryEntries([]); setVoiceNotes([]); return; }
    (async () => {
      try {
        const [cRes, vRes] = await Promise.all([
          supabase.from('album_media_comments').select('id,media_id,user_id,text,created_at,Profiles(full_name)').eq('media_id', selectedMedia.id).order('created_at', { ascending: true }),
          supabase.from('album_media_voice_notes').select('id,media_id,user_id,file_path,created_at,Profiles(full_name)').eq('media_id', selectedMedia.id).order('created_at', { ascending: false }),
        ]);
        if (cRes.error) throw cRes.error;
        if (vRes.error) throw vRes.error;
        setStoryEntries(cRes.data ?? []);
        const signed = await Promise.all((vRes.data ?? []).map(async (v) => { const { data } = await supabase.storage.from('album-media').createSignedUrl(v.file_path, 3600); return { ...v, file_path: data?.signedUrl ?? '' }; }));
        setVoiceNotes(signed);
      } catch { toast.error('Failed to load details.'); }
    })();
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
      await supabase.from('album_media_comments').delete().eq('id', id);
      setStoryEntries((p) => p.filter((c) => c.id !== id));
      onCommentCountChanged(selectedMedia.id, -1);
    } catch { toast.error('Failed.'); }
  };

  /* ── delete voice note ── */
  const deleteVoiceNote = async (id: string) => {
    if (!selectedMedia) return;
    try {
      await supabase.from('album_media_voice_notes').delete().eq('id', id);
      setVoiceNotes((p) => p.filter((v) => v.id !== id));
      onVoiceNoteCountChanged(selectedMedia.id, -1);
    } catch { toast.error('Failed.'); }
  };

  const profileName = (p?: ProfileShape) => { if (!p) return 'You'; return (Array.isArray(p) ? p[0]?.full_name : p.full_name) || 'You'; };

  /* ── empty state ── */
  if (!selectedMedia) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 28, fontStyle: 'italic', color: '#a09788', fontFamily: "'Playfair Display', Georgia, serif", margin: 0 }}>Select a memory</p>
        <p style={{ marginTop: 8, fontSize: 14, color: '#b0a89c', fontFamily: "'DM Sans', sans-serif" }}>to see its story</p>
      </div>
    );
  }

  const realType = (selectedMedia.file_type ?? selectedMedia.library_media?.file_type) || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>

      {/* ══════════ HEADER — date chip + heading + edit ══════════ */}
      <div style={{ flexShrink: 0, padding: '24px 28px 18px', background: '#ffffff'}}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {selectedMedia.memory_date && (
              <span style={{
                display: 'inline-block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.12em', color: '#926d1e', background: '#f0e6ce', padding: '4px 10px',
                borderRadius: 6, marginBottom: 10, fontFamily: "'DM Sans', sans-serif",
              }}>
                {selectedMedia.memory_date}
              </span>
            )}

            {headingEditing ? (
              <div>
                <input
                  ref={headingRef} type="text" value={headingDraft}
                  onChange={(e) => setHeadingDraft(e.target.value)}
                  onBlur={saveHeading}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveHeading(); if (e.key === 'Escape') { setHeadingDraft(selectedMedia.caption || ''); setHeadingEditing(false); } }}
                  autoFocus placeholder="Give this memory a name…"
                  style={{
                    width: '100%', border: 'none', borderBottom: '2px solid #d4af37',
                    background: 'transparent', padding: '4px 0', fontSize: 24, fontWeight: 700,
                    color: '#1a1612', outline: 'none', fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                />
                <p style={{ fontSize: 11, color: '#9a9084', marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>Enter to save · Esc to cancel</p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 26, lineHeight: 1.15, color: '#1a1612', fontWeight: 700, margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {selectedMedia.caption || <span style={{ color: '#b0a89c', fontStyle: 'italic', fontWeight: 400 }}>Untitled Memory</span>}
                </h2>
                <EditBtn onClick={() => { setHeadingEditing(true); setTimeout(() => headingRef.current?.focus(), 50); }} />
              </div>
            )}
          </div>

          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: '50%', border: '1px solid #d8cdb8',
            background: '#f5efe4', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6b5d4d', cursor: 'pointer', flexShrink: 0,
          }}>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ══════════ SCROLLABLE BODY ══════════ */}
      <div className="album-scroll" data-lenis-prevent style={{ flex: 1, overflowY: 'auto', padding: '0 28px 32px' }}>

        {/* ── Image / Video ── */}
        <div style={{ paddingTop: 24 }}>
          <div style={{
            width: '75%', margin: '0 auto', borderRadius: 16, overflow: 'hidden',
            border: '1px solid #ccc1ab', background: '#eee8db',
            boxShadow: '0 8px 28px rgba(30,22,10,0.1), 0 2px 6px rgba(30,22,10,0.06)',
            position: 'relative',
          }}>
            {realType === 'video'
              ? <video src={selectedMedia.signed_url || ''} controls playsInline preload="metadata" style={{ width: '100%' }} />
              : <img src={selectedMedia.signed_url || ''} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
            }
            {realType !== 'video' && (
              <button onClick={() => onLightbox(selectedMedia)} style={{
                position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <Maximize2 size={14} color="white" />
              </button>
            )}
          </div>
        </div>

        {/* ── The Story (powered by comments table) ── */}
        <div style={{ padding: '24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 3, height: 14, borderRadius: 2, background: '#c4993d', flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#3d2e1c', fontFamily: "'DM Sans', sans-serif" }}>The Story</span>
            </div>
          </div>
          {/* existing story entries */}
          {storyEntries.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {storyEntries.map((entry) => (
                <div key={entry.id} style={{
                  padding: '14px 16px', borderRadius: 14,
                  background: '#f5f0e6', border: '1px solid #e2d9c8',
                }}>
                  <p style={{ fontSize: 15, lineHeight: 1.8, color: '#2e271f', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                    {entry.text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: '#8a8078', fontFamily: "'DM Sans', sans-serif" }}>
                      {profileName(entry.Profiles)} · {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                    {entry.user_id === user?.id && (
                      <button onClick={() => deleteStoryEntry(entry.id)} style={{ background: 'none', border: 'none', color: '#b5aa9a', cursor: 'pointer' }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {storyEntries.length === 0 && (
            <p style={{ fontSize: 14, color: '#a8a096', fontStyle: 'italic', marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>
              No story yet. What do you remember about this moment?
            </p>
          )}

          {/* add new story entry */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <textarea
              value={newStory}
              onChange={(e) => {
                setNewStory(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addStoryEntry(); } }}
              placeholder="Add to the story…"
              rows={1}
              style={{
                flex: 1, minHeight: 44, maxHeight: 180, borderRadius: 16, border: '1px solid #c4b896',
                background: 'white', padding: '12px 16px', fontSize: 14, color: '#1e1a15',
                outline: 'none', fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                resize: 'none', lineHeight: 1.6, overflow: 'hidden',
              }}
            />
            <button
              onClick={addStoryEntry} disabled={!newStory.trim()}
              style={{
                width: 44, height: 44, borderRadius: '50%', background: '#2c2418',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer', flexShrink: 0,
                opacity: newStory.trim() ? 1 : 0.3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              <Send size={15} color="#d4af37" />
            </button>
          </div>
        </div>

        {/* ── When Was This? ── */}
        <Section
          title="When Was This?"
          right={!dateEditing ? <EditBtn onClick={() => { setDateEditing(true); setTimeout(() => dateRef.current?.focus(), 50); }} /> : null}
        >
          {dateEditing ? (
            <div>
              <input
                ref={dateRef} type="text" value={dateDraft} onChange={(e) => setDateDraft(e.target.value)}
                onBlur={saveDate}
                onKeyDown={(e) => { if (e.key === 'Enter') saveDate(); if (e.key === 'Escape') { setDateDraft(selectedMedia.memory_date || ''); setDateEditing(false); } }}
                autoFocus placeholder='e.g. "Summer 1994"'
                style={{
                  width: '100%', borderRadius: 14, border: '1px solid #c4b896', background: 'white',
                  padding: '12px 16px', fontSize: 14, color: '#1e1a15', outline: 'none',
                  fontFamily: "'DM Sans', sans-serif", boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              />
              <p style={{ fontSize: 11, color: '#9a9084', marginTop: 8, fontFamily: "'DM Sans', sans-serif" }}>Enter to save · Esc to cancel</p>
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#2e271f' }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#2c2418', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={15} color="#d4af37" />
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                {selectedMedia.memory_date || <span style={{ color: '#a8a096', fontStyle: 'italic', fontWeight: 400 }}>Not set</span>}
              </span>
            </div>
          )}
        </Section>

        {/* ── Voice Note ── */}
        <Section
          title="Voice Note"
          right={
            <button onClick={() => setVoiceOpen(true)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 16px',
              height: 34, borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: '#2c2418', color: '#d4af37', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}>
              <Mic size={13} />Record
            </button>
          }
        >
          {voiceNotes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {voiceNotes.map((v) => (
                <div key={v.id} style={{
                  borderRadius: 16, border: '1px solid #ccc1ab', background: '#f5f0e6',
                  padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', background: '#2c2418',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    }}>
                      <Play size={15} fill="#d4af37" stroke="none" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}><audio controls src={v.file_path} style={{ width: '100%', height: 32 }} /></div>
                    {v.user_id === user?.id && (
                      <button onClick={() => deleteVoiceNote(v.id)} style={{ background: 'none', border: 'none', color: '#a89e90', cursor: 'pointer' }}><Trash2 size={15} /></button>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#7a7168', marginTop: 8, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                    {profileName(v.Profiles)} · {new Date(v.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 14, color: '#a8a096', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>
              No voice notes yet. Tap Record to preserve a voice with this memory.
            </p>
          )}
        </Section>

        {/* ── Delete ── */}
        <div style={{ paddingTop: 12 }}>
          <button onClick={() => onDelete(selectedMedia)} style={{
            width: '100%', height: 44, borderRadius: 12,
            border: '1px solid #e8b4b4', background: '#fdf5f5',
            color: '#c0392b', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <Trash2 size={15} />Remove From Album
          </button>
        </div>
      </div>

      {selectedMedia && <VoiceNoteDrawer albumId={albumId} mediaId={selectedMedia.id} open={voiceOpen} onClose={() => setVoiceOpen(false)} onUploaded={(note: VoiceNote) => { setVoiceNotes((p) => [note, ...p]); onVoiceNoteCountChanged(selectedMedia.id, 1); toast.success('Voice note added!'); }} />}
    </div>
  );
}