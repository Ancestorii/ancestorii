'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Copy,
  ChevronRight,
  Loader2,
  Send,
  MessageCircle,
  MessageSquarePlus,
  Users,
  Baby,
  Gift,
  UtensilsCrossed,
  Heart,
  Lightbulb,
  Repeat,
  Briefcase,
  MapPin,
  Fingerprint,
  Music,
  X,
} from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';

type Chapter = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
};

type Prompt = {
  id: string;
  chapter_id: string;
  question: string;
  display_order: number;
};

type FamilyMember = {
  id: string;
  name: string;
  email: string;
};

const ICON_MAP: Record<string, React.ReactNode> = {
  baby: <Baby size={18} strokeWidth={1.6} />,
  gift: <Gift size={18} strokeWidth={1.6} />,
  utensils: <UtensilsCrossed size={18} strokeWidth={1.6} />,
  heart: <Heart size={18} strokeWidth={1.6} />,
  lightbulb: <Lightbulb size={18} strokeWidth={1.6} />,
  repeat: <Repeat size={18} strokeWidth={1.6} />,
  briefcase: <Briefcase size={18} strokeWidth={1.6} />,
  'map-pin': <MapPin size={18} strokeWidth={1.6} />,
  fingerprint: <Fingerprint size={18} strokeWidth={1.6} />,
  music: <Music size={18} strokeWidth={1.6} />,
};

