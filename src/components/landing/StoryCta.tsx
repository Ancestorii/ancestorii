'use client';

import type { ReactNode } from 'react';
import { useSignedIn } from '@/components/site/useSignedIn';
import { ArrowLink } from './LandingBits';

/**
 * The landing's "Share Your Story" button: the story editor for a signed-in visitor, sign-up for
 * anyone else. The page is static, so who is signed in is read in the browser (useSignedIn); the
 * HTML carries the signed-out version, which is what nearly every visitor sees.
 */
export default function StoryCta({
  children,
  signedOut,
  className,
  prefetch,
}: {
  /** The button's words; `signedOut` replaces them for visitors who aren't signed in. */
  children: ReactNode;
  signedOut?: ReactNode;
  className?: string;
  prefetch?: boolean;
}) {
  const signedIn = useSignedIn();
  return (
    <ArrowLink href={signedIn ? '/stories/create' : '/signup'} className={className} prefetch={prefetch}>
      {signedIn ? children : signedOut ?? children}
    </ArrowLink>
  );
}
