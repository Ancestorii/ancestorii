'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ContextMenuDots } from '@/components/ContextMenuDots';
import { safeToast as toast } from '@/lib/safeToast';

type Capsule = {
  id: string;
  title: string;
  description: string | null;
  unlock_date: string;
  is_locked: boolean;
  created_at: string;
  cover_image: string | null;
};

type Props = {
  capsule: Capsule;
  onEdit: () => void;
  onDelete: () => void;
};

export default function CapsuleCard({ capsule, onEdit, onDelete }: Props) {
  // 🔐 LOCK STATE (frontend auto-unlock logic)
  const now = Date.now();
  const unlockTime = new Date(capsule.unlock_date).getTime();

  const isStillLocked =
    capsule.is_locked && unlockTime > now;

  // ⏳ TIME REMAINING
const timeRemaining = useMemo(() => {
  if (!isStillLocked) return null;

  const nowDate = new Date();
  const unlockDate = new Date(capsule.unlock_date);

  const diffMs = unlockDate.getTime() - nowDate.getTime();
  if (diffMs <= 0) return 'Unlocking soon';

  const daysTotal = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let years =
    unlockDate.getFullYear() - nowDate.getFullYear();
  let months =
    unlockDate.getMonth() - nowDate.getMonth();
  let days =
    unlockDate.getDate() - nowDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(
      unlockDate.getFullYear(),
      unlockDate.getMonth(),
      0
    ).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // 🔑 RULES
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}${
      months > 0 ? ` ${months} month${months > 1 ? 's' : ''}` : ''
    } remaining`;
  }

  if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''} remaining`;
  }

  return `${daysTotal} day${daysTotal > 1 ? 's' : ''} remaining`;
}, [isStillLocked, capsule.unlock_date]);


  return (
    <div className="rounded-3xl border border-[#B7932F]/60 shadow-md hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden bg-white/95 relative">
      {/* Cover */}
      <div className="aspect-[16/9] bg-gradient-to-b from-[#F3F4F6] to-[#EAECEF] overflow-hidden">
        {capsule.cover_image ? (
          <img
            src={capsule.cover_image}
            alt={capsule.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[#9AA3AF] text-sm">
            No cover image
          </div>
        )}
      </div>

      {/* Context menu */}
      <div className="absolute top-3 right-3 z-20">
        <ContextMenuDots
          editLabel="Edit Capsule"
          onEdit={() => {
            if (isStillLocked) {
              toast.error('This capsule is locked.');
              return;
            }
            onEdit();
          }}
          onDelete={onDelete}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-[#222B3A] mb-2 line-clamp-1">
          {capsule.title}
        </h3>

        <p className="text-[#5B6473] text-sm mb-4 line-clamp-2">
          {capsule.description || 'A sealed message for your future self'}
        </p>

        {/* Created / Locked info */}
        {!isStillLocked ? (
          <p className="text-xs text-[#7A8596] mb-4">
            Created {new Date(capsule.created_at).toLocaleDateString()}
          </p>
        ) : (
          <div className="mb-4">
            <p className="text-xs text-[#7A8596]">
              Unlocks on{' '}
              {new Date(capsule.unlock_date).toLocaleDateString()}
            </p>
            <p className="text-xs font-semibold text-[#8A6A1F] mt-1">
              {timeRemaining}
            </p>
          </div>
        )}

        {/* CTA */}
        {!isStillLocked ? (
          <Link
            href={`/dashboard/capsules/${capsule.id}`}
            className="block text-center font-semibold px-4 py-3 rounded-full
                       text-[#1F2837] bg-gradient-to-r from-[#E6C26E] to-[#F3D99B]
                       shadow hover:shadow-md transition-transform duration-200
                       hover:scale-[1.02]"
          >
            View Capsule →
          </Link>
        ) : (
          <div className="block text-center font-semibold px-4 py-3 rounded-full
                          bg-gray-200 text-gray-500 cursor-not-allowed">
            Capsule Locked
          </div>
        )}
      </div>
    </div>
  );
}
