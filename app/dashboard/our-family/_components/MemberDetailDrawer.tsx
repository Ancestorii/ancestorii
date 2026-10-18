'use client';

import { useId, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ui, Btn, IconBtn, Tag, toneFor, useDialog } from '@/components/dashboard/ui/AppBits';

type FamilyMember = {
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  full_name: string | null;
  email: string | null;
  profile_image_url: string | null;
  avatar_signed?: string | null;
  bio?: string | null;
};

// The role chip's dot: the same colours as on the member cards and the page header.
const roleConfig = {
  owner: { label: 'Owner', dot: 'var(--c2)' },
  admin: { label: 'Admin', dot: 'var(--c1)' },
  member: { label: 'Member', dot: 'var(--c3)' },
};

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export default function MemberDetailDrawer({
  member,
  open,
  onClose,
}: {
  member: FamilyMember | null;
  open: boolean;
  onClose: () => void;
}) {
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const titleId = useId();

  // The page clears `member` the moment the drawer closes; keep showing the last one so the
  // drawer can animate out instead of vanishing.
  const [shown, setShown] = useState(member);
  if (member && member !== shown) {
    setShown(member);
    // A different person: let their photo fade in rather than pop.
    setAvatarLoaded(false);
  }
  const current = member ?? shown;

  // Escape closes it, Tab stays inside, focus goes back to the member card.
  const panelRef = useDialog<HTMLDivElement>(open && !!current, onClose);

  if (!current) return null;

  const config = roleConfig[current.role] || roleConfig.member;

  const displayName =
    current.full_name || current.email?.split('@')[0] || 'Family Member';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const joinedDate = new Date(current.joined_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // The same ring colour as this person's member card.
  const ring = toneFor(displayName);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // scrim-blur (globals.css) blurs only with a mouse; on touch it re-rendered the whole screen every frame.
          // Above the floating phone nav (z-[200], later in the DOM), like the invite drawer.
          className={cx(ui.scrim, 'scrim-blur z-[9999] flex items-center justify-center p-4')}
          onClick={onClose}
        >
          {/* transform string (not y/scale) so Motion runs the pop-in on the compositor */}
          <motion.div
            initial={{ opacity: 0, transform: 'translateY(30px) scale(0.96)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={{ opacity: 0, transform: 'translateY(30px) scale(0.96)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cx(ui.sheet, 'w-full max-w-[480px]')}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className={ui.sheetHeader}>
              <div className="self-center">
                <Tag dot="var(--c1)">Member Details</Tag>
              </div>
              <IconBtn label="Close" onClick={onClose}>
                <X size={20} strokeWidth={2.4} aria-hidden="true" />
              </IconBtn>
            </div>

            {/* ── Profile section ── */}
            <div className={ui.sheetBody}>
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <span
                  className={ui.avatar}
                  style={{ '--size': '72px', '--ring': ring.bg, color: ring.fg } as CSSProperties}
                >
                  {current.avatar_signed ? (
                    <Image
                      src={current.avatar_signed}
                      alt=""
                      fill
                      sizes="144px"
                      quality={90}
                      className={`object-cover transition-opacity duration-300 ${
                        avatarLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => setAvatarLoaded(true)}
                    />
                  ) : (
                    <span aria-hidden="true">{initials}</span>
                  )}
                </span>

                {/* Name + email */}
                <div className="min-w-0 flex-1">
                  <h2 id={titleId} className={cx(ui.sheetTitle, '[overflow-wrap:anywhere]')}>
                    {displayName}
                  </h2>
                  {current.email && (
                    <p className="mt-1 text-[14px] font-medium leading-snug [overflow-wrap:anywhere]">
                      {current.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Role + joined */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span
                  className={cx(ui.chip, ui.chipDot)}
                  style={{ '--dot': config.dot } as CSSProperties}
                >
                  {config.label}
                </span>
                <span className={ui.chip}>Joined {joinedDate}</span>
              </div>

              {/* ── Bio / About ── */}
              {current.bio && (
                <>
                  <div className="mt-6">
                    <hr className={ui.rule} />
                  </div>

                  <div className="mt-5">
                    <Tag dot={ring.bg}>
                      About {current.full_name?.split(' ')[0] || 'them'}
                    </Tag>
                    <p className={cx(ui.body, 'mt-3 [overflow-wrap:anywhere]')}>
                      {current.bio}
                    </p>
                  </div>
                </>
              )}

              {!current.bio && (
                <>
                  <div className="mt-6">
                    <hr className={ui.rule} />
                  </div>

                  <div className="mt-5">
                    <Tag dot={ring.bg}>
                      About {current.full_name?.split(' ')[0] || 'them'}
                    </Tag>
                    <p className={cx(ui.body, 'mt-3')}>
                      No description yet. They can add one from their profile.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* ── Close button ── */}
            <div className={ui.sheetFooter}>
              <Btn variant="soft" onClick={onClose}>
                Close
              </Btn>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
