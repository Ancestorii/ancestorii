'use client';

import { useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { ui, toneFor } from '@/components/dashboard/ui/AppBits';
import s from './family.module.css';

type FamilyMember = {
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  full_name: string | null;
  email: string | null;
  profile_image_url: string | null;
  avatar_signed?: string | null;
};

// The role chip's dot: the same colours as the role chip in the page header.
const roleConfig = {
  owner: { label: 'Owner', dot: 'var(--c2)' },
  admin: { label: 'Admin', dot: 'var(--c1)' },
  member: { label: 'Member', dot: 'var(--c3)' },
};

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export default function MemberCard({
  member,
  isCurrentUser,
  onClick,
}: {
  member: FamilyMember;
  isCurrentUser: boolean;
  onClick?: () => void;
}) {
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const config = roleConfig[member.role] || roleConfig.member;

  const joinedDate = new Date(member.joined_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const displayName = member.full_name || member.email?.split('@')[0] || 'Family Member';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // A stable ring colour for this person (the same in the member drawer).
  const ring = toneFor(displayName);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className={cx(ui.card, ui.cardLink, s.memberCard, 'h-full w-full text-left')}
    >
      <span className="flex items-start justify-between gap-3">
        {/* Avatar */}
        <span
          className={ui.avatar}
          style={{ '--size': '56px', '--ring': ring.bg, color: ring.fg } as CSSProperties}
        >
          {member.avatar_signed ? (
            <Image
              src={member.avatar_signed}
              alt=""
              fill
              sizes="112px"
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

        {/* Role chip */}
        <span
          className={cx(ui.chip, ui.chipSm, ui.chipDot)}
          style={{ '--dot': config.dot } as CSSProperties}
        >
          {config.label}
        </span>
      </span>

      {/* Info */}
      <span className="mt-4 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <span className="min-w-0 text-[17px] font-extrabold leading-[1.25] tracking-[-0.03em] [overflow-wrap:anywhere]">
          {displayName}
        </span>
        {isCurrentUser && (
          <span
            className={cx(ui.chip, ui.chipSm, ui.chipColor)}
            style={{ '--chip': 'var(--c1)', '--chip-fg': '#fff' } as CSSProperties}
          >
            You
          </span>
        )}
      </span>

      {member.email && (
        <span className="mt-1 block truncate text-[14px] font-medium leading-snug">
          {member.email}
        </span>
      )}

      <span className="mt-1.5 block text-[13px] font-semibold leading-snug">
        Joined {joinedDate}
      </span>
    </button>
  );
}
