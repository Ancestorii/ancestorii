'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './landing.module.css';

// Detail that phones can skip. From 600px the content is simply there, as before; on a phone it
// sits behind a small outline button ("What you can do") so a section reads headline, picture,
// one line, and the rest is a tap away. A native <details>, so it works before hydration too:
// the server renders it open and phones close it right after hydration, before it scrolls in.
export default function Fold({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 599px)');
    const apply = () => setOpen(!mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return (
    <details className={`${styles.fold} ${className}`} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className={styles.foldSummary}>
        <span>{label}</span>
        <ChevronDown className={styles.foldChevron} size={18} strokeWidth={2.6} aria-hidden="true" />
      </summary>
      <div className={styles.foldBody}>{children}</div>
    </details>
  );
}
