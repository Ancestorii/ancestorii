import Link from 'next/link';
import StoreBadges from '@/components/StoreBadges';
import CookieSettingsButton from '@/components/CookieSettingsButton';
import { Logo } from './LandingBits';
import footerStyles from './footer.module.css';
import styles from './landing.module.css';

const COLUMNS = [
  {
    heading: 'Discover',
    links: [
      { href: '/stories', label: 'Explore Stories' },
      { href: '/stories/topics', label: 'Browse by Topic' },
      { href: '/digital-legacy', label: 'What is a Digital Legacy?' },
      { href: '/living-library', label: 'What is a Living Library?' },
    ],
  },
  {
    heading: 'Product',
    links: [
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/features', label: 'All Features' },
      { href: '/memory-books', label: 'Memory Books' },
      { href: '/canvas-prints', label: 'Canvas Prints' },
      { href: '/acrylic-prints', label: 'Acrylic Prints' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/compare', label: 'Compare Platforms' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/why-this-exists', label: 'Why Ancestorii Exists' },
      { href: '/guides', label: 'Guides' },
      { href: '/privacy-policy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms & Conditions' },
    ],
  },
];

// Pages that show prices.
const PRICE_PAGES = new Set(['/pricing', '/features', '/canvas-prints', '/acrylic-prints']);

// `hidePricing` drops the links to pages that show prices (the app's Apple-safe /rewards page shows no prices).
// The Our Stories links skip prefetch: those pages are rendered per request, so a prefetch brought
// nothing back. The static pages keep it, as before.
export default function LandingFooter({ hidePricing = false }: { hidePricing?: boolean }) {
  const columns = hidePricing
    ? COLUMNS.map((col) => ({ ...col, links: col.links.filter((link) => !PRICE_PAGES.has(link.href)) }))
    : COLUMNS;

  return (
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Logo href="/" prefetch={false} />
            <p className={styles.footerTagline}>Your family&apos;s greatest stories. Told together.</p>
            {/* Official store badges (see StoreBadges for the artwork rules). */}
            <StoreBadges theme="light" className={styles.footerBadges} />
          </div>

          {/* On phones the long Product column spans two rows beside Discover and Company (footer.module.css). */}
          <div className={`${styles.footerCols} ${footerStyles.cols}`}>
            {columns.map((col) => (
              <nav
                key={col.heading}
                className={`${styles.footerCol} ${col.links.length > 5 ? footerStyles.tall : ''}`}
                aria-label={col.heading}
              >
                <span className={styles.footerHeading}>{col.heading}</span>
                {col.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={link.href.startsWith('/stories') ? false : undefined}
                    className={styles.footerLink}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>&copy; {new Date().getFullYear()} Ancestorii™. All rights reserved.</span>
          <div className={styles.footerContact}>
            <CookieSettingsButton className={`${styles.footerLink} ${footerStyles.settings}`} />
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
