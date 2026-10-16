import Link from 'next/link';
import type { ReactNode } from 'react';
import { jakarta } from './fonts';
import styles from './landing.module.css';

// The Ancestorii mark: two i's, pink and blue dots on ink stems. Drawn to the exact
// geometry of the master icon (scripts/brand/ancestorii-icon.png).
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`${styles.logoMark} ${className}`}
      viewBox="0 0 19 30"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="4" cy="4" r="4" fill="#FF2D87" />
      <rect y="10" width="8" height="20" rx="4" fill="#0A0A0F" />
      <circle cx="15" cy="11" r="4" fill="#2B4BFF" />
      <rect x="11" y="17" width="8" height="13" rx="4" fill="#0A0A0F" />
    </svg>
  );
}

// The font class keeps the wordmark in Plus Jakarta Sans outside the landing too (dashboard, onboarding).
export function Logo({ href }: { href?: string }) {
  const className = `${styles.logo} ${jakarta.className}`;
  const content = (
    <>
      <LogoMark />
      Ancestorii
    </>
  );

  if (!href) return <div className={className}>{content}</div>;

  return (
    <Link href={href} className={className} aria-label="Ancestorii home">
      {content}
    </Link>
  );
}

// Black (or white) pill button with the pink-to-orange arrow tile.
export function ArrowLink({
  href,
  children,
  className = '',
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`${styles.btnPrimary} ${className}`}>
      {children}
      <span className={styles.arrowTile} aria-hidden="true">
        →
      </span>
    </Link>
  );
}
