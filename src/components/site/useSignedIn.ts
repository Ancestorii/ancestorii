import { useEffect, useState } from 'react';

// The session cookie @supabase/ssr writes on sign-in (readable from JS; a long session is split
// into .0, .1, …). An empty value is a cleared cookie, not a session.
const SESSION_COOKIE = /(?:^|;\s*)sb-[a-z0-9]+-auth-token(?:\.\d+)?=[^;]/;

/**
 * Whether the visitor is signed in, for the public pages. A page that already knows passes
 * `known`; a static page leaves it out and the answer is read in the browser once mounted (false
 * until then, which is what the HTML shows). Without a session cookie that's the end of it
 * (signed-out visitors never load supabase-js); with one, the session is confirmed (and followed),
 * so a stale cookie never shows My Family.
 */
export function useSignedIn(known?: boolean): boolean {
  const [sessionSignedIn, setSessionSignedIn] = useState(false);
  const isKnown = known !== undefined;

  useEffect(() => {
    if (isKnown) return;
    const hasCookie = SESSION_COOKIE.test(document.cookie);
    setSessionSignedIn(hasCookie);
    if (!hasCookie) return;
    let active = true;
    let unsubscribe = () => {};
    import('@/lib/supabase/browser').then(({ getBrowserClient }) => {
      if (!active) return;
      const supabase = getBrowserClient();
      supabase.auth.getSession().then(({ data }) => {
        if (active) setSessionSignedIn(!!data.session);
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) setSessionSignedIn(!!session);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [isKnown]);

  return isKnown ? !!known : sessionSignedIn;
}
