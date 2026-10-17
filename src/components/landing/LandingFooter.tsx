import Link from 'next/link';
import StoreBadges from '@/components/StoreBadges';
import CookieSettingsButton from '@/components/CookieSettingsButton';
import { TOPICS } from '@/lib/stories/topics';
import {
  COMPANY_PAGES,
  COMPARE_PAGES,
  DISCOVER_PAGES,
  FEATURE_PAGES,
  GUIDE_HUB_PAGES,
  PRODUCT_PAGES,
  type PageLink,
} from '@/lib/seo/pages';
import FooterGroup from './FooterGroup';
import { Logo } from './LandingBits';
import f from './footer.module.css';
import styles from './landing.module.css';

// Pages that show prices.
const PRICE_PAGES = new Set(['/pricing', '/features', '/canvas-prints', '/acrylic-prints']);

const STORY_TOPICS: PageLink[] = TOPICS.map((t) => ({
  href: `/stories/topics/${t.slug}`,
  label: `${t.label.replace(' & ', ' and ')} stories`,
}));

const DOTS = ['var(--c0)', 'var(--c1)', 'var(--c2)', 'var(--c3)'];

// The site footer: five columns (product, features, comparisons, the Our Stories side, and the
// guide hub with its sections, which holds every guide), then the legal links, cookie settings,
// support and socials.
// `hidePricing` drops the links to pages that show prices (the app's Apple-safe /rewards page).
export default function LandingFooter({ hidePricing = false }: { hidePricing?: boolean }) {
  const product = hidePricing ? PRODUCT_PAGES.filter((l) => !PRICE_PAGES.has(l.href)) : PRODUCT_PAGES;

  const columns: { title: string; links: PageLink[] }[] = [
    { title: 'Product', links: product },
    { title: 'Features', links: FEATURE_PAGES },
    { title: 'Compare', links: COMPARE_PAGES },
    { title: 'Discover', links: [...DISCOVER_PAGES, ...STORY_TOPICS] },
    { title: 'Guides', links: GUIDE_HUB_PAGES },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        <div className={`${styles.footerTop} ${f.top}`}>
          <div className={`${styles.footerBrand} ${f.brand}`}>
            <Logo href="/" prefetch={false} />
            <p className={styles.footerTagline}>Your family&apos;s greatest stories. Told together.</p>
            <p className={f.brandLine}>
              A private space for the people you invite, a public feed for the stories you choose to
              share, and prints made from your family&apos;s photos.
            </p>
            {/* Official store badges (see StoreBadges for the artwork rules). */}
            <StoreBadges theme="light" className={styles.footerBadges} />
          </div>

          <div className={f.cols}>
            {columns.map((col, i) => (
              <FooterGroup key={col.title} title={col.title} links={col.links} dot={DOTS[i % 4]} />
            ))}
          </div>
        </div>

        <div className={`${styles.footerBottom} ${f.bottom}`}>
          <span className={f.copy}>&copy; {new Date().getFullYear()} Ancestorii&trade;. All rights reserved.</span>
          <nav className={f.legal} aria-label="Company">
            {COMPANY_PAGES.filter((l) => l.href !== '/why-this-exists').map((link) => (
              <Link key={link.href} href={link.href} className={styles.footerLink}>
                {link.label}
              </Link>
            ))}
            <CookieSettingsButton className={`${styles.footerLink} ${f.settings}`} />
          </nav>
          <div className={styles.footerContact}>
            <a href="mailto:support@ancestorii.com" className={styles.footerLink}>
              support@ancestorii.com
            </a>
            <div className={styles.socials}>
              <a
                href="https://www.instagram.com/ancestorii_official/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.social}
                aria-label="Ancestorii on Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="3.5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61586259749930"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.social}
                aria-label="Ancestorii on Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
