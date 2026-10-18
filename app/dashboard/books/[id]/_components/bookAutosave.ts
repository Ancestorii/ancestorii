'use client';

import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';

// The editor's autosave queue. A typed change (a page's heading or comment, the cover and
// spine) used to go to the database on every keystroke with its reply ignored: twenty requests
// for a twenty-letter word, finishing in any order, so an older value could land last. Here a
// change waits a moment, later changes to the same row merge into it, one request goes out, and
// its reply is checked (row security refuses silently: no error, no rows). Leaving the editor
// (Back to Books, closing the tab) sends whatever is still waiting.

type Table = 'memory_book_page_assets' | 'memory_books';
type Patch = Record<string, unknown>;
type Pending = { table: Table; id: string; patch: Patch; timer: number };

const pending = new Map<string, Pending>();
let accessToken: string | null = null;
let listening = false;

const SAVE_FAILED = 'Your change could not be saved. Check your connection and try again.';

async function send(entry: Pending): Promise<boolean> {
  const { data, error } = await getBrowserClient()
    .from(entry.table)
    .update(entry.patch)
    .eq('id', entry.id)
    .select('id');

  if (error || !data || data.length === 0) {
    console.error('BOOK AUTOSAVE FAILED:', entry.table, entry.id, error);
    toast.error(SAVE_FAILED);
    return false;
  }
  return true;
}

function flushEntry(key: string): Promise<boolean> {
  const entry = pending.get(key);
  if (!entry) return Promise.resolve(true);
  window.clearTimeout(entry.timer);
  pending.delete(key);
  return send(entry);
}

// The tab is closing: a keepalive fetch outlives the page, the Supabase client's request would
// not. The token was read (locally, no network) when the change was queued.
function flushOnPageHide() {
  if (!pending.size || !accessToken) return;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !anon) return;

  for (const entry of pending.values()) {
    window.clearTimeout(entry.timer);
    fetch(`${base}/rest/v1/${entry.table}?id=eq.${encodeURIComponent(entry.id)}`, {
      method: 'PATCH',
      keepalive: true,
      headers: {
        apikey: anon,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(entry.patch),
    }).catch(() => {});
  }
  pending.clear();
}

/** Queue a change to one row. Changes to the same row within `delay` ms merge into one request. */
export function queueBookWrite(table: Table, id: string, patch: Patch, delay = 400) {
  if (typeof window === 'undefined') return;

  if (!listening) {
    listening = true;
    window.addEventListener('pagehide', flushOnPageHide);
  }

  getBrowserClient()
    .auth.getSession()
    .then(({ data }) => {
      accessToken = data.session?.access_token ?? accessToken;
    });

  const key = `${table}:${id}`;
  const existing = pending.get(key);

  if (existing) {
    window.clearTimeout(existing.timer);
    existing.patch = { ...existing.patch, ...patch };
    existing.timer = window.setTimeout(() => void flushEntry(key), delay);
    return;
  }

  pending.set(key, {
    table,
    id,
    patch,
    timer: window.setTimeout(() => void flushEntry(key), delay),
  });
}

/** Send every waiting change now (the Save button, leaving the editor). True when all saved. */
export function flushBookWrites(): Promise<boolean> {
  const keys = [...pending.keys()];
  return Promise.all(keys.map(flushEntry)).then((results) => results.every(Boolean));
}
