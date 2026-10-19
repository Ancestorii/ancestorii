import 'server-only';
import { unstable_cache } from 'next/cache';
import { getPublicClient } from './publicClient';

// A week: the link in a page stays good long after the page was rendered.
const SIGNED_URL_TTL = 60 * 60 * 24 * 7;
// The same signed URL is handed out for a day. A fresh token is a new URL, which browsers and the
// image optimiser cannot cache; one URL a day gives them hits.
const REUSE_FOR = 60 * 60 * 24;

const signOne = unstable_cache(
  async (path: string): Promise<string> => {
    const { data, error } = await getPublicClient()
      .storage.from('user-media')
      .createSignedUrl(path, SIGNED_URL_TTL);
    // Thrown rather than returned, so a failure is never kept for the day.
    if (error || !data?.signedUrl) throw new Error(error?.message || 'Could not sign the photo');
    return data.signedUrl;
  },
  ['user-media-avatar'],
  { revalidate: REUSE_FOR }
);

/**
 * Signed URLs for profile photos in the private user-media bucket, keyed by storage path. Signed
 * as the public (anon) is allowed to, which the bucket's policy grants for `<user>/avatar.*`
 * files; a path it refuses (or a storage error) is left out and the caller shows initials.
 */
export async function signAvatarUrls(
  paths: Iterable<string | null | undefined>
): Promise<Map<string, string>> {
  const unique = [...new Set([...paths].filter((p): p is string => !!p))];
  const urls = await Promise.all(unique.map((p) => signOne(p).catch(() => null)));
  const map = new Map<string, string>();
  unique.forEach((p, i) => {
    const url = urls[i];
    if (url) map.set(p, url);
  });
  return map;
}
