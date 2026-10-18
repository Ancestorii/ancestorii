'use client';

import { useEffect, useId, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import VoiceNoteDrawer from '../../_components/VoiceNoteDrawer';
import { Check, Feather, Mic, Plus, Trash2 } from 'lucide-react';
import { ui, Btn, IconBtn, IconTile, toneByKey } from '@/components/dashboard/ui/AppBits';
import s from '../capsuleDetail.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

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

  const letterTitleId = useId();
  const voiceTitleId = useId();

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
    <div className={s.panel}>
      {/* The letter */}
      <section className={ui.card} aria-labelledby={letterTitleId}>
        <div className={s.cardHead}>
          <IconTile Icon={Feather} tone={toneByKey('pink')} size="sm" />
          <div className={s.cardHeadText}>
            <h2 id={letterTitleId} className={ui.h3}>
              Write a letter to your future self
            </h2>

            <p className={s.cardLead}>
              This letter stays sealed inside this capsule until it is opened.
            </p>
          </div>
        </div>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Dear future me…"
          rows={12}
          aria-labelledby={letterTitleId}
          className={cx(ui.textarea, s.letter)}
        />

        <div className={s.letterFoot}>
          <Btn
            onClick={saveLetter}
            icon={<Check size={18} strokeWidth={2.6} aria-hidden="true" />}
          >
            Save Letter
          </Btn>

          {letter && (
            <p className={s.byline}>
              Written by{' '}
              <span className={s.bylineName}>
                {Array.isArray(letter.Profiles)
                  ? letter.Profiles[0]?.full_name
                  : letter.Profiles?.full_name || 'You'}
              </span>
              {' · '}
              {new Date(letter.created_at).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      </section>

      {/* Voice notes */}
      <section className={ui.card} aria-labelledby={voiceTitleId}>
        <div className={s.voiceHead}>
          <div className={s.voiceTitle}>
            <IconTile Icon={Mic} tone={toneByKey('blue')} size="sm" />
            <h2 id={voiceTitleId} className={ui.h3}>
              Voice Notes
            </h2>
          </div>

          <Btn
            variant="soft"
            size="sm"
            onClick={() => setVoiceOpen(true)}
            aria-haspopup="dialog"
            icon={<Plus size={17} strokeWidth={2.4} aria-hidden="true" />}
          >
            Add Voice Note
          </Btn>
        </div>

        {voiceNotes.length ? (
          <ul className={s.voices}>
            {voiceNotes.map((v) => {
              const name = Array.isArray(v.Profiles)
                ? v.Profiles[0]?.full_name
                : v.Profiles?.full_name;

              return (
                <li key={v.id} className={s.voice}>
                  <div className={s.voiceTop}>
                    <p className={s.voiceName}>{name || 'Anonymous'}</p>

                    <IconBtn
                      label="Delete this voice note"
                      ghost
                      size="sm"
                      onClick={() => deleteVoice(v.id)}
                    >
                      <Trash2 size={16} strokeWidth={2.2} aria-hidden="true" />
                    </IconBtn>
                  </div>

                  {v.signed_url && (
                    <audio controls src={v.signed_url} className={s.audio} />
                  )}

                  <p className={s.voiceMeta}>
                    {new Date(v.created_at).toLocaleString()}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={s.note}>No voice notes yet.</p>
        )}
      </section>

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
