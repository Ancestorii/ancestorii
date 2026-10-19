import type { LucideIcon } from 'lucide-react';
import {
  Heart,
  HelpCircle,
  ImageIcon,
  LockOpen,
  MessageCircle,
  PenLine,
  Share2,
  Users,
} from 'lucide-react';

// Wording and dates are ported unchanged from src/components/stories/notifications/NotificationItem.tsx
// (the dashboard top bar's own list, restyled in the same look with the same wording). Each kind of
// notification gets an icon tile in one of the landing colours.

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
  const quoted = storyTitle ? `"${storyTitle.slice(0, 30)}${storyTitle.length > 30 ? '…' : ''}"` : null;
  const title = quoted ?? fallback;
  // "your memory" already names it when the memory has no title (or is gone): no "your memory your memory".
  const yourMemory = quoted ? `your memory ${quoted}` : 'your memory';

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
      return { Icon: Heart, tone: 'pink', message: `${name} loved ${yourMemory}` };
    case 'memory_comment':
      return { Icon: MessageCircle, tone: 'blue', message: `${name} commented on ${yourMemory}` };
    case 'memory_addition':
      return { Icon: PenLine, tone: 'orange', message: `${name} added their memory to ${title}` };
    case 'prompt_answered':
      return { Icon: HelpCircle, tone: 'blue', message: `${name} answered your question` };
    case 'prompt_received':
      return { Icon: HelpCircle, tone: 'blue', message: `${name} asked you a question` };

    // ── Capsules ──
    case 'capsule_unlocked':
      return {
        Icon: LockOpen,
        tone: 'pink',
        message: quoted ? `Your capsule ${quoted} is ready to open` : 'A capsule is ready to open',
      };

    default:
      return { Icon: Heart, tone: 'ink', message: `${name} interacted with ${title}` };
  }
}

// Memory notifications carry the memory in target_id (target_type 'family_memory').
const MEMORY_TYPES = ['memory_reaction', 'memory_comment', 'memory_addition', 'prompt_answered'];

/**
 * Where a notification leads, apart from story notifications (those need the story's slug, which
 * the caller looks up from story_id). Null when there is nowhere to go.
 */
export function notificationHref(type: string, targetId: string | null): string | null {
  if (MEMORY_TYPES.includes(type) && targetId) return `/dashboard/memories/${targetId}`;
  switch (type) {
    case 'capsule_unlocked':
      return targetId ? `/dashboard/capsules/${targetId}` : '/dashboard/capsules';
    case 'family_member_joined':
      return '/dashboard/our-family';
    case 'family_photo_added':
      return '/dashboard/library';
    case 'welcome':
      return '/dashboard/home';
    // prompt_received: the question is answered from its link, and no page lists them yet.
    default:
      return null;
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
