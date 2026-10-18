'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './landing.module.css';

const PHONE = '(max-width: 599px)';

// Runs as the HTML is parsed, before anything is painted: on a phone it closes the <details> the
// server sent open, so the first paint already shows the fold shut. Without JavaScript it never
// runs, and the content simply stays open and readable.
const CLOSE_ON_PHONES = `var s=document.currentScript;if(s&&matchMedia('${PHONE}').matches)s.parentElement.removeAttribute('open')`;

// Detail that phones can skip. From 600px the content is simply there, as before; on a phone it
// sits behind a small outline button ("What you can do") so a section reads headline, picture,
// one line, and the rest is a tap away. A native <details>: the server renders it open (it can't
// know the screen), the inline script closes it on phones before the first paint, and a render
// that starts in the browser starts closed on phones, so it never jumps shut after hydration.
export default function Fold({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  // Open in the HTML; in the browser, by screen width.
  const [open, setOpen] = useState(() => typeof window === 'undefined' || !window.matchMedia(PHONE).matches);

  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    // Start from what the page shows: the script closed it, or the reader has already tapped it.
    if (ref.current) setOpen(ref.current.open);
    const apply = () => setOpen(!mq.matches);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return (
    // suppressHydrationWarning: on a phone the HTML's `open` is already gone when React hydrates
    // (the script above), which React would otherwise report; it changes nothing in the DOM for it.
    <details
      ref={ref}
      className={`${styles.fold} ${className}`}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      suppressHydrationWarning
    >
      <summary className={styles.foldSummary}>
        <span>{label}</span>
        <ChevronDown className={styles.foldChevron} size={18} strokeWidth={2.6} aria-hidden="true" />
      </summary>
      <div className={styles.foldBody}>{children}</div>
      <script dangerouslySetInnerHTML={{ __html: CLOSE_ON_PHONES }} />
    </details>
  );
}
