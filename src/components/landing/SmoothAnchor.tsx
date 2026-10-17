'use client';

import type { MouseEvent, ReactNode } from 'react';

/**
 * An in-page link that glides to its section (jumps with reduced motion) and moves focus to the
 * section's heading, so keyboard and screen-reader users land where they asked to go too. Each
 * jump adds a history entry, so Back returns to where the link was.
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
    // Pushed before scrolling: the browser keeps the entry's scroll position as it changes, so an
    // instant jump made first would be saved over the spot Back should return to.
    history.pushState(null, '', href);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    // The section's h2 comes first; the Capsules column has only its h3.
    const heading = target.querySelector<HTMLElement>('h2, h3') ?? target;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  };

  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
