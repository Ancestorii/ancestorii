// ActionHub.tsx — updated with Share Link as primary, Email as secondary

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  Users,
  Send,
  Check,
  CloudUpload,
  Mail,
  X,
  Eye,
  Pencil,
  Trash2,
  Share2,
  Link2,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { ensureDisplayableImage } from '@/lib/convertImage';

export default function ActionHub({
  homeImages: initialImages,
  email,
}: {
  homeImages: (string | null)[];
  email: string | null;
}) {
  const supabase = getBrowserClient();
  const router = useRouter();

  const [homeImages, setHomeImages] = useState(initialImages);
  const [activeMemory, setActiveMemory] = useState(0);
  const [showDesktopToast, setShowDesktopToast] = useState(false);

  // ── Email invite state ──
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEmailSection, setShowEmailSection] = useState(false);

  // ── Share link state ──
  const [shareLink, setShareLink] = useState('');
  const [shareLinkLoading, setShareLinkLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');

  const placeholders = [
    'A moment that changed everything. Add a memory that still means something.',
    'Someone who shaped your world. Keep their story close.',
    'A place or day that deserves to be remembered.',
    'A memory that still makes you smile.',
    'One moment you never want to lose.',
  ];

  useEffect(() => {
    homeImages.forEach((src) => {
      if (!src) return;
      const img = new window.Image();
      img.src = src;
    });
  }, [homeImages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;
    const key = 'desktop_recommend_last_seen';
    const lastSeen = localStorage.getItem(key);
    const now = Date.now();
    if (!lastSeen || now - Number(lastSeen) > 24 * 60 * 60 * 1000) {
      setShowDesktopToast(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const trackSignup = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;
      const created = new Date(user.created_at).getTime();
      const lastSignIn = new Date(user.last_sign_in_at || '').getTime();
      if (Math.abs(lastSignIn - created) >= 10000) return;
      if (sessionStorage.getItem('signup_tracked')) return;
      if ((window as any).fbq) (window as any).fbq('track', 'CompleteRegistration', { em: email });
      if ((window as any).rdt) (window as any).rdt('track', 'CompleteRegistration');
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({ event: 'signup_complete' });
      sessionStorage.setItem('signup_tracked', '1');
    };
    trackSignup();
  }, [email, supabase]);

  const nextMemory = () => setActiveMemory((p) => (p + 1) % 5);
  const prevMemory = () => setActiveMemory((p) => (p - 1 + 5) % 5);

  const uploadHomeImage = async (rawFile: File, index: number) => {
    const file = await ensureDisplayableImage(rawFile);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) return;
    const ext = file.name.split('.').pop();
    const path = `${uid}/home-${index}-${Date.now()}.${ext}`;
    await supabase.storage.from('user-media').upload(path, file, { upsert: true });
    await supabase.from('Profiles').update({ [`home_image_${index}`]: path }).eq('id', uid);
    const { data } = await supabase.storage.from('user-media').createSignedUrl(path, 60 * 60 * 24 * 7);
    setHomeImages((prev) => {
      const copy = [...prev];
      copy[index] = data?.signedUrl ?? null;
      return copy;
    });
  };

  // ── Share link logic ──
  const fetchShareLink = async (regenerate = false) => {
    setShareLinkLoading(true);
    setShareError('');
    try {
      const res = await fetch('/api/family-invite-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regenerate ? { regenerate: true } : {}),
      });
      const data = await res.json();
      if (!res.ok) {
        setShareError(data.error || 'Failed to create invite link');
        return null;
      }
      setShareLink(data.url);
      return data.url;
    } catch {
      setShareError('Something went wrong');
      return null;
    } finally {
      setShareLinkLoading(false);
    }
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const confirmAndShare = async () => {
    setShowShareModal(false);

    // Fetch link if we don't already have one
    const url = shareLink || (await fetchShareLink());
    if (!url) return;

    const shareMessage =
      "I'm building our family's memory library on Ancestorii — come add your photos and stories.";

    // Mobile: native share sheet (WhatsApp, iMessage, Messenger, etc.)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Join our Family Library on Ancestorii',
          text: shareMessage,
          url,
        });
        return;
      } catch (err: any) {
        // User cancelled share sheet — that's fine
        if (err?.name === 'AbortError') return;
      }
    }

    // Desktop fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareMessage}\n\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setShareError('Failed to copy link');
    }
  };

  const copyLinkOnly = async () => {
    const url = shareLink || (await fetchShareLink());
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setShareError('Failed to copy link');
    }
  };

  const regenerateLink = async () => {
    await fetchShareLink(true);
  };

  // ── Email invite logic ──
  const sendInvite = async () => {
    if (!inviteEmail.trim() || inviteLoading) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())) {
      setInviteError('Please enter a valid email address.');
      return;
    }
    setInviteLoading(true);
    setInviteError('');
    setInviteSuccess('');
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error || 'Failed to send invite');
      } else {
        setInviteSuccess(`Invite sent to ${inviteEmail.trim()}`);
        setInviteEmail('');
        setTimeout(() => setInviteSuccess(''), 5000);
      }
    } catch {
      setInviteError('Something went wrong');
    } finally {
      setInviteLoading(false);
    }
  };

  const dismissDesktopToast = () => {
    localStorage.setItem('desktop_recommend_last_seen', String(Date.now()));
    setShowDesktopToast(false);
  };

  return (
    <section className="w-full bg-[#FCFAF7] px-4 sm:px-6 py-10">
      {showDesktopToast && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 sm:hidden" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-[360px] rounded-2xl bg-white p-7 text-center shadow-xl mb-3">
            <p className="text-[15px] font-semibold text-[#17120E] leading-snug">Your memories deserve a bigger canvas.</p>
            <p className="text-[13px] text-[#6F6255] mt-1.5 leading-snug">Switch to a laptop or tablet for the full experience.</p>
            <button onClick={dismissDesktopToast} className="mt-4 text-[13px] font-bold text-[#A9782F] bg-transparent border-none cursor-pointer">
              I&apos;ll explore for now
            </button>
          </div>
        </div>
      )}

      {/* ── Email Invite Confirmation Modal ── */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(22,18,12,0.45)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-[20px] bg-white shadow-[0_24px_60px_rgba(22,18,12,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-[18px] font-bold text-[#17120E]">Before you invite</h3>
                  <p className="text-[13px] text-[#7D6F5F] mt-0.5">
                    Sending to <span className="font-semibold text-[#17120E]">{inviteEmail}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F0E8] transition"
              >
                <X className="h-4 w-4 text-[#7D6F5F]" strokeWidth={2} />
              </button>
            </div>

            <div className="mx-6 h-px bg-[#EAD8B8]" />

            <InviteWarningContent />

            <div className="mx-6 h-px bg-[#EAD8B8]" />

            <div className="px-6 py-5 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex h-[46px] items-center justify-center rounded-[12px] border border-[#DCC7A4] bg-white px-6 text-[14px] font-semibold text-[#6F6255] transition hover:bg-[#FAF4EA]"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowInviteModal(false); sendInvite(); }}
                disabled={inviteLoading}
                className="flex h-[46px] items-center justify-center gap-2.5 rounded-[12px] bg-[#C8A557] px-6 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(184,146,74,0.2)] transition hover:bg-[#B8924A] disabled:opacity-50"
              >
                <Send className="h-4 w-4" strokeWidth={1.8} />
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Share Link Confirmation Modal ── */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(22,18,12,0.45)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-[20px] bg-white shadow-[0_24px_60px_rgba(22,18,12,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-[18px] font-bold text-[#17120E]">Before you share</h3>
                  <p className="text-[13px] text-[#7D6F5F] mt-0.5">
                    Anyone with this link can join your library
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F0E8] transition"
              >
                <X className="h-4 w-4 text-[#7D6F5F]" strokeWidth={2} />
              </button>
            </div>

            <div className="mx-6 h-px bg-[#EAD8B8]" />

            <InviteWarningContent />

            {/* Extra warning for link sharing */}
            <div className="px-6 pb-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-[#FEF3C7] mt-0.5">
                  <Link2 className="h-4 w-4 text-[#A06A1C]" strokeWidth={1.7} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#17120E] leading-snug">This link is reusable</p>
                  <p className="text-[13px] text-[#7D6F5F] leading-[1.6] mt-0.5">
                    Anyone who receives this link can use it to join. You can deactivate it at any time by regenerating a new one.
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-6 h-px bg-[#EAD8B8]" />

            <div className="px-6 py-5 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex h-[46px] items-center justify-center rounded-[12px] border border-[#DCC7A4] bg-white px-6 text-[14px] font-semibold text-[#6F6255] transition hover:bg-[#FAF4EA]"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndShare}
                disabled={shareLinkLoading}
                className="flex h-[46px] items-center justify-center gap-2.5 rounded-[12px] bg-[#C8A557] px-6 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(184,146,74,0.2)] transition hover:bg-[#B8924A] disabled:opacity-50"
              >
                {shareLinkLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Share2 className="h-4 w-4" strokeWidth={1.8} />
                )}
                {shareLinkLoading ? 'Preparing…' : 'Share Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-5 lg:grid-cols-[0.92fr_1.08fr]">

        {/* LEFT CARD */}
        <div
          className="rounded-[20px] border bg-[#FFFDF9] px-5 py-6 sm:px-8 sm:py-8 shadow-[0_14px_36px_rgba(44,36,27,0.05)]"
          style={{ borderColor: '#EAD8B8' }}
        >
          <div className="mb-5 flex items-center gap-2.5">
            <Users className="h-4 w-4 text-[#B8924A]" strokeWidth={1.7} />
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#B8924A]">
              Invite Family
            </p>
          </div>

          <h2 className="max-w-[500px] font-serif text-[28px] sm:text-[35px] leading-[1.08] tracking-[-0.04em] text-[#17120E]">
            Build this library{' '}
            <em className="font-serif italic text-[#A9782F]">together.</em>
          </h2>

          <p className="mt-4 max-w-[460px] text-[15px] leading-[1.8] text-[#6F6255]">
            Share a link with your family — via WhatsApp, text, Messenger, or however you stay in touch.
          </p>

          {/* ── PRIMARY: Share Link ── */}
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleShareClick}
              disabled={shareLinkLoading}
             className="flex h-[60px] w-full items-center justify-center gap-3 rounded-[12px] bg-[#C8A557] px-6 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(184,146,74,0.2)] transition hover:bg-[#B8924A] disabled:opacity-50"
            >
              {shareLinkLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Share2 className="h-5 w-5" strokeWidth={1.8} />
              )}
              {shareLinkLoading ? 'Preparing…' : 'Share with Family'}
            </button>
          </div>

          {/* Copy link + Regenerate row (shown after first share) */}
          {shareLink && (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={copyLinkOnly}
                className="flex items-center gap-2 text-[13px] font-medium text-[#A9782F] hover:text-[#8A6324] transition"
              >
                {copied ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.7} />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
              <span className="text-[#DCC7A4]">·</span>
              <button
                onClick={regenerateLink}
                disabled={shareLinkLoading}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#7D6F5F] hover:text-[#A9782F] transition disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.7} />
                New link
              </button>
            </div>
          )}

          {copied && !shareLink && (
            <div className="mt-3 flex items-center gap-2 text-[13px] text-emerald-600">
              <Check size={14} /> Link copied to clipboard
            </div>
          )}

          {shareError && <p className="mt-3 text-[13px] text-red-500">{shareError}</p>}

          {/* ── DIVIDER ── */}
          <div className="my-7 flex items-center gap-5">
            <div className="h-px flex-1 bg-[#E7D8C1]" />
            <span className="text-[13px] text-[#7D6F5F]">OR</span>
            <div className="h-px flex-1 bg-[#E7D8C1]" />
          </div>

          {/* ── SECONDARY: Email invite (collapsible) ── */}
          <button
            onClick={() => setShowEmailSection(!showEmailSection)}
            className="flex w-full items-center justify-between rounded-[12px] border border-[#DCC7A4] bg-white px-5 py-4 text-left transition hover:bg-[#FAF4EA]"
          >
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#A9782F]" strokeWidth={1.7} />
              <div>
                <p className="text-[14px] font-semibold text-[#17120E]">Invite by email</p>
                <p className="text-[12px] text-[#7D6F5F] mt-0.5">Send a personal invitation to a specific person</p>
              </div>
            </div>
            {showEmailSection ? (
              <ChevronUp className="h-4 w-4 text-[#7D6F5F]" strokeWidth={1.8} />
            ) : (
              <ChevronDown className="h-4 w-4 text-[#7D6F5F]" strokeWidth={1.8} />
            )}
          </button>

          {showEmailSection && (
            <div className="mt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex h-[52px] w-full sm:flex-1 items-center gap-3 rounded-[12px] border border-[#DCC7A4] bg-white px-5">
                  <Mail className="h-5 w-5 text-[#B8AFA4]" strokeWidth={1.7} />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && inviteEmail.trim()) setShowInviteModal(true); }}
                    placeholder="Enter their email address"
                    className="h-full flex-1 bg-transparent text-[14px] text-[#2C241B] outline-none placeholder:text-[#9B8E7D]"
                  />
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  disabled={inviteLoading || !inviteEmail.trim()}
                  className="flex h-[52px] items-center justify-center gap-2.5 rounded-[12px] border border-[#DCC7A4] bg-white px-6 text-[14px] font-semibold text-[#17120E] transition hover:bg-[#FAF4EA] disabled:opacity-50"
                >
                  {inviteLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C8A557]/30 border-t-[#C8A557]" />
                  ) : (
                    <Send className="h-4 w-4 text-[#A9782F]" strokeWidth={1.8} />
                  )}
                  {inviteLoading ? 'Sending…' : 'Send'}
                </button>
              </div>

              {inviteSuccess && (
                <div className="mt-3 flex items-center gap-2 text-[13px] text-emerald-600">
                  <Check size={14} /> {inviteSuccess}
                </div>
              )}
              {inviteError && <p className="mt-3 text-[13px] text-red-500">{inviteError}</p>}
            </div>
          )}

          {/* ── ACTIONS ── */}
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/dashboard/family?add=true')}
              className="rounded-[14px] bg-[#C8A557] px-6 py-6 text-center text-white shadow-[0_10px_22px_rgba(184,146,74,0.2)] transition hover:bg-[#B8924A]"
            >
              <Users className="mx-auto mb-3 h-7 w-7" strokeWidth={1.6} />
              <p className="text-[18px] font-semibold">Add a Loved One</p>
              <p className="mt-2 text-[14px] leading-[1.45] text-white/90">
                Create a profile for someone special
              </p>
            </button>

            <button
              onClick={() => router.push('/dashboard/library')}
              className="rounded-[14px] border border-[#DCC7A4] bg-[#FFFDF9] px-6 py-6 text-center text-[#17120E] transition hover:bg-[#FAF4EA]"
            >
              <CloudUpload className="mx-auto mb-3 h-7 w-7 text-[#A9782F]" strokeWidth={1.6} />
              <p className="text-[18px] font-semibold">Upload to Library</p>
              <p className="mt-2 text-[14px] leading-[1.45] text-[#6F6255]">
                Add photos, videos or documents
              </p>
            </button>
          </div>
        </div>

        {/* RIGHT CARD — unchanged */}
        <div
          className="rounded-[20px] border bg-[#FFFDF9] px-5 py-6 sm:px-8 sm:py-8 shadow-[0_14px_36px_rgba(44,36,27,0.05)] flex flex-col"
          style={{ borderColor: '#E7DFD3' }}
        >
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#B8924A]">
              Family Highlights
            </p>

            <div className="hidden lg:flex gap-2.5">
              <button
                onClick={prevMemory}
                aria-label="Previous"
                className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] border border-[#E7DFD3] bg-white text-[#17120E] transition hover:bg-[#FAF4EA]"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={1.8} />
              </button>
              <button
                onClick={nextMemory}
                aria-label="Next"
                className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] border border-[#E7DFD3] bg-white text-[#17120E] transition hover:bg-[#FAF4EA]"
              >
                <ArrowRight className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <h2 className="font-serif text-[28px] sm:text-[34px] leading-[1.12] tracking-[-0.04em] text-[#17120E]">
            Your most{' '}
            <em className="italic text-[#A9782F]">meaningful</em>{' '}
            moments
          </h2>

          <div className="mt-7 flex-1">
            <MemoryDropCard
              index={activeMemory}
              image={homeImages[activeMemory]}
              placeholder={placeholders[activeMemory]}
              onUpload={uploadHomeImage}
            />
          </div>

          <div className="mt-7 space-y-4">
            <p className="text-[14px] text-[#7D6F5F]">
              Choose <span className="text-[#A9782F]">five</span> moments that deserve to live here.
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <button
                    key={i}
                    onClick={() => setActiveMemory(i)}
                    aria-label={`Memory ${i + 1}`}
                    className={`h-7 w-7 rounded-full text-[11px] font-bold transition flex items-center justify-center ${activeMemory === i ? 'bg-[#D1A33E] text-white' : 'bg-[#DEDAD4] text-[#9B8E7D]'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 lg:hidden">
                <button onClick={prevMemory} aria-label="Previous" className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E7DFD3] bg-white text-[#17120E]">
                  <ArrowLeft size={14} />
                </button>
                <button onClick={nextMemory} aria-label="Next" className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E7DFD3] bg-white text-[#17120E]">
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Shared warning content for both modals ──
function InviteWarningContent() {
  return (
    <div className="px-6 py-5 space-y-4">
      <div className="flex items-start gap-3.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-[#F5EDD8] mt-0.5">
          <Eye className="h-4 w-4 text-[#A9782F]" strokeWidth={1.7} />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#17120E] leading-snug">Full library access</p>
          <p className="text-[13px] text-[#7D6F5F] leading-[1.6] mt-0.5">
            This person will be able to browse, view, and explore everything in your family library.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-[#F5EDD8] mt-0.5">
          <Pencil className="h-4 w-4 text-[#A9782F]" strokeWidth={1.7} />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#17120E] leading-snug">They can create and contribute</p>
          <p className="text-[13px] text-[#7D6F5F] leading-[1.6] mt-0.5">
            They&apos;ll be able to add photos, videos, voice notes, loved ones, timelines, albums, capsules, and order books, canvases, and acrylics.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-[#F5EDD8] mt-0.5">
          <Trash2 className="h-4 w-4 text-[#A9782F]" strokeWidth={1.7} />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#17120E] leading-snug">Deleting is creator-only</p>
          <p className="text-[13px] text-[#7D6F5F] leading-[1.6] mt-0.5">
            Only the person who created something can delete it. For example, if you create a timeline, they can view and add to it — but only you can delete it.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-[#FEF3C7] mt-0.5">
          <Users className="h-4 w-4 text-[#A06A1C]" strokeWidth={1.7} />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#17120E] leading-snug">Only invite people you trust</p>
          <p className="text-[13px] text-[#7D6F5F] leading-[1.6] mt-0.5">
            Your library contains personal memories. Only share access with trusted family members.
          </p>
        </div>
      </div>
    </div>
  );
}

function MemoryDropCard({
  index, image, placeholder, onUpload,
}: {
  index: number;
  image: string | null;
  placeholder: string;
  onUpload: (file: File, index: number) => void | Promise<void>;
}) {
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { setLoaded(false); }, [image]);

  return (
    <label
      className="group relative block w-full overflow-hidden rounded-[20px] transition duration-300"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) { setLoaded(false); setUploading(true); Promise.resolve(onUpload(f, index)).finally(() => setUploading(false)); }
      }}
    >
     <div className={`relative overflow-hidden rounded-[20px] min-h-[380px] flex items-center justify-center ${image ? 'border border-[#E7DFD3] bg-[#F5F2ED]' : 'border border-dashed border-[#E1C99D] bg-[#FFFCF8]'}`}>
        {uploading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#E1C99D] border-t-[#C8A557]" />
          </div>
        )}

        {image ? (
          <div className="relative h-full w-full min-h-[380px]">
            <Image
              src={image} alt="" fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 70vw, 620px"
              className={`object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
              priority
              onLoadingComplete={() => { setLoaded(true); setUploading(false); }}
            />
          </div>
        ) : (
          <div className="text-center px-6 py-10">
            <div className="relative mx-auto mb-7 flex h-[68px] w-[68px] items-center justify-center rounded-full bg-white shadow-[0_10px_28px_rgba(44,36,27,0.07)]">
              <Plus className="h-6 w-6 text-[#A9782F]" strokeWidth={1.7} />
            </div>

            <h3 className="font-serif text-[21px] tracking-[-0.02em] text-[#17120E]">
              {placeholder.split('.')[0]}.
            </h3>

            <p className="mt-4 text-[14px] text-[#7D6F5F]">
              {placeholder.split('.').slice(1).join('.').trim()}
            </p>
          </div>
        )}
      </div>

      <input
        type="file" accept="image/*" hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) { setLoaded(false); setUploading(true); Promise.resolve(onUpload(f, index)).finally(() => setUploading(false)); }
        }}
      />
    </label>
  );
}