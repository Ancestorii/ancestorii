'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';
import type { PageLink } from '@/lib/seo/pages';
import f from './footer.module.css';

// One group of footer links. On phones it folds (a native <details>, closed until tapped),
// from 600px it is always open and the heading is plain text. The server renders it open, so
// desktop never flashes closed; phones close it right after hydration, well before the footer
// scrolls into view.
export default function FooterGroup({
  title,
  links,
  dot = 'var(--c0)',
  compact = false,
}: {
  title: string;
  links: PageLink[];
  dot?: string;
  compact?: boolean;
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
    <details
      className={`${f.group} ${compact ? f.groupCompact : ''}`}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      style={{ '--dot': dot } as CSSProperties}
    >
      <summary className={f.groupHead}>
        <span className={f.groupDot} aria-hidden="true" />
        <span className={f.groupTitle}>{title}</span>
        <ChevronDown className={f.groupChevron} size={18} strokeWidth={2.5} aria-hidden="true" />
      </summary>
      <ul className={f.groupList}>
        {links.map((link) => (
          <li key={link.href}>
            {/* Our Stories pages are rendered per request, so a prefetch brings nothing back. */}
            <Link
              href={link.href}
              prefetch={link.href.startsWith('/stories') ? false : undefined}
              className={f.link}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
