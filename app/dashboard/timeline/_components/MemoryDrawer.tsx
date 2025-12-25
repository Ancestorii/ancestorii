'use client';

import { useEffect, useMemo, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { uploadEventMedia, getSignedMediaUrl } from '../_actions/uploadMedia';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

type MediaRow = {
  id: string;
  file_path: string;
  file_type: 'photo' | 'video' | 'audio' | 'file' | null;
  created_at: string | null;
};


type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle?: string;
};

export default function MemoryDrawer({ open, onOpenChange, eventId, eventTitle }: Props) {
  const supabase = getBrowserClient();

  const [title, setTitle] = useState<string>(eventTitle || '');
  const [note, setNote] = useState<string>('');
  const [savingNote, setSavingNote] = useState(false);
  const [eventOwner, setEventOwner] = useState<string>('');
  const [me, setMe] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [signed, setSigned] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setMe(data?.user?.id ?? '');
    })();
  }, [supabase]);

  async function fetchEvent() {
    if (!eventId) return;
    const { data, error } = await supabase
      .from('timeline_events')
      .select('title, description, owner_id')
      .eq('id', eventId)
      .single();

    if (!error && data) {
      setTitle(data.title ?? eventTitle ?? 'Memory');
      setNote(data.description ?? '');
      setEventOwner(data.owner_id);
    }
  }

  async function fetchMedia() {
    setLoading(true);
    const { data, error } = await supabase
      .from('timeline_event_media')
      .select(`
          id,
         file_path,
         file_type,
         created_at
         `)

      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      setStatus(`Error: ${error.message}`);
      setMedia([]);
    } else {
      setMedia((data as any) || []);
      setStatus('');
    }
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      if (!media.length) {
        setSigned({});
        return;
      }
      const map: Record<string, string> = {};
      for (const row of media) {
        try {
          const url = await getSignedMediaUrl(row.file_path);
          map[row.id] = url;
        } catch {}
      }
      setSigned(map);
    })();
  }, [media, supabase]);

  useEffect(() => {
    if (open && eventId) {
      fetchEvent();
      fetchMedia();
    }
  }, [open, eventId]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setStatus('Uploading…');
    try {
      await uploadEventMedia({ eventId, file });
      setStatus('Uploaded ✅');
      await fetchMedia();
    } catch (err: any) {
      setStatus(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  }

async function saveNote() {
  if (!eventId) return;
  setSavingNote(true);
  try {
    const { error } = await supabase
      .from('timeline_events')
      .update({ description: note })
      .eq('id', eventId);
    if (error) throw error;
    setStatus('Saved!');           // <— add this
    setTimeout(() => setStatus(''), 1200);
  } catch (err: any) {
    alert(`Failed to save note: ${err.message}`);
  } finally {
    setSavingNote(false);
  }
}


  async function deleteMedia(row: MediaRow) {
    if (!eventOwner || me !== eventOwner) {
      alert('Only the event owner can delete media.');
      return;
    }
    const ok = confirm('Delete this file? This cannot be undone.');
    if (!ok) return;

    const { error: sErr } = await supabase.storage
      .from('timeline-media')
      .remove([row.file_path]);
    if (sErr) {
      alert(`Storage delete failed: ${sErr.message}`);
      return;
    }

    const { error: dErr } = await supabase
      .from('timeline_event_media')
      .delete()
      .eq('id', row.id);
    if (dErr) {
      alert(`DB delete failed: ${dErr.message}`);
      return;
    }

    await fetchMedia();
  }

  const headerTitle = useMemo(() => title || eventTitle || 'Memory', [title, eventTitle]);
  const isOwner = me && eventOwner && me === eventOwner;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-6 space-y-6 overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-2xl font-semibold text-slate-800">
            {headerTitle}
          </SheetTitle>
          <SheetDescription className="text-slate-600">
            View and add memories for this event.
          </SheetDescription>
        </SheetHeader>

        {/* uploader */}
        <div className="border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Input type="file" onChange={onFileChange} disabled={loading} className="cursor-pointer" />
            <Button variant="secondary" disabled>{loading ? 'Working…' : 'Add media'}</Button>
          </div>
          {status && <p className="text-xs text-slate-500 mt-2">{status}</p>}
        </div>

        {/* note editor */}
        <div className="border rounded-xl p-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Event note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Write a short memory, story, or context…"
          />
          <div className="mt-3">
            <Button
              onClick={saveNote}
              disabled={savingNote}
              className="w-full bg-gradient-to-r from-[#6A36FF] to-[#7C3AED] text-white font-medium py-2 rounded-md shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              {savingNote ? 'Saving…' : 'Save Memory'}
            </Button>
          </div>
        </div>

        {/* media list */}
        <ScrollArea className="max-h-[60vh] pb-6">
          <div className="grid grid-cols-2 gap-4">
            {loading && !media.length && (
              <p className="text-sm text-slate-500">Loading…</p>
            )}

            {!loading && media.length === 0 && (
              <p className="text-sm text-slate-500 text-center w-full col-span-2">
                No memories yet. Be the first to add one.
              </p>
            )}

            {media.map((m) => {
              const url = signed[m.id];
              const kind = m.file_type || 'file';

              return (
                <div key={m.id} className="rounded-lg overflow-hidden border">
                  <div className="relative">
                    {kind === 'photo' && url && (
                      <img src={url} alt="memory" className="w-full h-48 object-cover" />
                    )}
                    {kind === 'video' && url && (
                      <video src={url} controls className="w-full h-48 object-cover" />
                    )}
                    {kind === 'audio' && url && (
                      <div className="p-3">
                        <audio controls className="w-full">
                          <source src={url} />
                        </audio>
                      </div>
                    )}
                    {(kind === 'file' || !url) && (
                      <a
                        href={url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="block p-3 text-sm hover:bg-muted"
                      >
                        {m.file_path.split('/').pop()}
                      </a>
                    )}

                    {isOwner && (
                      <button
                        onClick={() => deleteMedia(m)}
                        className="absolute top-2 right-2 rounded-md bg-white/90 px-2 py-1 text-xs border hover:bg-white"
                        title="Delete"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
