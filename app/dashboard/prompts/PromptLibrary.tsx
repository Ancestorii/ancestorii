'use client';

import { useState, useRef, useEffect } from 'react';
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
  baby: <Baby size={20} strokeWidth={1.5} />,
  gift: <Gift size={20} strokeWidth={1.5} />,
  utensils: <UtensilsCrossed size={20} strokeWidth={1.5} />,
  heart: <Heart size={20} strokeWidth={1.5} />,
  lightbulb: <Lightbulb size={20} strokeWidth={1.5} />,
  repeat: <Repeat size={20} strokeWidth={1.5} />,
  briefcase: <Briefcase size={20} strokeWidth={1.5} />,
  'map-pin': <MapPin size={20} strokeWidth={1.5} />,
  fingerprint: <Fingerprint size={20} strokeWidth={1.5} />,
  music: <Music size={20} strokeWidth={1.5} />,
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

  const [recipientMode, setRecipientMode] = useState<'new' | 'existing'>('new');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const shareSectionRef = useRef<HTMLDivElement>(null);
  const questionsSectionRef = useRef<HTMLDivElement>(null);

  const filteredPrompts = prompts.filter((p) => p.chapter_id === selectedChapter);

  const canSend =
    selectedPrompt &&
   ((recipientMode === 'new' && recipientName.trim()) ||
      (recipientMode === 'existing' && selectedMember));

  const handleSend = async () => {
    if (!canSend || sending) return;
    setSending(true);
    setError('');
    try {
      const name = recipientMode === 'existing' ? selectedMember!.name : recipientName.trim();
      const email = recipientMode === 'existing' ? selectedMember!.email : '';
      const isExistingMember = recipientMode === 'existing';
      // Prompt invites must live as long as the prompt link itself (30 days), otherwise an
      // invite expiring at the 7-day default would silently drop late answerers into a new
      // solo family instead of joining the sender's. Write the SAME value to both rows.
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      let inviteId: string | null = null;
      if (!isExistingMember) {
        const { data: invite, error: inviteError } = await supabase.from('family_invites').insert({ family_id: familyId, email, invited_by: userId, role: 'member', expires_at: expiresAt }).select('id, token').single();
        if (inviteError) throw inviteError;
        inviteId = invite.id;
      }
      const { data: sentPrompt, error: promptError } = await supabase.from('sent_prompts').insert({ family_id: familyId, sender_id: userId, recipient_name: name, recipient_email: email, prompt_id: selectedPrompt!.id, invite_id: inviteId, expires_at: expiresAt }).select('id, token').single();
      if (promptError) throw promptError;
      if (isExistingMember && selectedMember) {
       try { await supabase.from('notifications').insert({ user_id: selectedMember.id, type: 'prompt_received', actor_id: userId, target_id: sentPrompt.id, target_type: 'sent_prompt' }); } catch {}
      }
      setShareUrl(`${window.location.origin}/answer/${sentPrompt.token}`);
      setSent(true);
    } catch (err: any) { setError(err?.message || 'Something went wrong.'); setSending(false); }
  };

  const handleCopy = async () => { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleWhatsApp = () => {
    const name = recipientMode === 'existing' ? selectedMember?.name : recipientName.trim();
    const text = `${name}, I'd love to hear your memory.\n\n"${selectedPrompt?.question}"\n\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleReset = () => { setSent(false); setShareUrl(''); setSelectedPrompt(null); setSelectedChapter(null); setRecipientName(''); setRecipientEmail(''); setSelectedMember(null); setRecipientMode('new'); setError(''); };

  const activeChapter = chapters.find((c) => c.id === selectedChapter);
  useEffect(() => {
    if (selectedPrompt && shareSectionRef.current) {
      setTimeout(() => shareSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  }, [selectedPrompt]);

  useEffect(() => {
    if (selectedChapter && questionsSectionRef.current) {
      setTimeout(() => questionsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [selectedChapter]);

  return (
    <div className="min-h-screen bg-[#FCFAF7]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ═══ DARK HEADER ═══ */}
      <div className="bg-[#1A1612]">
        <div className="px-4 sm:px-6 lg:px-10 xl:px-14 py-8 sm:py-10 lg:py-12">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-[#2E2820] flex items-center justify-center flex-shrink-0">
              <MessageSquarePlus className="h-5 w-5 text-[#C8A557]" strokeWidth={1.6} />
            </div>
            <div>
              <h1 className="text-[26px] sm:text-[32px] lg:text-[36px] font-semibold text-white leading-[1.1]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                Ask your family a <span className="italic text-[#C8A557]">question</span>
              </h1>
              <p className="mt-2 text-[14px] sm:text-[15px] text-[#9C9488] leading-relaxed max-w-[600px]">
                Pick a question, send it to someone you love. When they answer, their memory appears in {familyName}.
              </p>
            </div>
          </div>
        </div>
        <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #C8A557, rgba(200,165,87,0.2))' }} />
      </div>

      {/* ═══ SENT STATE ═══ */}
      {sent ? (
        <div className="px-4 sm:px-6 lg:px-10 xl:px-14 py-10 sm:py-14">
          <div className="mx-auto max-w-[520px] border border-[#ECE5D8] bg-white px-7 py-8 sm:px-9 sm:py-10 text-center">
            <h2 className="text-[22px] text-[#181512] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              Your link is <span className="italic text-[#A9782F]">ready</span>
            </h2>
            <p className="text-[13px] text-[#8A7F72] mb-6 leading-relaxed">
              Share it with them so they can answer.
            </p>
            <div className="flex items-center border border-[#ECE5D8] bg-[#FDFCFA] mb-4">
              <p className="flex-1 px-3.5 py-2.5 text-[13px] text-[#4A4030] truncate">{shareUrl}</p>
              <button onClick={handleCopy} className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold text-[#B8932A] hover:text-[#96751E] border-l border-[#ECE5D8] transition-colors flex-shrink-0">
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
            <button onClick={async () => { if (navigator.share) { try { const name = recipientMode === 'existing' ? selectedMember?.name : recipientName.trim(); await navigator.share({ title: 'Ancestorii', text: `${name ? name + ', I' : 'I'}'d love to hear your memory.\n\n"${selectedPrompt?.question}"`, url: shareUrl }); } catch {} } else { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } }} className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#ECE5D8] text-[13px] font-medium text-[#4A4030] hover:border-[#B8932A] transition-colors mb-6">
              <Send size={16} className="text-[#B8932A]" />
              Share link
            </button>
            <div className="flex gap-3">
              <button onClick={handleReset} className="flex-1 py-3 text-[13px] font-semibold text-[#4A4030] border border-[#ECE5D8] transition-all hover:bg-[#FAF5EB]">Send another question</button>
              <button onClick={() => router.push('/dashboard/home')} className="flex-1 py-3 text-[13px] font-semibold text-[#FFFDF8] transition-all hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)' }}>Back to feed</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ═══ CHAPTERS GRID ═══ */}
          <div className="px-4 sm:px-6 lg:px-10 xl:px-14 py-8 sm:py-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B8932A] mb-5">Choose a topic</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {chapters.map((ch) => {
                const isActive = selectedChapter === ch.id;
                const icon = ch.icon ? ICON_MAP[ch.icon] : null;
                return (
                  <button
                    key={ch.id}
                    onClick={() => { setSelectedChapter(isActive ? null : ch.id); setSelectedPrompt(null); }}
                    className={`flex flex-col items-start px-5 py-5 sm:py-6 text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-[#1A1612] text-white shadow-lg'
                        : 'bg-white border border-[#EDE8DF] hover:border-[#C8A557] hover:shadow-[0_4px_16px_rgba(44,36,27,0.06)]'
                    }`}
                  >
                    <div className={`h-10 w-10 flex items-center justify-center mb-3 ${isActive ? 'bg-[#2E2820] text-[#C8A557]' : 'bg-[#F5EDD8] text-[#A9782F]'}`}>
                      {icon || <MessageSquarePlus size={20} strokeWidth={1.5} />}
                    </div>
                    <p className={`text-[14px] font-semibold leading-tight ${isActive ? 'text-white' : 'text-[#1A1612]'}`}>{ch.name}</p>
                    {ch.description && (
                      <p className={`text-[12px] mt-1 leading-snug line-clamp-2 ${isActive ? 'text-white/60' : 'text-[#9B8E7D]'}`}>{ch.description}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══ QUESTIONS ═══ */}
          {selectedChapter && filteredPrompts.length > 0 && (
          <div ref={questionsSectionRef} className="px-4 sm:px-6 lg:px-10 xl:px-14 pb-24 sm:pb-8">
              <div className="mx-auto max-w-[800px]">
                <div className="bg-[#1A1612]">
                  <div className="px-6 py-4 flex items-center gap-3">
                    {activeChapter?.icon && ICON_MAP[activeChapter.icon] && (
                      <div className="text-[#C8A557]">{ICON_MAP[activeChapter.icon]}</div>
                    )}
                    <p className="text-[13px] font-bold text-white tracking-[0.02em]">
                      {activeChapter?.name} <span className="font-normal text-[#9C9488]">— pick a question</span>
                    </p>
                  </div>
                </div>
                <div className="bg-white border border-t-0 border-[#EDE8DF]">
                  <div className="divide-y divide-[#F0EBE3]">
                    {filteredPrompts.map((prompt) => {
                      const isActive = selectedPrompt?.id === prompt.id;
                      return (
                        <button
                          key={prompt.id}
                          onClick={() => setSelectedPrompt(isActive ? null : prompt)}
                          className={`w-full text-left px-6 py-4 sm:py-5 text-[14px] sm:text-[15px] transition-all flex items-center justify-between gap-4 ${
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
              </div>
            </div>
          )}

          {/* ═══ RECIPIENT FORM ═══ */}
          {selectedPrompt && (
            <div ref={shareSectionRef} className="px-4 sm:px-6 lg:px-10 xl:px-14 pb-12">
              <div className="mx-auto max-w-[600px] border border-[#ECE5D8] bg-white">
                {/* Dark accent bar */}
                <div className="bg-[#1A1612] px-6 py-4">
                  <p className="text-[13px] font-bold text-white tracking-[0.02em]">Send this question</p>
                </div>

                <div className="px-6 py-6 sm:px-8 sm:py-8">
                  {/* Selected question preview */}
                  <div className="px-4 py-3 bg-[#FBF7EE] border border-[#EAD8B8] mb-6">
                    <p className="text-[11px] text-[#8A7F72] uppercase tracking-[0.08em] mb-0.5">Your question</p>
                    <p className="text-[14px] text-[#181512] italic leading-relaxed">&ldquo;{selectedPrompt.question}&rdquo;</p>
                  </div>

                  <p className="text-[12px] font-medium text-[#B8932A] uppercase tracking-[0.08em] mb-4">Who are you asking?</p>

                  {familyMembers.length > 0 && (
                    <div className="flex gap-2 mb-5">
                      <button
                        onClick={() => { setRecipientMode('new'); setSelectedMember(null); }}
                        className={`flex-1 py-2.5 text-[12px] font-medium transition-all ${
                          recipientMode === 'new' ? 'bg-[#1A1612] text-white' : 'border border-[#ECE5D8] text-[#4A4030] hover:border-[#B8932A]'
                        }`}
                      >
                        Someone new
                      </button>
                      <button
                        onClick={() => { setRecipientMode('existing'); setRecipientName(''); setRecipientEmail(''); }}
                        className={`flex-1 py-2.5 text-[12px] font-medium transition-all ${
                          recipientMode === 'existing' ? 'bg-[#1A1612] text-white' : 'border border-[#ECE5D8] text-[#4A4030] hover:border-[#B8932A]'
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
                            selectedMember?.id === member.id ? 'bg-[#FBF7EE] border border-[#B8932A]' : 'border border-[#ECE5D8] hover:border-[#B8932A]'
                          }`}
                        >
                          <div className="h-8 w-8 rounded-full bg-[#F5EDD8] flex items-center justify-center flex-shrink-0">
                            <Users size={14} className="text-[#A9782F]" strokeWidth={1.6} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-medium text-[#1A1612] truncate">{member.name}</p>
                            <p className="text-[12px] text-[#9B8E7D] truncate">{member.email}</p>
                          </div>
                          {selectedMember?.id === member.id && <Check size={16} className="text-[#B8932A] flex-shrink-0 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 mb-5">
                      <div>
                        <label className="block text-[12px] font-medium text-[#4A4030] mb-1.5 tracking-[0.02em]">Their name</label>
                        <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="e.g. Nan" className="w-full border border-[#E0D6C8] px-3.5 py-2.5 text-[14px] text-[#181512] placeholder-[#C0B9AE] focus:outline-none focus:border-[#B8932A] focus:ring-1 focus:ring-[#B8932A]" style={{ background: '#FDFCFA' }} />
                      </div>
                      
                    </div>
                  )}

                  {error && (
                    <div className="border border-[#E8C4C0] bg-[#FDF6F5] px-4 py-3 mb-5">
                      <p className="text-[13px] text-[#8B3A32]">{error}</p>
                    </div>
                  )}

                  <button onClick={handleSend} disabled={!canSend || sending} className="w-full py-3 text-[13px] font-semibold tracking-[0.04em] text-[#FFFDF8] transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #B8932A 0%, #C8A557 100%)' }}>
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {sending ? 'Generating…' : 'Get share link'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}