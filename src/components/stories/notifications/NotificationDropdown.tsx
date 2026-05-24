'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { getRecentNotifications } from '@/lib/stories/queries';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/stories/mutations';
import type { Notification } from '@/lib/stories/types';
import NotificationItem from './NotificationItem';

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

    // Navigate to story if applicable
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
      <div className="fixed inset-0 z-[98]" onClick={onClose} />

      {/* Dropdown */}
      <div
        className="absolute right-0 top-full mt-2 z-[99] w-[380px] max-h-[480px] overflow-hidden rounded-[16px] border bg-white shadow-[0_24px_60px_rgba(22,18,12,0.15)]"
        style={{ borderColor: '#EAD8B8' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#EAD8B8' }}>
          <p className="text-[13px] font-bold text-[#17120E]">Notifications</p>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-[12px] font-medium text-[#A9782F] transition hover:text-[#8A6324]"
            >
              <Check size={12} strokeWidth={2} />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[400px] overflow-y-auto" data-lenis-prevent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#DCC7A4] border-t-[#C8A557]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[14px] text-[#9B8E7D]">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                type={n.type}
                actorName={n.actor_name}
                storyTitle={(n as any).story_title}
                isRead={n.is_read}
                createdAt={n.created_at}
                onClick={() => handleClick(n)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}