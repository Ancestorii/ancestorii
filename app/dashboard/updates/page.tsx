'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { motion } from 'framer-motion';
import { Megaphone, Star, Trash2 } from 'lucide-react';
import { safeToast as toast } from '@/lib/safeToast';

type Update = {
  id: string;
  title: string;
  content: string;
  user_id: string | null;
  created_at: string;
  type?: string;
};

export default function UpdatesPage() {
  const supabase = getBrowserClient();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // ✅ Load updates from Supabase
  const fetchUpdates = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'update')
      .order('created_at', { ascending: false });

    if (!error && data) setUpdates(data as Update[]);
    setLoading(false);
  };

  // ✅ Delete a notification
  const deleteUpdate = async (id: string) => {
    // Optimistic update (remove locally first)
    setUpdates((prev) => prev.filter((item) => item.id !== id));

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

  // ✅ Realtime subscription
  useEffect(() => {
    if (!userId) return;
    fetchUpdates();

    const channel = supabase
      .channel('updates-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newUpdate = payload.new as Update;

          if (newUpdate.user_id === userId && newUpdate.type === 'update') {
            setUpdates((prev) => [newUpdate, ...prev]);
            toast.success(`${newUpdate.title} — ${newUpdate.content}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="p-12">
      {/* 🌟 Header */}
      <div className="flex items-center gap-4 mb-14">
        <Megaphone className="w-9 h-9 text-[#D4AF37]" />
        <h1 className="text-4xl font-bold text-[#0F2040]">My Updates</h1>
      </div>

      {/* 📰 Updates List */}
      {loading ? (
        <p className="text-gray-500 text-lg">Loading updates...</p>
      ) : updates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-600 text-base">
            No updates found. Once you or your family post updates, they’ll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8 mb-20">
          {updates.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-8 rounded-3xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-2xl font-semibold text-[#0F2040]">{item.title}</h2>
                  <span className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => deleteUpdate(item.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 leading-relaxed text-base">{item.content}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* 🕓 Coming Soon Section */}
      <div className="mt-16">
        <div className="flex items-center gap-3 mb-6">
          <Star className="w-6 h-6 text-[#D4AF37]" />
          <h2 className="text-3xl font-bold text-[#0F2040]">Coming Soon</h2>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm max-w-3xl">
          <p className="text-gray-600 text-base leading-relaxed">
            This section will highlight upcoming features and improvements you’ll soon see inside Ancestorii.  
            It dynamically loads in real time from Supabase whenever new updates are added — no refresh needed.
          </p>
        </div>
      </div>
    </div>
  );
}
