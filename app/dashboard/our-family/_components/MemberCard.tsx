'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User as UserIcon, Shield, ShieldCheck, Crown } from 'lucide-react';

type FamilyMember = {
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  full_name: string | null;
  email: string | null;
  profile_image_url: string | null;
  avatar_signed?: string | null;
};

const roleConfig = {
  owner: {
    label: 'Owner',
    icon: Crown,
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#A06A1C]',
    border: 'border-[#E4D2AE]',
  },
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    bg: 'bg-[#F0EAF5]',
    text: 'text-[#5B3A8A]',
    border: 'border-[#D4C5E8]',
  },
  member: {
    label: 'Member',
    icon: Shield,
    bg: 'bg-[#F5F0E8]',
    text: 'text-[#6F6255]',
    border: 'border-[#E7DFD3]',
  },
};

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
  const RoleIcon = config.icon;

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

  return (
    <div
      onClick={onClick}
      className="rounded-[20px] border bg-[#FFFDF9] px-5 py-6 sm:px-6 sm:py-7 shadow-[0_14px_36px_rgba(44,36,27,0.05)] transition hover:shadow-[0_18px_44px_rgba(44,36,27,0.08)] cursor-pointer"
      style={{ borderColor: '#EAD8B8' }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="h-[56px] w-[56px] flex-shrink-0 overflow-hidden rounded-full flex items-center justify-center"
          style={{
            border: '2px solid #C8A557',
            backgroundColor: '#EDE8DC',
          }}
        >
          {member.avatar_signed ? (
            <div className="relative h-full w-full">
              <Image
                src={member.avatar_signed}
                alt={displayName}
                fill
                sizes="112px"
                quality={90}
                className={`object-cover transition-opacity duration-300 ${
                  avatarLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoadingComplete={() => setAvatarLoaded(true)}
              />
            </div>
          ) : (
            <span
              className="text-[14px] font-bold"
              style={{ color: '#A9782F' }}
            >
              {initials}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[16px] font-semibold text-[#17120E] truncate">
              {displayName}
            </p>
            {isCurrentUser && (
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9B8E7D]">
                (You)
              </span>
            )}
          </div>

          {member.email && (
            <p className="mt-0.5 text-[13px] text-[#9B8E7D] truncate">
              {member.email}
            </p>
          )}

          <div className="mt-3 flex items-center flex-wrap gap-2">
            {/* Role badge */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] border ${config.bg} ${config.text} ${config.border}`}
            >
              <RoleIcon size={11} strokeWidth={2} />
              {config.label}
            </span>

            {/* Joined date */}
            <span className="text-[12px] text-[#9B8E7D]">
              Joined {joinedDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}