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
  Share2,
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
      sending
    )
      return;
    setSending(true);
    setError('');

    try {
      // Prompt invites must live as long as the prompt link itself (30 days), otherwise an
      // invite expiring at the 7-day default would silently drop late answerers into a new
      // solo family instead of joining the sender's. Write the SAME value to both rows.
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: invite, error: inviteError } = await supabase
        .from('family_invites')
        .insert({
          family_id: familyId,
          email: '',
          invited_by: userId,
          role: 'member',
          expires_at: expiresAt,
        })
        .select('id, token')
        .single();

      if (inviteError) throw inviteError;

      const { data: sentPrompt, error: promptError } = await supabase
        .from('sent_prompts')
        .insert({
          family_id: familyId,
          sender_id: userId,
          recipient_name: recipientName.trim(),
          recipient_email: '',
          prompt_id: selectedPrompt.id,
          invite_id: invite.id,
          expires_at: expiresAt,
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

  const handleShare = async () => {
    const text = `${recipientName.trim()}, I just wrote a memory on Ancestorii and I'd love to hear yours.\n\n"${selectedPrompt?.question}"`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ancestorii',
          text,
          url: shareUrl,
        });
      } catch {
        // User cancelled share — that's fine
      }
    } else {
      // Desktop fallback — copy to clipboard
      await navigator.clipboard.writeText(`${text}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#B8932A]" size={24} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-white px-5 sm:px-8 pt-8 sm:pt-12 pb-12"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Link
        href="/"
        className="inline-block text-[30px] sm:text-[34px] tracking-[-0.03em] text-[#181512] no-underline mb-6"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 700,
        }}
      >
        Ancestor<span className="text-[#C8A557]">ii</span>
      </Link>

      <div className="w-full max-w-[560px]">
        {/* ═══════════════════════════════
            SENT STATE
            ═══════════════════════════════ */}
        {sent ? (
          <div className="border border-[#E8E2D6] bg-white px-7 py-8 sm:px-9 sm:py-10 text-center">
            <h2
              className="text-[24px] sm:text-[28px] tracking-[-0.03em] text-[#181512] mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
              }}
            >
              Share this with{' '}
              <span className="italic text-[#A9782F]">
                {recipientName}
              </span>
            </h2>
            <p className="text-[13px] text-[#8A7F72] mb-6 leading-relaxed">
              Send them this link — when they answer, their memory
              will appear alongside yours.
            </p>

            <div className="flex items-center border border-[#ECE5D8] bg-[#FAFAF7] mb-4">
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
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#ECE5D8] text-[13px] font-medium text-[#4A4030] hover:border-[#B8932A] transition-colors mb-6"
            >
              <Share2 size={15} className="text-[#B8932A]" />
              Share link
            </button>

            <button
              onClick={() => router.replace('/dashboard/home')}
              className="w-full py-3.5 text-[13px] font-bold tracking-[0.06em] uppercase text-white transition-all hover:shadow-lg active:scale-[0.98]"
              style={{
                background: 'linear-gradient(180deg, #C8A557 0%, #A88530 100%)',
                boxShadow: '0 2px 8px rgba(184, 147, 42, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              Go to your library
            </button>
          </div>
        ) : (
          <>
            {/* ═══════════════════════════════
                THE MEMORY — HERO
                This is the emotional centre.
                Big photo, their words, space
                to breathe. No ticks, no badges.
                ═══════════════════════════════ */}
            {memory && (
              <div className="border border-[#E8E2D6] bg-white overflow-hidden mb-0">
                {memory.photo_url && (
                  <div className="relative w-full aspect-[16/10] bg-[#F5F0E5]">
                    <Image
                      src={memory.photo_url}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="px-7 py-7 sm:px-9 sm:py-8">
                  <h2
                    className="text-[22px] sm:text-[26px] tracking-[-0.03em] text-[#181512] leading-[1.15] mb-3"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 600,
                    }}
                  >
                    {memory.title}
                  </h2>
                  <p className="text-[14px] text-[#6F6255] leading-[1.7]">
                    {memory.body}
                  </p>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════
                EMOTIONAL BRIDGE
                Not a separate box — a continuation.
                The memory card's bottom border
                merges into this section visually.
                ═══════════════════════════════ */}
            <div className="border border-t-0 border-[#E8E2D6] bg-white px-7 py-7 sm:px-9 sm:py-8">

              {/* Gold divider — thin, warm */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-[1px] bg-[#E8E2D6]" />
                <div className="h-[5px] w-[5px] bg-[#D4AF37]/50 rotate-45" />
                <div className="flex-1 h-[1px] bg-[#E8E2D6]" />
              </div>

              <p
                className="text-[20px] sm:text-[22px] tracking-[-0.02em] text-[#181512] leading-[1.2] mb-2"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                }}
              >
                Imagine if someone in your family{' '}
                <span className="italic text-[#A9782F]">shared theirs.</span>
              </p>
              <p className="text-[13px] text-[#8A7F72] mb-6 leading-relaxed">
                Pick a question and send it to someone you love.
                When they answer, their memory appears alongside yours.
              </p>

              {/* Chapter pills */}
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
                        ? 'bg-[#181512] text-white'
                        : 'border border-[#E2DCD2] text-[#4A4030] hover:border-[#B8932A] hover:text-[#B8932A]'
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
                  <div className="border border-[#ECE5D8] bg-[#FBF7EE] px-4 py-3">
                    <p className="text-[11px] text-[#8A7F72] uppercase tracking-[0.08em] mb-0.5">
                      Your question
                    </p>
                    <p className="text-[14px] text-[#181512] italic leading-relaxed">
                      &ldquo;{selectedPrompt.question}&rdquo;
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#4A4030] mb-1.5 tracking-[0.04em] uppercase">
                      Their name
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) =>
                        setRecipientName(e.target.value)
                      }
                      placeholder="e.g. Nan"
                      className="w-full border border-[#E2DCD2] bg-[#FAFAF7] px-4 py-3 text-[14px] text-[#181512] placeholder-[#C5BEB2] focus:outline-none focus:border-[#B8932A] focus:ring-2 focus:ring-[#B8932A]/12 focus:bg-white transition-all"
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
                      sending
                    }
                    className="w-full py-3.5 text-[13px] font-bold tracking-[0.06em] uppercase text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(180deg, #C8A557 0%, #A88530 100%)',
                      boxShadow:
                        recipientName.trim() && !sending
                          ? '0 2px 8px rgba(184, 147, 42, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)'
                          : 'none',
                    }}
                  >
                    {sending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    {sending ? 'Creating…' : 'Get Shareable Link'}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => router.replace('/dashboard/home')}
              className="w-full text-center text-[11px] text-[#B5AFA6] hover:text-[#8A7F72] transition-colors mt-5 py-2"
            >
              I&apos;ll do this later
            </button>
          </>
        )}
      </div>
    </div>
  );
}