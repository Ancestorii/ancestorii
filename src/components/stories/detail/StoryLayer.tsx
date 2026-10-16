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
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHost(anchorRef.current?.closest<HTMLElement>(`.${landing.page}`) ?? document.body);
  }, []);

  return (
    <>
      <span ref={anchorRef} hidden />
      {host && createPortal(children, host)}
    </>
  );
}
