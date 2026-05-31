'use client';

import { Heart, MessageCircle, Share2, Users, ImageIcon, PenLine, HelpCircle } from 'lucide-react';

export default function NotificationItem({
  type,
  actorName,
  storyTitle,
  isRead,
  createdAt,
  onClick,
}: {
  type: string;
  actorName: string | null;
  storyTitle?: string | null;
  isRead: boolean;
  createdAt: string;
  onClick: () => void;
}) {
  const { icon, bg, message } = getNotificationMeta(type, actorName, storyTitle);

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-[#FAF4EA] ${
        !isRead ? 'bg-[#FFFCF5]' : ''
      }`}
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] mt-0.5"
        style={{ background: bg }}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-[13px] leading-snug ${!isRead ? 'font-semibold text-[#17120E]' : 'text-[#6F6255]'}`}>
          {message}
        </p>
        <p className="mt-0.5 text-[11px] text-[#9B8E7D]">
          {formatRelative(createdAt)}
        </p>
      </div>

      {!isRead && (
        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#C8A557]" />
      )}
    </button>
  );
}

function getNotificationMeta(type: string, actorName: string | null, storyTitle?: string | null) {
  const name = actorName || 'Someone';
  const isMemoryType = ['memory_reaction', 'memory_comment', 'memory_addition'].includes(type);
  const fallback = isMemoryType ? 'your memory' : 'your story';
  const title = storyTitle ? `"${storyTitle.slice(0, 30)}${storyTitle.length > 30 ? '…' : ''}"` : fallback;

  switch (type) {
    // ── Existing public story types ──
    case 'story_like':
      return {
        icon: <Heart size={14} className="text-[#C8A557]" strokeWidth={1.8} />,
        bg: '#F5EDD8',
        message: `${name} loved ${title}`,
      };
    case 'story_comment':
      return {
        icon: <MessageCircle size={14} className="text-[#8B7355]" strokeWidth={1.8} />,
        bg: '#F0E8D8',
        message: `${name} commented on ${title}`,
      };
    case 'story_share':
      return {
        icon: <Share2 size={14} className="text-[#A9782F]" strokeWidth={1.8} />,
        bg: '#F5EDD8',
        message: `${name} shared ${title}`,
      };

    // ── Existing family types ──
    case 'family_photo_added':
      return {
        icon: <ImageIcon size={14} className="text-[#7C8B6A]" strokeWidth={1.8} />,
        bg: '#EEF0E8',
        message: `${name} added a photo to the family library`,
      };
    case 'family_member_joined':
      return {
        icon: <Users size={14} className="text-[#A06A1C]" strokeWidth={1.8} />,
        bg: '#FEF3C7',
        message: `${name} joined your family library`,
      };
    case 'welcome':
      return {
        icon: <Heart size={14} className="text-[#C8A557]" strokeWidth={1.8} />,
        bg: '#F5EDD8',
        message: 'Welcome to Ancestorii! Write your first memory, then ask your family a question.',
      };

    // ── NEW: Private memory types ──
    case 'memory_reaction':
      return {
        icon: <Heart size={14} className="text-[#C8A557]" strokeWidth={1.8} />,
        bg: '#F5EDD8',
        message: `${name} loved your memory ${title}`,
      };
    case 'memory_comment':
      return {
        icon: <MessageCircle size={14} className="text-[#8B7355]" strokeWidth={1.8} />,
        bg: '#F0E8D8',
        message: `${name} commented on your memory ${title}`,
      };
    case 'memory_addition':
      return {
        icon: <PenLine size={14} className="text-[#A9782F]" strokeWidth={1.8} />,
        bg: '#F5EDD8',
        message: `${name} added their memory to ${title}`,
      };
    case 'prompt_answered':
      return {
        icon: <HelpCircle size={14} className="text-[#A9782F]" strokeWidth={1.8} />,
        bg: '#F5EDD8',
        message: `${name} answered your question`,
      };
    case 'prompt_received':
      return {
        icon: <HelpCircle size={14} className="text-[#A9782F]" strokeWidth={1.8} />,
        bg: '#F5EDD8',
        message: `${name} asked you a question`,
      };

    default:
      return {
        icon: <Heart size={14} className="text-[#9B8E7D]" strokeWidth={1.8} />,
        bg: '#F0EBE2',
        message: `${name} interacted with ${title}`,
      };
  }
}

function formatRelative(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}