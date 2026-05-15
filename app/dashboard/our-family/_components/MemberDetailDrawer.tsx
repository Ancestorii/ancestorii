'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Crown,
  Shield,
  Upload,
  Calendar,
  Image as ImageIcon,
  Mic,
} from 'lucide-react';

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

const roleConfig = {
  owner: {
    label: 'Owner',
    icon: Crown,
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#A06A1C]',
    border: 'border-[#E4D2AE]',
  },
  admin: {
    label: 'Member',
    icon: Shield,
    bg: 'bg-[#F5F0E8]',
    text: 'text-[#6F6255]',
    border: 'border-[#E7DFD3]',
  },
  member: {
    label: 'Member',
    icon: Shield,
    bg: 'bg-[#F5F0E8]',
    text: 'text-[#6F6255]',
    border: 'border-[#E7DFD3]',
  },
};

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

  if (!member) return null;

  const config = roleConfig[member.role] || roleConfig.member;
  const RoleIcon = config.icon;

  const displayName =
    member.full_name || member.email?.split('@')[0] || 'Family Member';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const joinedDate = new Date(member.joined_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{
            background: 'rgba(22,18,12,0.45)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-[480px] rounded-[20px] bg-white shadow-[0_24px_60px_rgba(22,18,12,0.25)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#B8924A]">
                Member Details
              </p>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F0E8] transition"
              >
                <X className="h-4 w-4 text-[#7D6F5F]" strokeWidth={2} />
              </button>
            </div>

            <div className="mx-6 h-px bg-[#EAD8B8]" />

            {/* ── Profile section ── */}
            <div className="px-6 py-6">
              <div className="flex items-center gap-4 mb-5">
                {/* Avatar */}
                <div
                  className="h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-full flex items-center justify-center"
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
                        sizes="144px"
                        quality={90}
                        className={`object-cover transition-opacity duration-300 ${
                          avatarLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoadingComplete={() => setAvatarLoaded(true)}
                      />
                    </div>
                  ) : (
                    <span
                      className="text-[18px] font-bold"
                      style={{ color: '#A9782F' }}
                    >
                      {initials}
                    </span>
                  )}
                </div>

                {/* Name + email */}
                <div className="min-w-0 flex-1">
                  <h3
                    className="text-[22px] font-normal leading-tight text-[#17120E]"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {displayName}
                  </h3>
                  {member.email && (
                    <p className="mt-1 text-[13px] text-[#9B8E7D] truncate">
                      {member.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Role + joined */}
              <div className="flex items-center flex-wrap gap-2 mb-6">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] border ${config.bg} ${config.text} ${config.border}`}
                >
                  <RoleIcon size={11} strokeWidth={2} />
                  {config.label}
                </span>
                <span className="text-[12px] text-[#9B8E7D]">
                  Joined {joinedDate}
                </span>
              </div>

              {/* ── Bio / About ── */}
              {member.bio && (
                <>
                  <div className="h-px bg-[#EAD8B8] mb-5" />

                  <div className="mb-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6F6255] mb-3">
                      About {member.full_name?.split(' ')[0] || 'them'}
                    </p>
                    <p className="text-[14px] leading-[1.8] text-[#3d3830]">
                      {member.bio}
                    </p>
                  </div>
                </>
              )}

              {!member.bio && (
                <>
                  <div className="h-px bg-[#EAD8B8] mb-5" />

                  <div className="mb-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6F6255] mb-3">
                      About {member.full_name?.split(' ')[0] || 'them'}
                    </p>
                    <p className="text-[14px] leading-[1.7] text-[#9B8E7D] italic">
                      No description yet. They can add one from their profile.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* ── Close button ── */}
            <div className="mx-6 h-px bg-[#EAD8B8]" />
            <div className="px-6 py-5 flex justify-end">
              <button
                onClick={onClose}
                className="flex h-[46px] items-center justify-center rounded-[12px] border border-[#DCC7A4] bg-white px-6 text-[14px] font-semibold text-[#6F6255] transition hover:bg-[#FAF4EA]"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}