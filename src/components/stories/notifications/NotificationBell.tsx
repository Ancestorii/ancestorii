'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { getUnreadNotificationCount } from '@/lib/stories/queries';
import NotificationDropdown from './NotificationDropdown';
import styles from './notifications.module.css';

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

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

  // Escape closes the panel and hands focus back to the bell (while focus is in the panel, or
  // after it dropped to the page; a dialog opened over it keeps its own Escape).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      const focused = document.activeElement;
      if (focused && focused !== document.body && !rootRef.current?.contains(focused)) return;
      setOpen(false);
      bellRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={bellRef}
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
