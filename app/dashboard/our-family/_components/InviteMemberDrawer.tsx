// InviteMemberDrawer.tsx — updated with Share Link + Email options

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeToast as toast } from '@/lib/safeToast';
import {
  X,
  Send,
  Mail,
  ShieldAlert,
  Eye,
  Pencil,
  Trash2,
  Users,
  Share2,
  Link2,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function InviteMemberDrawer({
  open,
  onClose,
  onInviteSent,
}: {
  open: boolean;
  onClose: () => void;
  onInviteSent: () => void;
}) {
  // ── Email state ──
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showEmailSection, setShowEmailSection] = useState(false);

  // ── Share link state ──
  const [shareLink, setShareLink] = useState('');
  const [shareLinkLoading, setShareLinkLoading] = useState(false);
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');

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

  const confirmAndShare = async () => {
    setShowShareConfirm(false);

    const url = shareLink || (await fetchShareLink());
    if (!url) return;

    const shareMessage =
      "I'm building our family's memory library on Ancestorii — come add your photos and stories.";

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Join our Family Library on Ancestorii',
          text: shareMessage,
          url,
        });
        toast.success('Link shared!');
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    // Desktop fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareMessage}\n\n${url}`);
      setCopied(true);
      toast.success('Link copied to clipboard!');
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
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setShareError('Failed to copy link');
    }
  };

  const regenerateLink = async () => {
    const url = await fetchShareLink(true);
    if (url) toast.success('New link generated.');
  };

  // ── Email invite logic ──
  const handleSendInvite = async () => {
    if (!email.trim() || loading) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      setShowConfirm(false);
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to send invite.');
      } else {
        toast.success(`Invite sent to ${email.trim()}`);
        setEmail('');
        setShowConfirm(false);
        onInviteSent();
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setEmailError('');
    setShowConfirm(false);
    setShowShareConfirm(false);
    setShowEmailSection(false);
    setCopied(false);
    setShareError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: 'rgba(22,18,12,0.45)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-[20px] bg-white shadow-[0_24px_60px_rgba(22,18,12,0.25)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#B8924A]">
                  Invite Family
                </p>
                <h3 className="mt-1 font-serif text-[22px] tracking-[-0.02em] text-[#17120E]">
                  Build this library{' '}
                  <em className="italic text-[#A9782F]">together</em>
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F0E8] transition"
              >
                <X className="h-4 w-4 text-[#7D6F5F]" strokeWidth={2} />
              </button>
            </div>

            <div className="mx-6 h-px bg-[#EAD8B8]" />

            {/* ── Share link section (primary) ── */}
            <div className="px-6 py-5">
              <p className="text-[14px] leading-[1.7] text-[#6F6255] mb-5">
                Share a link with your family — via WhatsApp, text, Messenger, or however you stay in touch.
              </p>

              <button
                onClick={() => setShowShareConfirm(true)}
                disabled={shareLinkLoading}
                className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[12px] bg-[#C8A557] px-6 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(184,146,74,0.2)] transition hover:bg-[#B8924A] disabled:opacity-50"
              >
                {shareLinkLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Share2 className="h-5 w-5" strokeWidth={1.8} />
                )}
                {shareLinkLoading ? 'Preparing…' : 'Share with Family'}
              </button>

              {/* Copy link + Regenerate (shown after first share) */}
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

              {shareError && <p className="mt-3 text-[13px] text-red-500">{shareError}</p>}
            </div>

            {/* ── Share link confirmation panel ── */}
            <AnimatePresence>
              {showShareConfirm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mx-6 h-px bg-[#EAD8B8]" />

                  <div className="px-6 py-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div>
                        <p className="text-[14px] font-semibold text-[#17120E]">Before you invite</p>
                        <p className="text-[12px] text-[#7D6F5F]">Anyone with this link can join your library</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <ConsiderationItem
                        icon={<Eye className="h-3.5 w-3.5 text-[#A9782F]" strokeWidth={1.7} />}
                        title="Full library access"
                        description="They can browse, view, and explore everything in your family library."
                      />
                      <ConsiderationItem
                        icon={<Pencil className="h-3.5 w-3.5 text-[#A9782F]" strokeWidth={1.7} />}
                        title="They can create and contribute"
                        description="They can add photos, timelines, albums, capsules, and order books."
                      />
                      <ConsiderationItem
                        icon={<Trash2 className="h-3.5 w-3.5 text-[#A9782F]" strokeWidth={1.7} />}
                        title="Deleting is creator-only"
                        description="Only the person who created something can delete it."
                      />
                      <ConsiderationItem
                        icon={<Link2 className="h-3.5 w-3.5 text-[#A06A1C]" strokeWidth={1.7} />}
                        title="This link is reusable"
                        description="Anyone who receives it can join. You can deactivate it by generating a new one."
                        accent
                      />
                      <ConsiderationItem
                        icon={<Users className="h-3.5 w-3.5 text-[#A06A1C]" strokeWidth={1.7} />}
                        title="Only share with people you trust"
                        description="Your library contains personal memories. Share wisely."
                        accent
                      />
                    </div>
                  </div>

                  <div className="mx-6 h-px bg-[#EAD8B8]" />

                  <div className="px-6 py-5 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                    <button
                      onClick={() => setShowShareConfirm(false)}
                      className="flex h-[46px] items-center justify-center rounded-[12px] border border-[#DCC7A4] bg-white px-6 text-[14px] font-semibold text-[#6F6255] transition hover:bg-[#FAF4EA]"
                    >
                      Go Back
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Divider ── */}
            {!showShareConfirm && (
              <div className="px-6">
                <div className="flex items-center gap-5">
                  <div className="h-px flex-1 bg-[#E7D8C1]" />
                  <span className="text-[13px] text-[#7D6F5F]">OR</span>
                  <div className="h-px flex-1 bg-[#E7D8C1]" />
                </div>
              </div>
            )}

            {/* ── Email section (secondary, collapsible) ── */}
            {!showShareConfirm && (
              <div className="px-6 py-5">
                <button
                  onClick={() => setShowEmailSection(!showEmailSection)}
                  className="flex w-full h-[52px] items-center justify-between rounded-[12px] border border-[#DCC7A4] bg-white px-5 text-left transition hover:bg-[#FAF4EA]"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-[#A9782F]" strokeWidth={1.7} />
                    <div>
                      <p className="text-[14px] font-semibold text-[#17120E]">Invite by email</p>
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
                      <div className="flex h-[52px] w-full sm:flex-1 items-center gap-3 rounded-[12px] border border-[#DCC7A4] bg-white px-4">
                        <Mail className="h-5 w-5 text-[#B8AFA4]" strokeWidth={1.7} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && email.trim()) {
                              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                                setEmailError('Please enter a valid email address.');
                              } else {
                                setShowConfirm(true);
                              }
                            }
                          }}
                          placeholder="Enter their email address"
                          className="h-full flex-1 bg-transparent text-[14px] text-[#2C241B] outline-none placeholder:text-[#9B8E7D]"
                        />
                      </div>

                      <button
                        onClick={() => {
                          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                            setEmailError('Please enter a valid email address.');
                            return;
                          }
                          setShowConfirm(true);
                        }}
                        disabled={!email.trim() || loading}
                        className="flex h-[52px] items-center justify-center gap-2.5 rounded-[12px] border border-[#DCC7A4] bg-white px-6 text-[14px] font-semibold text-[#17120E] transition hover:bg-[#FAF4EA] disabled:opacity-50"
                      >
                        <Send className="h-4 w-4 text-[#A9782F]" strokeWidth={1.8} />
                        Review
                      </button>
                    </div>

                    {emailError && (
                      <p className="mt-3 text-[13px] text-red-500">{emailError}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Email confirmation panel ── */}
            <AnimatePresence>
              {showConfirm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mx-6 h-px bg-[#EAD8B8]" />

                  <div className="px-6 py-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div>
                        <p className="text-[14px] font-semibold text-[#17120E]">Before you share</p>
                        <p className="text-[12px] text-[#7D6F5F]">
                          Sending to{' '}
                          <span className="font-semibold text-[#17120E]">{email}</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <ConsiderationItem
                        icon={<Eye className="h-3.5 w-3.5 text-[#A9782F]" strokeWidth={1.7} />}
                        title="Full library access"
                        description="They can browse, view, and explore everything in your family library."
                      />
                      <ConsiderationItem
                        icon={<Pencil className="h-3.5 w-3.5 text-[#A9782F]" strokeWidth={1.7} />}
                        title="They can create and contribute"
                        description="They can add photos, timelines, albums, capsules, and order books."
                      />
                      <ConsiderationItem
                        icon={<Trash2 className="h-3.5 w-3.5 text-[#A9782F]" strokeWidth={1.7} />}
                        title="Deleting is creator-only"
                        description="Only the person who created something can delete it."
                      />
                      <ConsiderationItem
                        icon={<Users className="h-3.5 w-3.5 text-[#A06A1C]" strokeWidth={1.7} />}
                        title="Only invite people you trust"
                        description="Your library contains personal memories. Share wisely."
                        accent
                      />
                    </div>
                  </div>

                  <div className="mx-6 h-px bg-[#EAD8B8]" />

                  <div className="px-6 py-5 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex h-[46px] items-center justify-center rounded-[12px] border border-[#DCC7A4] bg-white px-6 text-[14px] font-semibold text-[#6F6255] transition hover:bg-[#FAF4EA]"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={handleSendInvite}
                      disabled={loading}
                      className="flex h-[46px] items-center justify-center gap-2.5 rounded-[12px] bg-[#C8A557] px-6 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(184,146,74,0.2)] transition hover:bg-[#B8924A] disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <Send className="h-4 w-4" strokeWidth={1.8} />
                      )}
                      {loading ? 'Sending…' : 'Send Invite'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConsiderationItem({
  icon,
  title,
  description,
  accent = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[6px] mt-0.5 ${
          accent ? 'bg-[#FEF3C7]' : 'bg-[#F5EDD8]'
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[13px] font-semibold text-[#17120E] leading-snug">
          {title}
        </p>
        <p className="text-[12px] text-[#7D6F5F] leading-[1.5] mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}