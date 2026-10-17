import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import LandingFooter from '@/components/landing/LandingFooter';
import { jakarta } from '@/components/landing/fonts';
import landing from '@/components/landing/landing.module.css';
import SiteNav from './SiteNav';
import pageGlow from './glow.module.css';
import styles from './site.module.css';

// Only Our Stories pages show the signed-in bar; loading it on demand keeps supabase-js out of
// every other public page's JavaScript.
const StoriesUserBar = dynamic(() => import('./StoriesUserBar'));

/**
 * Frame for every public page except the landing page itself: the landing's own nav and
 * footer, its typeface and colour tokens (the landing root class), and the pink and blue
 * glow from behind the hero. `storiesBar` adds the signed-in bar on Our Stories pages;
 * `hidePricing` drops the Pricing links from the nav and footer (the app's Apple-safe pages).
 */
export default function SiteShell({
  children,
  isLoggedIn,
  storiesBar = false,
  glow = true,
  hidePricing = false,
}: {
  children: ReactNode;
  isLoggedIn?: boolean;
  storiesBar?: boolean;
  glow?: boolean;
  hidePricing?: boolean;
}) {
  return (
    <div className={`${jakarta.variable} ${landing.page} ${pageGlow.glowPage}`}>
      {glow && (
        <div className={landing.glows} aria-hidden="true">
          <div className={landing.glowTop} />
          <div className={landing.glowBottom} />
        </div>
      )}

      <SiteNav isLoggedIn={isLoggedIn} hidePricing={hidePricing} />
      {storiesBar && <StoriesUserBar isLoggedIn={isLoggedIn} />}

      <main className={styles.main}>{children}</main>

      <LandingFooter hidePricing={hidePricing} />
    </div>
  );
}
