import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { BookOpen, LogIn, Smartphone, Ticket } from 'lucide-react';
import SiteShell from '@/components/site/SiteShell';
import { Accent, ClosingCta, Eyebrow, SectionHead } from '@/components/site/SiteBits';
import landing from '@/components/landing/landing.module.css';
import site from '@/components/site/site.module.css';
import styles from './rewards.module.css';

// /rewards: APP HANDOFF (Apple safe).
//
// This is the page the app's "Redeem at ancestorii.com" button points at. It is a direct
// target of an in app link, so by rule it shows NO prices and NO upgrade/buy button. Its
// job is to EXPLAIN how redemption works and offer a neutral login. The reward code itself
// is entered later, at keepsake checkout inside the Book / Canvas / Acrylic editors.
// It carries the normal public nav + footer so it reads as part of the site, minus their
// Pricing links (hidePricing).
export const metadata: Metadata = {
  title: 'Redeem your app rewards',
  description: 'Your family earns reward codes in the Ancestorii app. Here is how to redeem them on the website.',
  robots: { index: false, follow: false },
};

// Plain numbered steps so a visitor understands redemption BEFORE logging in.
// Accurate to the real reward types: codes are entered at keepsake checkout and apply
// a discount or a free product on Memory Books, Canvas Prints and Acrylic Prints.
const STEPS = [
  'Your family earns reward codes in the Ancestorii app as your library grows.',
  'Log in here with the same email and password you use in the app.',
  'Start a keepsake order: a Memory Book, a Canvas Print, or an Acrylic Print.',
  'Enter your reward code at checkout to apply your discount or free product.',
];

// The look of each step card, in step order: a solid colour panel with a tilted icon tile.
const STEP_LOOKS = [
  { Icon: Smartphone, panel: 'var(--c0)', tilt: '-4deg' },
  { Icon: LogIn, panel: 'var(--c1)', tilt: '3deg' },
  { Icon: BookOpen, panel: 'var(--c2)', tilt: '-3deg' },
  { Icon: Ticket, panel: 'var(--c3)', tilt: '4deg' },
];

export default function RewardsPage() {
  return (
    <SiteShell hidePricing>
      {/* Hero: the landing's big centred title with one gradient phrase */}
      <section className={`${site.hero} ${styles.hero}`}>
        <div className={site.heroInner}>
          <div className={site.heroTop}>
            <Eyebrow dot="var(--c3)">Rewards</Eyebrow>
          </div>

          {/* Heading (kept) */}
          <h1 className={`${site.heroTitle} ${styles.title}`}>
            Redeem your <Accent>app rewards</Accent>
          </h1>

          {/* Lead: plain, no prices */}
          <div className={styles.lead}>
            <p>Your family earns reward codes in the Ancestorii app as your library grows, and you redeem them here on the website.</p>
            <p>Rewards apply to your keepsake orders: Memory Books, Canvas Prints and Acrylic Prints.</p>
          </div>
        </div>
      </section>

      {/* Step-by-step, so people know what to do before they log in */}
      <section className={site.section} aria-labelledby="how-redemption-works">
        <div className={landing.wrap}>
          <SectionHead id="how-redemption-works" title="How redemption works" />

          <ol className={styles.steps}>
            {STEPS.map((step, i) => {
              const { Icon, panel, tilt } = STEP_LOOKS[i];
              return (
                <li
                  key={i}
                  className={landing.step}
                  style={{ '--panel': panel, '--tilt': tilt } as CSSProperties}
                >
                  <div className={`${landing.stepPanel} ${styles.panel}`}>
                    <div className={landing.stepTile}>
                      <Icon size={56} strokeWidth={2.5} aria-hidden="true" />
                    </div>
                  </div>
                  <div className={landing.stepBody}>
                    <div aria-hidden="true" className={landing.stepNum}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <p className={styles.stepText}>{step}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* One account, same login (kept). Only action: neutral login. No price, no upgrade button. */}
      <ClosingCta
        title="It is all one account."
        lead="Log in with the same email and password you use in the app."
        primary={{ href: '/login', label: 'Log in to redeem' }}
      />
    </SiteShell>
  );
}
