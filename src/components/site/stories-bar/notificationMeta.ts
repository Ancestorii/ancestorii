import type { LucideIcon } from 'lucide-react';
import { Heart, HelpCircle, ImageIcon, MessageCircle, PenLine, Share2, Users } from 'lucide-react';

// Wording and dates are ported unchanged from src/components/stories/notifications/NotificationItem.tsx
// (which stays as it is for PublicNav). Only the look is new: each kind of notification gets an
// icon tile in one of the landing colours.

export type NotificationTone = 'pink' | 'blue' | 'orange' | 'aqua' | 'ink';

type NotificationMeta = { Icon: LucideIcon; tone: NotificationTone; message: string };

export function getNotificationMeta(
  type: string,
  actorName: string | null,
  storyTitle?: string | null
): NotificationMeta {
  const name = actorName || 'Someone';
  const isMemoryType = ['memory_reaction', 'memory_comment', 'memory_addition'].includes(type);
  const fallback = isMemoryType ? 'your memory' : 'your story';
  const title = storyTitle ? `"${storyTitle.slice(0, 30)}${storyTitle.length > 30 ? '…' : ''}"` : fallback;

  switch (type) {
    // ── Public story types ──
    case 'story_like':
      return { Icon: Heart, tone: 'pink', message: `${name} loved ${title}` };
    case 'story_comment':
      return { Icon: MessageCircle, tone: 'blue', message: `${name} commented on ${title}` };
    case 'story_share':
      return { Icon: Share2, tone: 'aqua', message: `${name} shared ${title}` };

    // ── Family types ──
    case 'family_photo_added':
      return { Icon: ImageIcon, tone: 'orange', message: `${name} added a photo to the family library` };
    case 'family_member_joined':
      return { Icon: Users, tone: 'aqua', message: `${name} joined your family library` };
    case 'welcome':
      return {
        Icon: Heart,
        tone: 'pink',
        message: 'Welcome to Ancestorii! Write your first memory, then ask your family a question.',
      };

    // ── Private memory types ──
    case 'memory_reaction':
      return { Icon: Heart, tone: 'pink', message: `${name} loved your memory ${title}` };
    case 'memory_comment':
      return { Icon: MessageCircle, tone: 'blue', message: `${name} commented on your memory ${title}` };
    case 'memory_addition':
      return { Icon: PenLine, tone: 'orange', message: `${name} added their memory to ${title}` };
    case 'prompt_answered':
      return { Icon: HelpCircle, tone: 'blue', message: `${name} answered your question` };
    case 'prompt_received':
      return { Icon: HelpCircle, tone: 'blue', message: `${name} asked you a question` };

    default:
      return { Icon: Heart, tone: 'ink', message: `${name} interacted with ${title}` };
  }
}

export function formatRelative(dateString: string) {
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
