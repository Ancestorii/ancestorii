/**
 * The page to return to after signing in, taken from a `?redirect=` value, or null.
 * Only paths on this site pass: a full URL or a "//other.site" path is dropped, so a crafted
 * link can't send someone off Ancestorii straight after they log in. Browser only.
 */
export function safeRedirect(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/')) return null;
  try {
    // Resolving it the way the browser would also catches tricks like "/\evil.example".
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}
