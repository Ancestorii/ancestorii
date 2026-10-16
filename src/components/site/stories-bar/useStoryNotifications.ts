'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';
import { getRecentNotifications, getUnreadNotificationCount } from '@/lib/stories/queries';
import { markAllNotificationsRead, markNotificationRead } from '@/lib/stories/mutations';
import type { Notification } from '@/lib/stories/types';

export type StoryNotification = Notification & { story_title?: string | null };

const MEMORY_TYPES = ['memory_reaction', 'memory_comment', 'memory_addition', 'prompt_answered'];

/**
 * The data side of the bell, ported unchanged from NotificationBell and NotificationDropdown
 * (src/components/stories/notifications, still used by PublicNav): the unread count on load and
 * every 30 seconds, the 20 most recent notifications each time the panel opens, mark as read,
 * mark all read, and the click-through to the memory or story.
 */
export function useStoryNotifications(enabled: boolean) {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<StoryNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const load = async () => {
      const supabase = getBrowserClient();
      const c = await getUnreadNotificationCount(supabase);
      setCount(c);
    };

    load();

    // Poll every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [enabled]);

  // Called each time the panel opens.
  const loadRecent = useCallback(async () => {
    setLoading(true);
    const supabase = getBrowserClient();
    const data = await getRecentNotifications(supabase, 20);
    setNotifications(data);
    setLoading(false);
  }, []);

  // Resolves to true when it navigated away, so the panel can close.
  const select = async (id: string): Promise<boolean> => {
    const notification = notifications.find((n) => n.id === id);
    if (!notification) return false;

    if (!notification.is_read) {
      const supabase = getBrowserClient();
      await markNotificationRead(supabase, notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
      setCount(notifications.filter((n) => !n.is_read && n.id !== notification.id).length);
    }

    // ── Memory notifications → navigate to memory page ──
    if (MEMORY_TYPES.includes(notification.type) && notification.target_id) {
      router.push(`/dashboard/memories/${notification.target_id}`);
      return true;
    }

    // ── Story notifications → navigate to story page ──
    if (notification.story_id) {
      const supabase = getBrowserClient();
      const { data: story } = await supabase
        .from('stories')
        .select('slug')
        .eq('id', notification.story_id)
        .maybeSingle();

      if (story?.slug) {
        router.push(`/stories/${story.slug}`);
        return true;
      }
    }

    return false;
  };

  const markAllRead = async () => {
    const supabase = getBrowserClient();
    await markAllNotificationsRead(supabase);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setCount(0);
  };

  return { count, notifications, loading, loadRecent, select, markAllRead };
}