export default function PromptLibrary({
  chapters,
  prompts,
  familyId,
  familyName,
  userId,
  familyMembers,
}: {
  chapters: Chapter[];
  prompts: Prompt[];
  familyId: string;
  familyName: string;
  userId: string;
  familyMembers: FamilyMember[];
}) {
  const supabase = getBrowserClient();
  const router = useRouter();

  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  // Recipient state
  const [recipientMode, setRecipientMode] = useState<'new' | 'existing'>('new');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Send state
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const filteredPrompts = prompts.filter((p) => p.chapter_id === selectedChapter);

  const canSend =
    selectedPrompt &&
    ((recipientMode === 'new' && recipientName.trim() && recipientEmail.trim()) ||
      (recipientMode === 'existing' && selectedMember));

  const handleSend = async () => {
    if (!canSend || sending) return;
    setSending(true);
    setError('');

    try {
      const name = recipientMode === 'existing' ? selectedMember!.name : recipientName.trim();
      const email = recipientMode === 'existing' ? selectedMember!.email : recipientEmail.trim().toLowerCase();
      const isExistingMember = recipientMode === 'existing';

      let inviteId: string | null = null;

      // Only create invite if recipient is not already a family member
      if (!isExistingMember) {
        const { data: invite, error: inviteError } = await supabase
          .from('family_invites')
          .insert({
            family_id: familyId,
            email,
            invited_by: userId,
            role: 'member',
          })
          .select('id, token')
          .single();

        if (inviteError) throw inviteError;
        inviteId = invite.id;
      }

      // Create sent prompt
      const { data: sentPrompt, error: promptError } = await supabase
        .from('sent_prompts')
        .insert({
          family_id: familyId,
          sender_id: userId,
          recipient_name: name,
          recipient_email: email,
          prompt_id: selectedPrompt!.id,
          invite_id: inviteId,
        })
        .select('token')
        .single();

      if (promptError) throw promptError;

      // Notify existing family member they received a question
      if (isExistingMember && selectedMember) {
        try {
          await supabase.from('notifications').insert({
            user_id: selectedMember.id,
            type: 'prompt_received',
            actor_id: userId,
            target_id: sentPrompt.token,
            target_type: 'sent_prompt',
          });
        } catch {}
      }

      setShareUrl(`${window.location.origin}/answer/${sentPrompt.token}`);
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
    const name = recipientMode === 'existing' ? selectedMember?.name : recipientName.trim();
    const text = `${name}, I'd love to hear your memory.\n\n"${selectedPrompt?.question}"\n\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleReset = () => {
    setSent(false);
    setShareUrl('');
    setSelectedPrompt(null);
    setSelectedChapter(null);
    setRecipientName('');
    setRecipientEmail('');
    setSelectedMember(null);
    setRecipientMode('new');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#FCFAF7]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="px-4 sm:px-6 py-8 sm:py-10">
        <div className="mx-auto max-w-[700px]">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-[#F5EDD8] flex items-center justify-center">
                <MessageSquarePlus className="h-5 w-5 text-[#A9782F]" strokeWidth={1.6} />
              </div>
              <div>
                <h1 className="text-[24px] sm:text-[28px] font-semibold text-[#1A1612] leading-[1.1]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
                  Ask your family a <span className="italic text-[#A9782F]">question</span>
                </h1>
              </div>
            </div>
            <p className="text-[14px] text-[#6F6255] leading-relaxed max-w-[520px]">
              Pick a question, send it to someone you love. When they answer, their memory appears in {familyName}.
            </p>
          </div>

          {/* ── SENT STATE ── */}
          {sent ? (
            <div className="border border-[#ECE5D8] bg-white px-7 py-8 sm:px-9 sm:py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center bg-[#F0FDF4] mx-auto mb-4">
                <Check size={24} className="text-[#22C55E]" />
              </div>
              <h2 className="text-[22px] text-[#181512] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
                Question sent!
              </h2>
              <p className="text-[13px] text-[#8A7F72] mb-6 leading-relaxed">
                Share the link with them so they can answer.
              </p>

              <div className="flex items-center border border-[#ECE5D8] bg-[#FDFCFA] mb-4">
                <p className="flex-1 px-3.5 py-2.5 text-[13px] text-[#4A4030] truncate">{shareUrl}</p>
                <button onClick={handleCopy} className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold text-[#B8932A] hover:text-[#96751E] border-l border-[#ECE5D8] transition-colors flex-shrink-0">
                  {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>

              <button onClick={handleWhatsApp} className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#ECE5D8] text-[13px] font-medium text-[#4A4030] hover:border-[#B8932A] transition-colors mb-6">
                <MessageCircle size={16} className="text-[#25D366]" />
                Share via WhatsApp
              </button>

              <div className="flex gap-3">
                <button onClick={handleReset} className="flex-1 py-3 text-[13px] font-semibold text-[#4A4030] border border-[#ECE5D8] transition-all hover:bg-[#FAF5EB]">
                  Send another question
                </button>
                <button onClick={() => router.push('/dashboard/home')} className="flex-1 py-3 text-[13px] font-semibold text-[#FFFDF8] transition-all hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)' }}>
                  Back to feed
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ── CHAPTERS ── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {chapters.map((ch) => {
                  const isActive = selectedChapter === ch.id;
                  const icon = ch.icon ? ICON_MAP[ch.icon] : null;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setSelectedChapter(isActive ? null : ch.id);
                        setSelectedPrompt(null);
                      }}
                      className={`flex items-center gap-3 px-4 py-3.5 text-left transition-all ${
                        isActive
                          ? 'bg-[#B8932A] text-white border border-[#B8932A]'
                          : 'bg-white border border-[#EAD8B8] text-[#4A4030] hover:border-[#B8932A]'
                      }`}
                    >
                      {icon && (
                        <div className={`flex-shrink-0 ${isActive ? 'text-white/90' : 'text-[#A9782F]'}`}>
                          {icon}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className={`text-[13px] font-semibold leading-tight ${isActive ? 'text-white' : 'text-[#1A1612]'}`}>{ch.name}</p>
                        {ch.description && (
                          <p className={`text-[11px] mt-0.5 leading-snug truncate ${isActive ? 'text-white/70' : 'text-[#9B8E7D]'}`}>{ch.description}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ── QUESTIONS ── */}
              {selectedChapter && filteredPrompts.length > 0 && (
                <div className="border border-[#ECE5D8] bg-white mb-6">
                  <div className="px-5 py-3 border-b border-[#ECE5D8]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#B8932A]">
                      {chapters.find((c) => c.id === selectedChapter)?.name} — pick a question
                    </p>
                  </div>
                  <div className="divide-y divide-[#F0EBE3]">
                    {filteredPrompts.map((prompt) => {
                      const isActive = selectedPrompt?.id === prompt.id;
                      return (
                        <button
                          key={prompt.id}
                          onClick={() => setSelectedPrompt(isActive ? null : prompt)}
                          className={`w-full text-left px-5 py-4 text-[14px] transition-all flex items-center justify-between gap-3 ${
                            isActive
                              ? 'bg-[#FBF7EE] text-[#181512] font-medium'
                              : 'text-[#4A4030] hover:bg-[#FDFCFA]'
                          }`}
                        >
                          <span className="leading-relaxed">{prompt.question}</span>
                          <ChevronRight size={14} className={`flex-shrink-0 transition-transform ${isActive ? 'rotate-90 text-[#B8932A]' : 'text-[#C0B9AE]'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── RECIPIENT FORM ── */}
              {selectedPrompt && (
                <div className="border border-[#ECE5D8] bg-white px-6 py-6 sm:px-8 sm:py-8">
                  {/* Selected question preview */}
                  <div className="px-4 py-3 bg-[#FBF7EE] border border-[#EAD8B8] mb-6">
                    <p className="text-[11px] text-[#8A7F72] uppercase tracking-[0.08em] mb-0.5">Your question</p>
                    <p className="text-[14px] text-[#181512] italic leading-relaxed">&ldquo;{selectedPrompt.question}&rdquo;</p>
                  </div>

                  <p className="text-[12px] font-medium text-[#B8932A] uppercase tracking-[0.08em] mb-4">Who are you asking?</p>

                  {/* Toggle: existing member vs new person */}
                  {familyMembers.length > 0 && (
                    <div className="flex gap-2 mb-5">
                      <button
                        onClick={() => { setRecipientMode('new'); setSelectedMember(null); }}
                        className={`flex-1 py-2.5 text-[12px] font-medium transition-all ${
                          recipientMode === 'new'
                            ? 'bg-[#B8932A] text-white'
                            : 'border border-[#ECE5D8] text-[#4A4030] hover:border-[#B8932A]'
                        }`}
                      >
                        Someone new
                      </button>
                      <button
                        onClick={() => { setRecipientMode('existing'); setRecipientName(''); setRecipientEmail(''); }}
                        className={`flex-1 py-2.5 text-[12px] font-medium transition-all ${
                          recipientMode === 'existing'
                            ? 'bg-[#B8932A] text-white'
                            : 'border border-[#ECE5D8] text-[#4A4030] hover:border-[#B8932A]'
                        }`}
                      >
                        Existing member
                      </button>
                    </div>
                  )}

                  {recipientMode === 'existing' && familyMembers.length > 0 ? (
                    <div className="space-y-2 mb-5">
                      {familyMembers.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                            selectedMember?.id === member.id
                              ? 'bg-[#FBF7EE] border border-[#B8932A]'
                              : 'border border-[#ECE5D8] hover:border-[#B8932A]'
                          }`}
                        >
                          <div className="h-8 w-8 rounded-full bg-[#F5EDD8] flex items-center justify-center flex-shrink-0">
                            <Users size={14} className="text-[#A9782F]" strokeWidth={1.6} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-medium text-[#1A1612] truncate">{member.name}</p>
                            <p className="text-[12px] text-[#9B8E7D] truncate">{member.email}</p>
                          </div>
                          {selectedMember?.id === member.id && (
                            <Check size={16} className="text-[#B8932A] flex-shrink-0 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 mb-5">
                      <div>
                        <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">Their name</label>
                        <input
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="e.g. Nan"
                          className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] placeholder-[#C0B9AE] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A]"
                          style={{ background: '#FDFCFA' }}
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">Their email</label>
                        <input
                          type="email"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="nan@email.com"
                          className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] placeholder-[#C0B9AE] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A]"
                          style={{ background: '#FDFCFA' }}
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="border border-[#E8C4C0] bg-[#FDF6F5] px-4 py-3 mb-5">
                      <p className="text-[13px] text-[#8B3A32]">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleSend}
                    disabled={!canSend || sending}
                    className="w-full py-3 text-[13px] font-semibold tracking-[0.04em] text-[#FFFDF8] transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)' }}
                  >
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {sending ? 'Sending…' : 'Send Question'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}