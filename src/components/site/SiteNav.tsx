'use client';

import LandingNav from '@/components/landing/LandingNav';
import { useSignedIn } from './useSignedIn';

// The landing page's own nav, used on every public page. Pages that already know who is signed
// in pass `isLoggedIn`; static pages (the landing included) leave it out and the nav finds out
// once it mounts (useSignedIn: a cookie check first, so signed-out visitors never load supabase-js).
export default function SiteNav({ isLoggedIn, hidePricing }: { isLoggedIn?: boolean; hidePricing?: boolean }) {
  const signedIn = useSignedIn(isLoggedIn);
  return <LandingNav isLoggedIn={signedIn} hidePricing={hidePricing} />;
}
