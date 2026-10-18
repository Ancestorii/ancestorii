// InviteMemberDrawer.tsx: updated with Share Link + Email options

'use client';

import { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeToast as toast } from '@/lib/safeToast';
import {
  X,
  Send,
  Mail,
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
import { ui, Accent, Btn, IconBtn, Tag, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './family.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

// White spinner for the ink button and the gradient tile, in a tight clipping box.
function Spinner() {
  return (
    <span className="inline-flex h-4 w-4 overflow-clip rounded-full" aria-hidden="true">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
    </span>
  );
}

export default function InviteMemberDrawer({
  open,
  onClose,
  onInviteSent,
}: {
  open: boolean;
  onClose: () => void;
  onInviteSent: () => void;
}) {
  const titleId = useId();

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
      "I'm building our family's memory library on Ancestorii. Come add your photos and stories.";

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

  // Escape closes it (as the close button does), Tab stays inside, focus returns to the button.
  const panelRef = useDialog<HTMLDivElement>(open, handleClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // scrim-blur (globals.css) blurs only with a mouse; on touch it re-rendered the whole screen every frame
          className={cx(ui.scrim, 'scrim-blur z-[9999] flex items-center justify-center p-4')}
          onClick={handleClose}
        >
          {/* transform string (not y/scale) so Motion runs the pop-in on the compositor */}
          <motion.div
            initial={{ opacity: 0, transform: 'translateY(30px) scale(0.96)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={{ opacity: 0, transform: 'translateY(30px) scale(0.96)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cx(ui.sheet, 'w-full max-w-[520px]')}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className={ui.sheetHeader}>
              <div className="flex min-w-0 flex-col items-start gap-2.5">
                <Tag>Invite Family</Tag>
                <h2 id={titleId} className={ui.sheetTitle}>
                  Build this library <Accent>together</Accent>
                </h2>
              </div>
              <IconBtn label="Close" onClick={handleClose}>
                <X size={20} strokeWidth={2.4} aria-hidden="true" />
              </IconBtn>
            </div>

            <div className={ui.sheetBody}>
              {/* ── Share link section (primary) ── */}
              <p className={ui.body}>
                Share a link with your family via WhatsApp, text, Messenger, or however you stay in touch.
              </p>

              <Btn
                block
                onClick={() => setShowShareConfirm(true)}
                disabled={shareLinkLoading}
                tile={shareLinkLoading ? <Spinner /> : <Share2 size={18} strokeWidth={2.4} />}
                className="mt-4"
              >
                {shareLinkLoading ? 'Preparing…' : 'Share with Family'}
              </Btn>

              {/* Copy link + Regenerate (shown after first share) */}
              {shareLink && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Btn
                    variant="soft"
                    size="sm"
                    onClick={copyLinkOnly}
                    icon={
                      copied ? (
                        <Check size={16} strokeWidth={2.6} aria-hidden="true" />
                      ) : (
                        <Copy size={16} strokeWidth={2.2} aria-hidden="true" />
                      )
                    }
                    className={s.tapSafe}
                  >
                    {copied ? 'Copied!' : 'Copy link'}
                  </Btn>
                  <Btn
                    variant="soft"
                    size="sm"
                    onClick={regenerateLink}
                    disabled={shareLinkLoading}
                    icon={<RefreshCw size={16} strokeWidth={2.2} aria-hidden="true" />}
                    className={s.tapSafe}
                  >
                    New link
                  </Btn>
                </div>
              )}

              {shareError && <p className={ui.fieldError}>{shareError}</p>}

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
                    <div className="pt-6">
                      <hr className={ui.rule} />

                      <div className="pt-5">
                        <p className="text-[17px] font-extrabold leading-tight tracking-[-0.02em]">
                          Before you invite
                        </p>
                        <p className="mt-1 text-[14px] font-medium leading-snug">
                          Anyone with this link can join your library
                        </p>

                        <ul className={s.considerList}>
                          <ConsiderationItem
                            icon={<Eye size={17} strokeWidth={2.2} />}
                            title="Full library access"
                            description="They can browse, view, and explore everything in your family library."
                          />
                          <ConsiderationItem
                            icon={<Pencil size={16} strokeWidth={2.2} />}
                            title="They can create and contribute"
                            description="They can add photos, timelines, albums, capsules, and order books."
                          />
                          <ConsiderationItem
                            icon={<Trash2 size={16} strokeWidth={2.2} />}
                            title="Deleting is creator-only"
                            description="Only the person who created something can delete it."
                          />
                          <ConsiderationItem
                            icon={<Link2 size={17} strokeWidth={2.2} />}
                            title="This link is reusable"
                            description="Anyone who receives it can join. You can deactivate it by generating a new one."
                            accent
                          />
                          <ConsiderationItem
                            icon={<Users size={16} strokeWidth={2.2} />}
                            title="Only share with people you trust"
                            description="Your library contains personal memories. Share wisely."
                            accent
                          />
                        </ul>
                      </div>

                      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Btn variant="soft" onClick={() => setShowShareConfirm(false)}>
                          Go Back
                        </Btn>
                        <Btn
                          onClick={confirmAndShare}
                          disabled={shareLinkLoading}
                          icon={shareLinkLoading ? <Spinner /> : <Share2 size={17} strokeWidth={2.4} aria-hidden="true" />}
                        >
                          {shareLinkLoading ? 'Preparing…' : 'Share Link'}
                        </Btn>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Divider ── */}
              {!showShareConfirm && <div className={s.orRule}>OR</div>}

              {/* ── Email section (secondary, collapsible) ── */}
              {!showShareConfirm && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowEmailSection(!showEmailSection)}
                    aria-expanded={showEmailSection}
                    className={cx(ui.option, showEmailSection && ui.optionActive)}
                  >
                    <span className={s.considerIcon} aria-hidden="true">
                      <Mail size={17} strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0 flex-1">Invite by email</span>
                    {showEmailSection ? (
                      <ChevronUp size={18} strokeWidth={2.4} aria-hidden="true" />
                    ) : (
                      <ChevronDown size={18} strokeWidth={2.4} aria-hidden="true" />
                    )}
                  </button>

                  {showEmailSection && (
                    <div className="mt-3">
                      <div className="flex flex-col gap-3 sm:flex-row">
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
                          aria-label="Their email address"
                          aria-invalid={emailError ? true : undefined}
                          className={cx(ui.input, emailError && ui.inputError, 'sm:flex-1')}
                        />

                        <Btn
                          variant="outline"
                          onClick={() => {
                            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                              setEmailError('Please enter a valid email address.');
                              return;
                            }
                            setShowConfirm(true);
                          }}
                          disabled={!email.trim() || loading}
                          icon={<Send size={17} strokeWidth={2.2} aria-hidden="true" />}
                        >
                          Review
                        </Btn>
                      </div>

                      {emailError && <p className={ui.fieldError}>{emailError}</p>}
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
                    <div className="pt-6">
                      <hr className={ui.rule} />

                      <div className="pt-5">
                        <p className="text-[17px] font-extrabold leading-tight tracking-[-0.02em]">
                          Before you share
                        </p>
                        <p className="mt-1 text-[14px] font-medium leading-snug [overflow-wrap:anywhere]">
                          Sending to{' '}
                          <span className="font-extrabold">{email}</span>
                        </p>

                        <ul className={s.considerList}>
                          <ConsiderationItem
                            icon={<Eye size={17} strokeWidth={2.2} />}
                            title="Full library access"
                            description="They can browse, view, and explore everything in your family library."
                          />
                          <ConsiderationItem
                            icon={<Pencil size={16} strokeWidth={2.2} />}
                            title="They can create and contribute"
                            description="They can add photos, timelines, albums, capsules, and order books."
                          />
                          <ConsiderationItem
                            icon={<Trash2 size={16} strokeWidth={2.2} />}
                            title="Deleting is creator-only"
                            description="Only the person who created something can delete it."
                          />
                          <ConsiderationItem
                            icon={<Users size={16} strokeWidth={2.2} />}
                            title="Only invite people you trust"
                            description="Your library contains personal memories. Share wisely."
                            accent
                          />
                        </ul>
                      </div>

                      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Btn variant="soft" onClick={() => setShowConfirm(false)}>
                          Go Back
                        </Btn>
                        <Btn
                          onClick={handleSendInvite}
                          disabled={loading}
                          icon={loading ? <Spinner /> : <Send size={17} strokeWidth={2.4} aria-hidden="true" />}
                        >
                          {loading ? 'Sending…' : 'Send Invite'}
                        </Btn>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
    <li className={accent ? cx(ui.noticeWarn, s.considerWarn) : s.consider}>
      <span className={s.considerIcon} aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0">
        <span className={s.considerTitle}>{title}</span>
        <span className={s.considerText}>{description}</span>
      </span>
    </li>
  );
}
