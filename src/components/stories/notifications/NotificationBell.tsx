'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { getUnreadNotificationCount } from '@/lib/stories/queries';
import NotificationDropdown from './NotificationDropdown';
import styles from './notifications.module.css';

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
    <div className={styles.root}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={styles.bell}
        aria-expanded={open}
      >
        <Bell size={20} strokeWidth={2.4} aria-hidden="true" />
        <span className={styles.srOnly}>Notifications</span>

        {count > 0 && (
          <span className={styles.count}>
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
