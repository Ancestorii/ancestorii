'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { getRecentNotifications } from '@/lib/stories/queries';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/stories/mutations';
import type { Notification } from '@/lib/stories/types';
import NotificationItem from './NotificationItem';
import styles from './notifications.module.css';

const MEMORY_TYPES = ['memory_reaction', 'memory_comment', 'memory_addition', 'prompt_answered'];

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      const supabase = getBrowserClient();
      const data = await getRecentNotifications(supabase, 20);
      setNotifications(data);
      setLoading(false);
    };

    load();
  }, [open]);

  const handleClick = async (notification: Notification) => {
    if (!notification.is_read) {
      const supabase = getBrowserClient();
      await markNotificationRead(supabase, notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
      onCountUpdate(notifications.filter((n) => !n.is_read && n.id !== notification.id).length);
    }

    // ── Memory notifications → navigate to memory page ──
    if (MEMORY_TYPES.includes(notification.type) && notification.target_id) {
      router.push(`/dashboard/memories/${notification.target_id}`);
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
            <div className={styles.loading}>
              <span className={styles.spinner} aria-hidden="true" />
            </div>
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
                  storyTitle={(n as any).story_title}
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
