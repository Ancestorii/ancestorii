'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Users } from 'lucide-react';
import type { FeedMemory } from './MemoryFeed';

export default function MemoryCard({ memory }: { memory: FeedMemory }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const initials = memory.author_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const stripped = memory.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const bodyPreview = stripped.length > 200 ? stripped.slice(0, 200).trim() + '…' : stripped;
  const timeAgo = getTimeAgo(memory.created_at);

  return (
    <Link
      href={`/dashboard/memories/${memory.id}`}
      className="block bg-white border border-[#EDE8DF] overflow-hidden transition-all duration-300 hover:border-[#D4C9B2] hover:shadow-[0_8px_30px_rgba(44,36,27,0.08)]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Photo */}
      {memory.cover_url && (
        <div className="relative w-full aspect-[16/9] bg-[#F0EBE0] overflow-hidden">
          <Image
            src={memory.cover_url}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className={`object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
            }`}
            onLoadingComplete={() => setImageLoaded(true)}
          />
        </div>
      )}

      <div className="px-6 py-5 sm:px-7 sm:py-6">
        {/* Author + time */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 flex-shrink-0 rounded-full overflow-hidden border border-[#E4D2AE] bg-[#FAF5EB] flex items-center justify-center">
            {memory.author_avatar_url ? (
              <Image src={memory.author_avatar_url} alt="" width={36} height={36} className="h-full w-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-[#A9782F]">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1A1612]">{memory.author_name}</p>
            <p className="text-[11px] text-[#9B8E7D]">{timeAgo}</p>
          </div>
          {memory.tab_count > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF5EB] text-[11px] font-medium text-[#A9782F] flex-shrink-0">
              <Users size={11} strokeWidth={1.8} />
              {memory.tab_count + 1}
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-[20px] sm:text-[22px] font-semibold text-[#1A1612] leading-[1.2] mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, letterSpacing: '-0.02em' }}
        >
          {memory.title}
        </h3>

        {/* Preview */}
        <p className="text-[14px] text-[#6F6255] leading-[1.7] mb-4">
          {bodyPreview}
        </p>

        {/* Engagement */}
        <div className="flex items-center gap-4 pt-4 border-t border-[#F0EBE3]">
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#6F6255]">
            <Heart
              size={14}
              strokeWidth={1.6}
              className="text-[#D94F4F]"
              fill="#D94F4F"
            />
            {memory.reaction_count}
          </span>
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#6F6255]">
          <MessageCircle size={14} strokeWidth={1.6} className="text-[#5A87A8]" fill="#5A87A8" />
            {memory.comment_count}
          </span>
        </div>
      </div>
    </Link>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}