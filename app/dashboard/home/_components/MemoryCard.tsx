'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Users } from 'lucide-react';
import type { FeedMemory } from './MemoryFeed';

export default function MemoryCard({
  memory,
}: {
  memory: FeedMemory;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const initials = memory.author_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bodyPreview =
    memory.body.length > 280
      ? memory.body.slice(0, 280).trim() + '…'
      : memory.body;

  const timeAgo = getTimeAgo(memory.created_at);

  return (
    <Link
      href={`/dashboard/memories/${memory.id}`}
      className="block rounded-[16px] border border-[#EAD8B8] bg-white overflow-hidden shadow-[0_4px_16px_rgba(44,36,27,0.04)] transition hover:shadow-[0_8px_28px_rgba(44,36,27,0.08)]"
    >
      {/* Author */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-3">
        <div className="h-[40px] w-[40px] rounded-full overflow-hidden border border-[#E4D2AE] bg-[#FAF5EB] flex items-center justify-center flex-shrink-0">
          {memory.author_avatar_url ? (
            <Image
              src={memory.author_avatar_url}
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[11px] font-bold text-[#A9782F]">
              {initials}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#17120E]">
            {memory.author_name}
          </p>
          <p className="text-[12px] text-[#9B8E7D]">{timeAgo}</p>
        </div>
      </div>

      {/* Photo */}
      {memory.cover_url && (
        <div className="relative w-full aspect-[4/3] bg-[#F5F0E8]">
          <Image
            src={memory.cover_url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            className={`object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoadingComplete={() => setImageLoaded(true)}
          />
        </div>
      )}

      {/* Content */}
      <div className="px-5 py-4">
        <h3
          className="text-[18px] font-semibold text-[#17120E] leading-[1.25]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
          }}
        >
          {memory.title}
        </h3>
        <p className="mt-2 text-[14px] text-[#6F6255] leading-[1.7]">
          {bodyPreview}
        </p>

        {/* Tab indicator */}
        {memory.tab_count > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5EDD8] text-[12px] font-medium text-[#A9782F]">
            <Users size={13} strokeWidth={1.6} />
            {memory.tab_count + 1} family{' '}
            {memory.tab_count + 1 === 1
              ? 'perspective'
              : 'perspectives'}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-5 py-3 border-t border-[#F0EBE3] flex items-center gap-5">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#17120E]">
          <Heart
            size={16}
            strokeWidth={1.6}
            className="text-[#C8A557]"
            fill={memory.reaction_count > 0 ? '#C8A557' : 'none'}
          />
          {memory.reaction_count}
        </span>
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#17120E]">
          <MessageCircle
            size={16}
            strokeWidth={1.6}
            className="text-[#8B7355]"
          />
          {memory.comment_count}
        </span>
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
  if (diffMins < 60)
    return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}