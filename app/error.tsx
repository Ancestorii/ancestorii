'use client';

import { startTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteShell from '@/components/site/SiteShell';
import { Accent, ArrowButton, PageHero } from '@/components/site/SiteBits';
import landing from '@/components/landing/landing.module.css';
import site from '@/components/site/site.module.css';

/**
 * Shown when a page fails to load (for example the database didn't answer in time),
 * instead of Next's bare error screen. "Try again" re-fetches the page from the server.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <SiteShell>
      <PageHero
        title={
          <>
            Something went <Accent>wrong.</Accent>
          </>
        }
        lead={
          <>
            This page didn’t load properly. Please try again. If it keeps happening, email us at{' '}
            <a href="mailto:support@ancestorii.com" className={site.textLink}>
              support@ancestorii.com
            </a>.
          </>
        }
      >
        <ArrowButton onClick={retry} className={landing.btnShadow}>
          Try again
        </ArrowButton>
        <Link href="/" className={landing.btnOutline}>
          Back to home
        </Link>
      </PageHero>
    </SiteShell>
  );
}
