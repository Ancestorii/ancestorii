'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { getUnreadNotificationCount } from '@/lib/stories/queries';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = getBrowserClient();
      const c = await getUnreadNotificationCount(supabase);
      setCount(c);
    };

    load();

    // Poll every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-[36px] w-[36px] items-center justify-center rounded-full transition hover:bg-[#F5F0E8]"
      >
        <Bell size={18} className="text-[#6F6255]" strokeWidth={1.8} />

        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#C8A557] px-1 text-[10px] font-bold text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      <NotificationDropdown
        open={open}
        onClose={() => setOpen(false)}
        onCountUpdate={setCount}
      />
    </div>
  );
}