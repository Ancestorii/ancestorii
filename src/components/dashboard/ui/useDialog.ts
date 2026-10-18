'use client';

import { useEffect, useRef } from 'react';

// Open dialogs, the top one last: only the top one answers Escape and keeps Tab inside it,
// so a confirm opened over a drawer closes on its own.
const stack: HTMLElement[] = [];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), audio[controls], video[controls], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/**
 * Keyboard behaviour for a drawer, sheet or modal. While `open` is true: focus moves to the
 * panel itself (not its first field, so a phone keyboard doesn't pop up), Tab and Shift+Tab
 * stay inside it, and Escape calls `onClose`. When it closes, focus goes back to whatever had
 * it before (the button that opened it). Put the returned ref on the panel element, next to
 * its role="dialog" and aria-modal.
 */
export function useDialog<T extends HTMLElement = HTMLDivElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const panel = ref.current;
    if (!panel) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    stack.push(panel);
    if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1');
    // The kit drops the browser's ring around the panel itself (its controls keep theirs).
    panel.setAttribute('data-app-dialog', '');
    if (!panel.contains(document.activeElement)) panel.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== panel) return;

      if (e.key === 'Escape') {
        // A field inside that uses Escape for its own job (a menu, a combobox) calls
        // preventDefault, and the dialog stays open. React listens on the document too, before
        // this listener, so stopPropagation there would not reach us.
        if (e.defaultPrevented) return;
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
      );
      const active = document.activeElement;
      if (!items.length) {
        e.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (!panel.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const i = stack.lastIndexOf(panel);
      if (i >= 0) stack.splice(i, 1);
      if (previous && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open]);

  return ref;
}
