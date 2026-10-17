'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import css from './legal.module.css';

export type TocGroup = {
  /** Group heading, e.g. "Part A"; leave out for a group without one. */
  label?: string;
  /** Anchor the heading links to, e.g. "#part-a". */
  href?: string;
  /** Colour of the heading's square. */
  dot?: string;
  items: { num: string; title: string }[];
};

/**
 * Sticky table of contents for the long legal pages (wide screens only). Every entry is a
 * plain anchor to the section's id, so it works without JavaScript; once mounted it also
 * marks the section being read and keeps that entry in view inside its own scroll box.
 */
export default function LegalToc({ groups, label }: { groups: TocGroup[]; label: string }) {
  const [active, setActive] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Track which section has passed the reading line (a third of the way down the screen).
  useEffect(() => {
    const sections = groups
      .flatMap((group) => group.items.map((item) => document.getElementById(`section-${item.num}`)))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      // Hidden below the wide breakpoint: nothing to mark.
      if (!boxRef.current || boxRef.current.offsetParent === null) return;
      const line = Math.min(window.innerHeight * 0.3, 240);
      let current: string | null = null;
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [groups]);

  // Keep the marked entry visible when the list is taller than the screen
  // (and go back to the start of the list above the first section).
  useEffect(() => {
    const box = boxRef.current;
    if (!box || box.scrollHeight <= box.clientHeight) return;
    // A keyboard user's focused entry wins: the browser has scrolled it into view,
    // and moving the list now would leave the focus ring out of sight.
    const focused = document.activeElement;
    if (focused && box.contains(focused)) {
      let keyboard = true;
      try {
        keyboard = focused.matches(':focus-visible');
      } catch {
        // Older browsers without :focus-visible: treat any focus as keyboard focus.
      }
      if (keyboard) return;
    }
    if (!active) {
      box.scrollTop = 0;
      return;
    }
    const link = box.querySelector<HTMLElement>(`a[href="#${active}"]`);
    if (!link) return;
    const boxTop = box.getBoundingClientRect().top;
    const top = link.getBoundingClientRect().top - boxTop + box.scrollTop;
    const bottom = top + link.offsetHeight;
    const pad = 48;
    if (top - pad < box.scrollTop) box.scrollTop = Math.max(0, top - pad);
    else if (bottom + pad > box.scrollTop + box.clientHeight) box.scrollTop = bottom + pad - box.clientHeight;
  }, [active]);

  return (
    <nav className={css.toc} aria-label={label}>
      <div ref={boxRef} className={css.tocScroll}>
        {groups.map((group, gi) => (
          <div key={group.label ?? gi} className={css.tocGroup}>
            {group.label && group.href && (
              <a href={group.href} className={css.tocPart} style={{ '--dot': group.dot } as CSSProperties}>
                {group.label}
              </a>
            )}
            <ol className={css.tocList}>
              {group.items.map((item) => {
                const id = `section-${item.num}`;
                const isActive = active === id;
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className={`${css.tocLink} ${isActive ? css.tocActive : ''}`}
                      aria-current={isActive ? 'location' : undefined}
                    >
                      <span className={css.tocNum}>{item.num}.</span>{' '}
                      <span>{item.title}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </nav>
  );
}
