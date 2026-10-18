'use client';

import { useEffect } from 'react';

/**
 * Keeps the page from jumping sideways when a dialog locks scrolling.
 *
 * Every drawer, sheet and modal locks the page with `document.body.style.overflow = 'hidden'`
 * (a few lock `document.documentElement` too). Where the scrollbar takes up room (Windows, and
 * Macs set to always show scrollbars) that lock removes it, the page widens by its width, and
 * everything shifts as the box opens and shifts back as it closes: the "flash" around dialogs.
 *
 * This watches for those locks and, for as long as one is on, reserves the scrollbar's gutter
 * (`scrollbar-gutter: stable` on <html>) so the page width never changes. It does so only when
 * the page actually had a scrollbar, so a short page is not pushed sideways instead. Mounted once
 * in the root layout; dialogs need no change of their own. A dialog that already pads the body
 * itself (the landing's menu) is left alone.
 */
export default function ScrollLockGutter() {
  useEffect(() => {
    if (typeof MutationObserver === 'undefined') return;
    const html = document.documentElement;
    const body = document.body;

    // Width of a classic scrollbar on this system: 0 where scrollbars are overlays (phones,
    // most Macs), and then there is nothing to compensate.
    const probe = document.createElement('div');
    probe.style.cssText =
      'position:absolute;top:-9999px;left:0;width:100px;height:100px;overflow:scroll;visibility:hidden;pointer-events:none';
    body.appendChild(probe);
    const scrollbarWidth = probe.offsetWidth - probe.clientWidth;
    body.removeChild(probe);
    if (scrollbarWidth === 0) return;

    let wasLocked = false;
    let reserved = false;

    const sync = () => {
      const locked =
        getComputedStyle(body).overflowY === 'hidden' || getComputedStyle(html).overflowY === 'hidden';
      if (locked === wasLocked) return;
      wasLocked = locked;

      if (locked) {
        // Decided once per lock: the page had a scrollbar when its content was taller than the
        // viewport (overflow: hidden still reports the full height).
        if (!body.style.paddingRight && html.scrollHeight > html.clientHeight) {
          html.style.scrollbarGutter = 'stable';
          reserved = true;
        }
      } else if (reserved) {
        html.style.scrollbarGutter = '';
        reserved = false;
      }
    };

    const observer = new MutationObserver(sync);
    observer.observe(body, { attributes: true, attributeFilter: ['style', 'class'] });
    observer.observe(html, { attributes: true, attributeFilter: ['style', 'class'] });

    return () => {
      observer.disconnect();
      if (reserved) html.style.scrollbarGutter = '';
    };
  }, []);

  return null;
}
