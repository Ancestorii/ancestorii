'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

// The pink bar along the top of the page while the next page loads.
//
// It starts when a link to another page on this site is pressed (any <a>, including
// next/link, caught at the document so no component has to opt in) and when code
// calls NProgress.start() itself (the dashboard sidebar does), and it finishes the
// moment the new route has rendered: usePathname/useSearchParams change only once the
// new page is on screen. A navigation that never lands (a cancelled fetch, an error
// page that keeps the URL) is closed by a safety timer, so the bar never runs forever.
//
// Styled in app/globals.css (#nprogress). Mounted once, in the root layout.

const SAFETY_MS = 8000;

NProgress.configure({ showSpinner: false, trickleSpeed: 160, minimum: 0.1, speed: 220 });

function isModifiedClick(e: MouseEvent) {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
}

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timer = useRef<number | null>(null);

  // A new route has rendered: finish.
  useEffect(() => {
    NProgress.done();
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const start = () => {
      NProgress.start();
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => NProgress.done(), SAFETY_MS);
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || isModifiedClick(e)) return;
      const anchor = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Same page: a hash link, or a link to where we already are.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      start();
    };

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return null;
}
