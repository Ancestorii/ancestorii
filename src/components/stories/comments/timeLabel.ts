'use client';

import { useSyncExternalStore } from 'react';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// One fixed zone, so a date prints the same on the server and in every reader's browser.
const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/London',
};

/** The comment's date alone, e.g. "18 Oct 2026". */
export function formatAbsolute(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', DATE_FORMAT);
}

/**
 * "Just now", "5m ago", "3h ago", "Yesterday", "4 days ago", then the date. Counted from `now`,
 * so a server and a browser given the same `now` print the same text.
 */
export function formatRelative(dateString: string, now: number): string {
  const date = new Date(dateString);
  const diff = now - date.getTime();
  const mins = Math.floor(diff / MINUTE);
  const hours = Math.floor(diff / HOUR);
  const days = Math.floor(diff / DAY);
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-GB', DATE_FORMAT);
}

const subscribe = () => () => {};
// False while React is matching the server's HTML, true from the first client render after it
// (and from the start for anything mounted later). No effect, no state, no flash.
const useHydrated = () => useSyncExternalStore(subscribe, () => true, () => false);

/**
 * The text for a comment's time. With `now` (the moment the page was rendered on the server) the
 * relative label is worked out the same way on both sides, so the HTML and the first client
 * render agree. Without it, the server prints the plain date and the browser switches to
 * "3h ago" as soon as it has hydrated, changing only that text.
 */
export function useTimeLabel(dateString: string, now?: number): string {
  const hydrated = useHydrated();
  if (now !== undefined) return formatRelative(dateString, now);
  return hydrated ? formatRelative(dateString, Date.now()) : formatAbsolute(dateString);
}
