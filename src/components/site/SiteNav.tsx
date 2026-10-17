'use client';

import { useEffect, useState } from 'react';
import LandingNav from '@/components/landing/LandingNav';

// The session cookie @supabase/ssr writes on sign-in (readable from JS; a long session is split
// into .0, .1, …). An empty value is a cleared cookie, not a session.
const SESSION_COOKIE = /(?:^|;\s*)sb-[a-z0-9]+-auth-token(?:\.\d+)?=[^;]/;

// The landing page's own nav, used on every other public page. Pages that already know
// who is signed in pass `isLoggedIn`; static pages leave it out and the nav checks once it
// mounts. Without a session cookie that's the end of it (signed-out visitors never load
// supabase-js); with one, the session is confirmed (and followed) as before, so a stale cookie
// never shows My Family.
export default function SiteNav({ isLoggedIn, hidePricing }: { isLoggedIn?: boolean; hidePricing?: boolean }) {
  const [sessionSignedIn, setSessionSignedIn] = useState(false);
  const known = isLoggedIn !== undefined;

  useEffect(() => {
    if (known) return;
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
  }, [known]);

  return <LandingNav isLoggedIn={known ? !!isLoggedIn : sessionSignedIn} hidePricing={hidePricing} />;
}
