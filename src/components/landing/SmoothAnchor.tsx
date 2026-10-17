'use client';

import type { MouseEvent, ReactNode } from 'react';

/**
 * An in-page link that glides to its section (jumps with reduced motion) and moves focus to the
 * section's heading, so keyboard and screen-reader users land where they asked to go too.
 */
export default function SmoothAnchor({
  href,
  className,
  children,
}: {
  href: `#${string}`;
  className?: string;
  children: ReactNode;
}) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', href);
    const heading = target.querySelector<HTMLElement>('h2');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  };

  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
