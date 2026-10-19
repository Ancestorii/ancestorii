'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';
import { getRecentNotifications, getUnreadNotificationCount } from '@/lib/stories/queries';
import { markAllNotificationsRead, markNotificationRead } from '@/lib/stories/mutations';
import type { Notification } from '@/lib/stories/types';
import { notificationHref } from './notificationMeta';

export type StoryNotification = Notification & { story_title?: string | null };

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
  const loadedOnce = useRef(false);

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

  // Called each time the panel opens. The spinner shows only the first time; after that the
  // list already on screen stays while the fresh one arrives.
  const loadRecent = useCallback(async () => {
    if (!loadedOnce.current) setLoading(true);
    const supabase = getBrowserClient();
    const data = await getRecentNotifications(supabase, 20);
    loadedOnce.current = true;
    setNotifications(data);
    setLoading(false);
  }, []);

  // Resolves to true when it navigated away, so the panel can close.
  const select = async (id: string): Promise<boolean> => {
    const notification = notifications.find((n) => n.id === id);
    if (!notification) return false;

    if (!notification.is_read) {
      // Marked read in the background: the click goes where it is going at once.
      const supabase = getBrowserClient();
      markNotificationRead(supabase, notification.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
      setCount((c) => Math.max(0, c - 1));
    }

    // ── Memory, capsule and family notifications → their page ──
    const href = notificationHref(notification.type, notification.target_id);
    if (href) {
      router.push(href);
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
