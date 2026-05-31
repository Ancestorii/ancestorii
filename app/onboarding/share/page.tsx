'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Check,
  Copy,
  ChevronRight,
  Loader2,
  Send,
  MessageCircle,
} from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';

type Chapter = {
  id: string;
  name: string;
  icon: string;
  description: string;
};
type Prompt = { id: string; chapter_id: string; question: string };
type MemoryData = {
  id: string;
  title: string;
  body: string;
  photo_url: string | null;
};

export default function ShareScreen() {
  const supabase = getBrowserClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [memory, setMemory] = useState<MemoryData | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [familyId, setFamilyId] = useState('');
  const [userId, setUserId] = useState('');

  const [selectedChapter, setSelectedChapter] = useState<string | null>(
    null
  );
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(
    null
  );
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setUserId(user.id);

      const { data: membership } = await supabase
        .from('family_memberships')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (membership) setFamilyId(membership.family_id);

      // Fetch the onboarding memory
      const { data: memoryRow } = await supabase
        .from('family_memories')
        .select('id, title, body')
        .eq('author_id', user.id)
        .eq('is_onboarding', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (memoryRow) {
        const { data: mediaRow } = await supabase
          .from('family_memory_media')
          .select('file_path')
          .eq('memory_id', memoryRow.id)
          .eq('file_type', 'image')
          .order('display_order')
          .limit(1)
          .single();

        let photoUrl = null;
        if (mediaRow) {
          const { data: urlData } = await supabase.storage
            .from('memory-media')
            .createSignedUrl(mediaRow.file_path, 3600);
          photoUrl = urlData?.signedUrl || null;
        }

        setMemory({
          id: memoryRow.id,
          title: memoryRow.title,
          body: memoryRow.body,
          photo_url: photoUrl,
        });
      }

      const { data: chaptersData } = await supabase
        .from('memory_prompt_chapters')
        .select('*')
        .order('display_order');

      const { data: promptsData } = await supabase
        .from('memory_prompts')
        .select('*')
        .order('display_order');

      if (chaptersData) setChapters(chaptersData);
      if (promptsData) setPrompts(promptsData);

      setLoading(false);
    };
    init();
  }, []);

  const filteredPrompts = prompts.filter(
    (p) => p.chapter_id === selectedChapter
  );

  const handleSend = async () => {
    if (
      !selectedPrompt ||
      !recipientName.trim() ||
      !recipientEmail.trim() ||
      sending
    )
      return;
    setSending(true);
    setError('');

    try {
      // Create family invite for the recipient
      const { data: invite, error: inviteError } = await supabase
        .from('family_invites')
        .insert({
          family_id: familyId,
          email: recipientEmail.trim().toLowerCase(),
          invited_by: userId,
          role: 'member',
        })
        .select('id, token')
        .single();

      if (inviteError) throw inviteError;

      // Create sent prompt
      const { data: sentPrompt, error: promptError } = await supabase
        .from('sent_prompts')
        .insert({
          family_id: familyId,
          sender_id: userId,
          recipient_name: recipientName.trim(),
          recipient_email: recipientEmail.trim().toLowerCase(),
          prompt_id: selectedPrompt.id,
          invite_id: invite.id,
        })
        .select('token')
        .single();

      if (promptError) throw promptError;

      setShareUrl(
        `${window.location.origin}/answer/${sentPrompt.token}`
      );
      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
      setSending(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = `${recipientName.trim()}, I just wrote a memory on Ancestorii and I'd love to hear yours.\n\n"${selectedPrompt?.question}"\n\n${shareUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF8]">
        <Loader2 className="animate-spin text-[#B8932A]" size={24} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-5 sm:px-8 pt-10 sm:pt-14 md:pt-16 pb-12"
      style={{
        background: '#FFFDF8',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Link
        href="/"
        className="inline-block text-[34px] sm:text-[38px] tracking-[-0.03em] text-[#181512] no-underline mb-6"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
        }}
      >
        Ancestor<span className="text-[#C8A557]">ii</span>
      </Link>

      <div className="w-full max-w-[560px]">
        {/* ══════════════════════════════════
            SENT STATE
            ══════════════════════════════════ */}
        {sent ? (
          <div className="border border-[#ECE5D8] bg-white px-7 py-8 sm:px-9 sm:py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center bg-[#F0FDF4] mx-auto mb-4">
              <Check size={24} className="text-[#22C55E]" />
            </div>
            <h2
              className="text-[22px] sm:text-[26px] tracking-[-0.03em] text-[#181512] mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
              }}
            >
              Question sent to{' '}
              <span className="italic text-[#A9782F]">
                {recipientName}
              </span>
            </h2>
            <p className="text-[13px] text-[#8A7F72] mb-6 leading-relaxed">
              Share this link with them so they can answer and join
              your family library.
            </p>

            <div className="flex items-center border border-[#ECE5D8] bg-[#FDFCFA] mb-4">
              <p className="flex-1 px-3.5 py-2.5 text-[13px] text-[#4A4030] truncate">
                {shareUrl}
              </p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold text-[#B8932A] hover:text-[#96751E] border-l border-[#ECE5D8] transition-colors flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check size={14} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#ECE5D8] text-[13px] font-medium text-[#4A4030] hover:border-[#B8932A] transition-colors mb-6"
            >
              <MessageCircle size={16} className="text-[#25D366]" />
              Share via WhatsApp
            </button>

            <button
              onClick={() => router.replace('/dashboard/home')}
              className="w-full py-3 text-[13px] font-semibold tracking-[0.04em] text-[#FFFDF8] transition-all hover:shadow-lg active:scale-[0.98]"
              style={{
                background:
                  'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)',
              }}
            >
              Go to your library
            </button>
          </div>
        ) : (
          <>
            {/* ══════════════════════════════════
                MEMORY PREVIEW
                ══════════════════════════════════ */}
            {memory && (
              <>
                <h2
                  className="text-[22px] sm:text-[26px] tracking-[-0.03em] text-[#181512] leading-[1.05] text-center mb-2"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                  }}
                >
                  Your memory has been{' '}
                  <span className="italic text-[#A9782F]">
                    saved.
                  </span>
                </h2>
                <p className="text-[13px] text-[#8A7F72] text-center mb-6 leading-relaxed">
                  Beautiful. Now let&apos;s bring your family in.
                </p>

                <div className="border border-[#ECE5D8] bg-white mb-8 overflow-hidden">
                  {memory.photo_url && (
                    <div className="relative h-[200px] sm:h-[240px] bg-[#F0EDE8]">
                      <Image
                        src={memory.photo_url}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="px-6 py-5">
                    <p className="text-[11px] font-medium text-[#B8932A] uppercase tracking-[0.1em] mb-1.5">
                      Your first memory
                    </p>
                    <h3
                      className="text-[18px] font-semibold text-[#181512] mb-2"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 600,
                      }}
                    >
                      {memory.title}
                    </h3>
                    <p className="text-[13px] text-[#8A7F72] leading-relaxed line-clamp-3">
                      {memory.body}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* ══════════════════════════════════
                PROMPT SYSTEM
                ══════════════════════════════════ */}
            <div className="border border-[#ECE5D8] bg-white px-7 py-8 sm:px-9 sm:py-10">
              <h3
                className="text-[20px] sm:text-[22px] tracking-[-0.02em] text-[#181512] mb-1"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                }}
              >
                Ask someone a{' '}
                <span className="italic text-[#A9782F]">
                  question.
                </span>
              </h3>
              <p className="text-[13px] text-[#8A7F72] mb-6 leading-relaxed">
                Pick a question and send it to a family member.
                When they answer, their memory appears alongside
                yours.
              </p>

              {/* Chapters */}
              <div className="flex flex-wrap gap-2 mb-5">
                {chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setSelectedChapter(
                        selectedChapter === ch.id ? null : ch.id
                      );
                      setSelectedPrompt(null);
                    }}
                    className={`px-3.5 py-2 text-[12px] font-medium transition-all ${
                      selectedChapter === ch.id
                        ? 'bg-[#B8932A] text-white'
                        : 'border border-[#ECE5D8] text-[#4A4030] hover:border-[#B8932A] hover:text-[#B8932A]'
                    }`}
                  >
                    {ch.name}
                  </button>
                ))}
              </div>

              {/* Questions */}
              {selectedChapter && filteredPrompts.length > 0 && (
                <div className="space-y-1.5 mb-6">
                  {filteredPrompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() =>
                        setSelectedPrompt(
                          selectedPrompt?.id === prompt.id
                            ? null
                            : prompt
                        )
                      }
                      className={`w-full text-left px-4 py-3 text-[13px] transition-all flex items-center justify-between gap-3 ${
                        selectedPrompt?.id === prompt.id
                          ? 'bg-[#FBF7EE] border border-[#B8932A] text-[#181512] font-medium'
                          : 'border border-[#ECE5D8] text-[#4A4030] hover:border-[#B8932A]'
                      }`}
                    >
                      <span className="leading-relaxed">
                        {prompt.question}
                      </span>
                      <ChevronRight
                        size={14}
                        className={`flex-shrink-0 transition-transform ${
                          selectedPrompt?.id === prompt.id
                            ? 'rotate-90 text-[#B8932A]'
                            : 'text-[#C0B9AE]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Recipient form */}
              {selectedPrompt && (
                <div className="border-t border-[#ECE5D8] pt-6 space-y-4">
                  <p className="text-[12px] font-medium text-[#B8932A] uppercase tracking-[0.08em]">
                    Who are you asking?
                  </p>

                  <div className="border border-[#ECE5D8] bg-[#FBF7EE] px-4 py-3">
                    <p className="text-[11px] text-[#8A7F72] uppercase tracking-[0.08em] mb-0.5">
                      Your question
                    </p>
                    <p className="text-[14px] text-[#181512] italic leading-relaxed">
                      &ldquo;{selectedPrompt.question}&rdquo;
                    </p>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">
                      Their name
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) =>
                        setRecipientName(e.target.value)
                      }
                      placeholder="e.g. Nan"
                      className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] placeholder-[#C0B9AE] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A]"
                      style={{ background: '#FDFCFA' }}
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">
                      Their email
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) =>
                        setRecipientEmail(e.target.value)
                      }
                      placeholder="nan@email.com"
                      className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] placeholder-[#C0B9AE] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A]"
                      style={{ background: '#FDFCFA' }}
                    />
                  </div>

                  {error && (
                    <div className="border border-[#E8C4C0] bg-[#FDF6F5] px-4 py-3">
                      <p className="text-[13px] text-[#8B3A32]">
                        {error}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleSend}
                    disabled={
                      !recipientName.trim() ||
                      !recipientEmail.trim() ||
                      sending
                    }
                    className="w-full py-3 text-[13px] font-semibold tracking-[0.04em] text-[#FFFDF8] transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{
                      background:
                        'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)',
                    }}
                  >
                    {sending ? (
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <Send size={14} />
                    )}
                    {sending ? 'Sending…' : 'Send Question'}
                  </button>
                </div>
              )}
            </div>

            {/* Secondary: generic invite link */}
            <button
              onClick={async () => {
                try {
                  const { data: invite } = await supabase
                    .from('family_invites')
                    .select('token')
                    .eq('family_id', familyId)
                    .eq('invited_by', userId)
                    .eq('email', '')
                    .maybeSingle();

                  let token = invite?.token;
                  if (!token) {
                    const { data: newInvite } = await supabase
                      .from('family_invites')
                      .insert({ family_id: familyId, invited_by: userId, email: '', role: 'member' })
                      .select('token')
                      .single();
                    token = newInvite?.token;
                  }

                  if (token) {
                    const link = `${window.location.origin}/join/${token}`;
                    await navigator.clipboard.writeText(link);
                    alert('Invite link copied!');
                  }
                } catch {}
              }}
              className="w-full text-center text-[13px] text-[#8A7F72] hover:text-[#B8932A] transition-colors mt-5 py-2"
            >
              Or just copy an invite link
            </button>

            {/* Skip */}
            <button
              onClick={() => router.replace('/dashboard/home')}
              className="w-full text-center text-[11px] text-[#B5AFA6] hover:text-[#8A7F72] transition-colors mt-2 py-2"
            >
              I&apos;ll do this later
            </button>
          </>
        )}
      </div>
    </div>
  );
}