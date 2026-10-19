'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import landing from '@/components/landing/landing.module.css';

/**
 * Renders its children at the page root (SiteShell's landing root) instead of inside
 * <main>, which has its own stacking context below the nav. Fixed menus and dialogs then
 * sit above everything while keeping the page's typeface and colour tokens.
 */
export default function StoryLayer({ children }: { children: ReactNode }) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  // Found as the layer first renders (it only ever renders in the browser, after a click), so
  // its children mount in the same commit as the state that opened them and a dialog hook on
  // them finds its element. The anchor then confirms the root nearest this page's own markup.
  const [host, setHost] = useState<HTMLElement | null>(() =>
    typeof document === 'undefined'
      ? null
      : document.querySelector<HTMLElement>(`.${landing.page}`) ?? document.body
  );

  useEffect(() => {
    const own = anchorRef.current?.closest<HTMLElement>(`.${landing.page}`) ?? document.body;
    if (own !== host) setHost(own);
  }, [host]);

  return (
    <>
      <span ref={anchorRef} hidden />
      {host && createPortal(children, host)}
    </>
  );
}
