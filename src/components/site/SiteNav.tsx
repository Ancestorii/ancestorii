'use client';

import { useEffect, useState } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import { getBrowserClient } from '@/lib/supabase/browser';

// The landing page's own nav, used on every other public page. Pages that already know
// who is signed in pass `isLoggedIn`; static pages leave it out and the nav reads the
// browser session once it mounts, so those pages can stay statically rendered.
export default function SiteNav({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const [sessionSignedIn, setSessionSignedIn] = useState(false);
  const known = isLoggedIn !== undefined;

  useEffect(() => {
    if (known) return;
    const supabase = getBrowserClient();
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSessionSignedIn(!!data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setSessionSignedIn(!!session);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [known]);

  return <LandingNav isLoggedIn={known ? !!isLoggedIn : sessionSignedIn} />;
}
