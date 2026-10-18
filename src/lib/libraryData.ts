import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * The Library's data, shared by the Library page and the "My Library" picker.
 *
 * Signed URLs: Storage signs a path with a fresh token on every request, and a fresh token is a
 * new URL to the browser, so every visit downloaded every thumbnail again (and the pictures
 * popped in late, which reads as a flash). The URLs are kept here for most of their seven days,
 * in memory and in sessionStorage, so a path keeps one URL for the whole tab and the browser's
 * cache can do its job. A replaced file gets a new path, so nothing goes stale.
 *
 * Folders: the list (each folder with its count and its newest item as the cover) is one query,
 * kept per user, so the page and the picker show the last list at once and refresh it behind.
 */

export const LIBRARY_BUCKET = 'library-media';

const SIGN_SECONDS = 60 * 60 * 24 * 7;
// Reused for six days: a URL handed out is always good for another day at least.
const KEEP_MS = 6 * 24 * 60 * 60 * 1000;
const STORE_KEY = 'ancestorii:library:signed-urls';

type SignedEntry = { url: string; exp: number };

const signed = new Map<string, SignedEntry>();
let hydrated = false;

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return;
    const now = Date.now();
    const parsed = JSON.parse(raw) as Record<string, SignedEntry>;
    for (const [key, entry] of Object.entries(parsed)) {
      if (entry && typeof entry.url === 'string' && entry.exp > now) signed.set(key, entry);
    }
  } catch {
    // Private windows and blocked storage: the in-memory map is enough.
  }
}

function persist() {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(Object.fromEntries(signed)));
  } catch {
    // Full or blocked: the in-memory map is enough.
  }
}

/** Signed URLs for these paths, by path: cached ones at once, the rest signed in one request. */
export async function signLibraryPaths(
  supabase: SupabaseClient,
  bucket: string,
  paths: string[]
): Promise<Record<string, string>> {
  hydrate();
  const now = Date.now();
  const out: Record<string, string> = {};
  const missing: string[] = [];

  for (const path of new Set(paths)) {
    const entry = signed.get(`${bucket}/${path}`);
    if (entry && entry.exp > now) out[path] = entry.url;
    else missing.push(path);
  }

  if (missing.length > 0) {
    const { data } = await supabase.storage.from(bucket).createSignedUrls(missing, SIGN_SECONDS);
    (data ?? []).forEach((row, i) => {
      const path = row.path ?? missing[i];
      if (!row.signedUrl || !path) return;
      out[path] = row.signedUrl;
      signed.set(`${bucket}/${path}`, { url: row.signedUrl, exp: now + KEEP_MS });
    });
    persist();
  }

  return out;
}

/** After a delete: the files are gone, so their URLs go too. */
export function forgetLibraryPaths(bucket: string, paths: string[]) {
  let changed = false;
  for (const path of paths) changed = signed.delete(`${bucket}/${path}`) || changed;
  if (changed) persist();
}

export type LibraryFolderSummary = {
  id: string;
  name: string;
  description: string | null;
  folder_date: string | null;
  created_at: string;
  media_count: number;
  cover_url: string | null;
  cover_file_type: string | null;
};

const folderLists = new Map<string, LibraryFolderSummary[]>();

export function getCachedLibraryFolders(uid: string, bucket = LIBRARY_BUCKET) {
  return folderLists.get(`${uid}:${bucket}`) ?? null;
}

export function setCachedLibraryFolders(uid: string, folders: LibraryFolderSummary[], bucket = LIBRARY_BUCKET) {
  folderLists.set(`${uid}:${bucket}`, folders);
}

/**
 * Every folder the user can see, newest first, each with how many items it holds and its newest
 * item as the cover. One query (the count and the cover are embedded rows, counted and ordered by
 * PostgREST), then one signing request for whichever covers are not cached yet.
 */
export async function fetchLibraryFolders(
  supabase: SupabaseClient,
  uid: string,
  bucket = LIBRARY_BUCKET
): Promise<LibraryFolderSummary[]> {
  const { data, error } = await supabase
    .from('library_folders')
    .select(
      'id, name, description, folder_date, created_at, media:library_media(count), cover:library_media(file_path, file_type)'
    )
    .order('created_at', { ascending: false })
    .order('created_at', { referencedTable: 'cover', ascending: false })
    .limit(1, { referencedTable: 'cover' });

  if (error) throw error;

  type Row = {
    id: string;
    name: string;
    description: string | null;
    folder_date: string | null;
    created_at: string;
    media: { count: number }[] | null;
    cover: { file_path: string; file_type: string }[] | null;
  };
  const rows = (data ?? []) as unknown as Row[];

  const coverPaths = rows.map((r) => r.cover?.[0]?.file_path).filter((p): p is string => !!p);
  const urls = coverPaths.length > 0 ? await signLibraryPaths(supabase, bucket, coverPaths) : {};

  const folders: LibraryFolderSummary[] = rows.map((r) => {
    const cover = r.cover?.[0] ?? null;
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      folder_date: r.folder_date,
      created_at: r.created_at,
      media_count: r.media?.[0]?.count ?? 0,
      cover_url: cover ? (urls[cover.file_path] ?? null) : null,
      cover_file_type: cover?.file_type ?? null,
    };
  });

  setCachedLibraryFolders(uid, folders, bucket);
  return folders;
}
