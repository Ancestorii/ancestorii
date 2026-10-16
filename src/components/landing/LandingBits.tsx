import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './landing.module.css';

// Temporary Ancestorii mark from the Claude Design file: four rounded squares
// in the landing palette. Replaces the old gold "A" until the final logo is chosen.
export function LogoMark() {
  return (
    <span className={styles.logoMark} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export function Logo({ href }: { href?: string }) {
  const content = (
    <>
      <LogoMark />
      Ancestorii
    </>
  );

  if (!href) return <div className={styles.logo}>{content}</div>;

  return (
    <Link href={href} className={styles.logo} aria-label="Ancestorii home">
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
