'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import VoiceNoteDrawer from '../../_components/VoiceNoteDrawer';
import { Trash2 } from 'lucide-react';

type ProfileShape = { full_name: string | null } | { full_name: string | null }[];

type Letter = {
  id: string;
  capsule_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  Profiles?: ProfileShape;
};

type VoiceNote = {
  id: string;
  capsule_id: string;
  user_id: string;
  file_path: string;
  created_at: string;
  signed_url?: string | null;
  Profiles?: ProfileShape;
};

export default function CapsuleMediaInteractionsPanel({
  capsuleId,
}: {
  capsuleId: string;
}) {
  const supabase = getBrowserClient();

  const [letter, setLetter] = useState<Letter | null>(null);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!capsuleId) return;

    (async () => {
      try {
        const { data: letters, error: lErr } = await supabase
          .from('capsule_comments')
          .select(`
                   id,
                   capsule_id,
                   user_id,
                   comment,
                   created_at,
                  Profiles:Profiles(full_name)
                  `)
          .eq('capsule_id', capsuleId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (lErr) throw lErr;

        const activeLetter = letters?.[0] ?? null;
        setLetter(activeLetter);
        setDraft(activeLetter?.comment ?? '');

        const { data: voices, error: vErr } = await supabase
          .from('capsule_voice_notes')
          .select(`
                   id,
                   capsule_id,
                   user_id,
                   file_path,
                   created_at,
                   Profiles:Profiles(full_name)
                   `)
          .eq('capsule_id', capsuleId)
          .order('created_at', { ascending: false });

        if (vErr) throw vErr;

        const withSigned = await Promise.all(
          (voices ?? []).map(async (v) => {
            const { data } = await supabase.storage
              .from('capsule-media')
              .createSignedUrl(v.file_path, 3600);

            return { ...v, signed_url: data?.signedUrl ?? null };
          })
        );

        setVoiceNotes(withSigned);
      } catch {
        toast.error('Failed to load capsule interactions.');
      }
    })();
  }, [capsuleId, supabase]);

  const saveLetter = async () => {
    if (!draft.trim()) return;

    try {
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess?.session?.user?.id;
      if (!userId) return;

      if (letter) {
        await supabase
          .from('capsule_comments')
          .update({ comment: draft.trim() })
          .eq('id', letter.id);

        setLetter({ ...letter, comment: draft.trim() });
      } else {
        const { data } = await supabase
          .from('capsule_comments')
          .insert({
            capsule_id: capsuleId,
            user_id: userId,
            comment: draft.trim(),
          })
          .select('id,capsule_id,user_id,comment,created_at,Profiles(full_name)')
          .single();

        setLetter(data as Letter);
      }

      toast.success('Letter saved.');
    } catch {
      toast.error('Failed to save letter.');
    }
  };

  const deleteVoice = async (id: string) => {
    await supabase.from('capsule_voice_notes').delete().eq('id', id);
    setVoiceNotes((p) => p.filter((v) => v.id !== id));
  };

  return (
    <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-[#E6C26E]/55 px-10 py-12 overflow-y-auto">
      <h3 className="text-xl font-semibold text-[#0f2040] mb-2">
        Write a letter to your future self
      </h3>

      <p className="text-sm text-gray-500 mb-4">
        This letter stays sealed inside this capsule until it is opened.
      </p>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Dear future me…"
        rows={12}
        className="w-full border rounded-lg p-2 text-sm mb-3 focus:ring-2 focus:ring-[#E6C26E] outline-none"
      />

      <button
        onClick={saveLetter}
        className="px-6 py-3 bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] rounded-full text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition"
      >
        Save Letter
      </button>

      {letter && (
  <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
    <span>
      Written by{' '}
      <span className="font-semibold text-[#1F2837]">
        {Array.isArray(letter.Profiles)
          ? letter.Profiles[0]?.full_name
          : letter.Profiles?.full_name || 'You'}
      </span>
    </span>
    •
    <span>
      {new Date(letter.created_at).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}
    </span>
  </div>
)}

      <div className="mt-16">
        <h3 className="text-lg font-semibold text-[#0f2040] mb-4">
          Voice Notes
        </h3>

        <button
          onClick={() => setVoiceOpen(true)}
          className="px-6 py-3 mb-6 bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] rounded-full text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition"
        >
          + Add Voice Note
        </button>

        <div className="space-y-4">
          {voiceNotes.length ? (
            voiceNotes.map((v) => {
              const name = Array.isArray(v.Profiles)
                ? v.Profiles[0]?.full_name
                : v.Profiles?.full_name;

              return (
                <div
                  key={v.id}
                  className="border border-gray-100 rounded-xl p-4 shadow-sm relative bg-white"
                >
                  <p className="text-sm font-semibold text-[#1F2837] mb-2">
                    {name || 'Anonymous'}
                  </p>

                  {v.signed_url && (
                    <audio controls src={v.signed_url} className="w-full" />
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(v.created_at).toLocaleString()}
                  </p>

                  <button
                    onClick={() => deleteVoice(v.id)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-gray-400 italic">
              No voice notes yet.
            </p>
          )}
        </div>
      </div>

      <VoiceNoteDrawer
        capsuleId={capsuleId}
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onUploaded={async (note) => {
          const { data } = await supabase.storage
            .from('capsule-media')
            .createSignedUrl(note.file_path, 3600);

          setVoiceNotes((p) => [
            { ...note, signed_url: data?.signedUrl ?? null },
            ...p,
          ]);

          toast.success('Voice note added.');
        }}
      />
    </div>
  );
}
