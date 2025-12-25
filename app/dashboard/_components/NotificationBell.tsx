'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/browser';
import { motion, AnimatePresence } from 'framer-motion';
import { safeToast as toast } from '@/lib/safeToast';

type Notification = {
  id: string;
  title: string;
  content: string;
  read: boolean;
  created_at: string;
  user_id?: string;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /* ---------- Fetch current user ---------- */
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  /* ---------- Fetch latest notifications ---------- */
  const fetchNotifications = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setNotifications(data);
      setHasUnread(data.some((n) => !n.read));
    }
  };

  /* ---------- Realtime updates ---------- */
  useEffect(() => {
    if (!userId) return;
    fetchNotifications();

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotif = payload.new as Notification;
          if (newNotif.user_id !== userId) return;

          setNotifications((prev) => [newNotif, ...prev]);
          setHasUnread(true);
          toast.success(`${newNotif.title || 'New notification'} — ${newNotif.content}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  /* ---------- Mark notifications ---------- */
  const markAllAsRead = async () => {
    if (!userId) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    fetchNotifications();
  };

  const markOneAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setHasUnread(notifications.some((n) => !n.read && n.id !== id));
  };

  /* ---------- Delete notification ---------- */
  const deleteNotification = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error(error);
      toast.error('Failed to delete notification.');
    } else {
      toast.success('Notification deleted.');
    }
  };

  /* ---------- Close dropdown on outside click ---------- */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md hover:bg-[#D4AF37]/10 transition-all relative"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-[#0F2040] transition-transform duration-300 hover:text-[#D4AF37] hover:rotate-12" />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-[#D4AF37]" />
        )}
      </button>

      {/* 🔽 Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-3 w-80 bg-white shadow-2xl rounded-2xl border border-gray-200 z-50 p-3"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-[#0F2040]">Notifications</h3>
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#D4AF37] hover:underline"
              >
                Mark all as read
              </button>
            </div>

            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-2">
                No notifications yet.
              </p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <motion.li
                    key={n.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => markOneAsRead(n.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-300 relative ${
                      n.read
                        ? 'bg-gray-50 hover:bg-gray-100'
                        : 'bg-[#fff8e1] border-l-4 border-[#D4AF37] hover:bg-[#fff1c1]'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-[#0F2040]">{n.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{n.content}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>

                      {/* 🗑️ Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n.id);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}

            {/* 👇 Always visible View All link */}
            <div className="mt-3 text-center border-t border-gray-200 pt-2">
              <Link
                href="/dashboard/updates"
                className="text-xs font-semibold text-[#D4AF37] hover:underline"
                onClick={() => setOpen(false)}
              >
                View all updates →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
