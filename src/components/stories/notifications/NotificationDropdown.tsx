'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { getRecentNotifications } from '@/lib/stories/queries';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/stories/mutations';
import { notificationHref } from '@/components/site/stories-bar/notificationMeta';
import type { Notification } from '@/lib/stories/types';
import NotificationItem from './NotificationItem';
import { AppLoader } from '@/components/dashboard/ui/AppBits';
import styles from './notifications.module.css';

export default function NotificationDropdown({
  open,
  onClose,
  onCountUpdate,
}: {
  open: boolean;
  onClose: () => void;
  onCountUpdate: (count: number) => void;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<
    (Notification & { story_title?: string | null })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const loadedOnce = useRef(false);

  // Each time the panel opens. The loader shows only the first time; after that the list already
  // on screen stays while the fresh one arrives.
  useEffect(() => {
    if (!open) return;

    const load = async () => {
      if (!loadedOnce.current) setLoading(true);
      const supabase = getBrowserClient();
      const data = await getRecentNotifications(supabase, 20);
      loadedOnce.current = true;
      setNotifications(data);
      setLoading(false);
    };

    load();
  }, [open]);

  const handleClick = async (notification: Notification) => {
    if (!notification.is_read) {
      // Marked read in the background: the click goes where it is going at once.
      const supabase = getBrowserClient();
      markNotificationRead(supabase, notification.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
      onCountUpdate(Math.max(0, notifications.filter((n) => !n.is_read).length - 1));
    }

    // ── Memory, capsule and family notifications → their page ──
    const href = notificationHref(notification.type, notification.target_id);
    if (href) {
      router.push(href);
      onClose();
      return;
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
        onClose();
      }
    }
  };

  const handleMarkAllRead = async () => {
    const supabase = getBrowserClient();
    await markAllNotificationsRead(supabase);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    onCountUpdate(0);
  };

  if (!open) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Dropdown */}
      <div className={styles.panel} role="region" aria-label="Notifications">
        {/* Header */}
        <div className={styles.head}>
          <p className={styles.title}>Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className={styles.markAll}
            >
              <Check size={14} strokeWidth={3} aria-hidden="true" />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className={styles.body} aria-busy={loading}>
          {loading ? (
            <AppLoader compact label="Loading notifications" />
          ) : notifications.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden="true">
                <Bell size={24} strokeWidth={2.4} />
              </span>
              <p className={styles.emptyText}>No notifications yet</p>
            </div>
          ) : (
            <div className={styles.list}>
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  type={n.type}
                  actorName={n.actor_name}
                  storyTitle={n.story_title}
                  isRead={n.is_read}
                  createdAt={n.created_at}
                  onClick={() => handleClick(n)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
