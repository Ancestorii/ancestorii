'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from './LandingBits';
import styles from './landing.module.css';

const NAV_LINKS = [
  { href: '/stories', label: 'Our Stories', dot: 'var(--c0)' },
  { href: '/how-it-works', label: 'How It Works', dot: 'var(--c1)' },
  { href: '/memory-books', label: 'Memory Books', dot: 'var(--c2)' },
  { href: '/pricing', label: 'Pricing', dot: 'var(--c3)' },
];

// `hidePricing` drops the Pricing link (the app's Apple-safe /rewards page shows no prices).
export default function LandingNav({
  isLoggedIn,
  hidePricing = false,
}: {
  isLoggedIn: boolean;
  hidePricing?: boolean;
}) {
  const links = hidePricing ? NAV_LINKS.filter((link) => link.href !== '/pricing') : NAV_LINKS;
  const [open, setOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  // Lock page scroll, close on Escape, and move focus in and out of the menu.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus({ preventScroll: true });
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setOpen(false);
          return;
        }
        if (e.key !== 'Tab' || !panelRef.current) return;
        const items = panelRef.current.querySelectorAll<HTMLElement>('a[href], button');
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      window.addEventListener('keydown', onKey);
      return () => {
        window.removeEventListener('keydown', onKey);
        document.body.style.overflow = '';
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      openButtonRef.current?.focus();
    }
  }, [open]);

  // The menu is only for narrow screens; close it if the window grows past that.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 981px)');
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Logo href="/" />

        <nav className={styles.navLinks} aria-label="Main">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.headerActions}>
          {isLoggedIn ? (
            <Link href="/dashboard/home" className={styles.headerCta}>
              My Family
            </Link>
          ) : (
            <>
              <Link href="/login" className={styles.loginLink}>
                Log In
              </Link>
              <Link href="/signup" className={styles.headerCta}>
                Start For Free
              </Link>
            </>
          )}
          <button
            ref={openButtonRef}
            type="button"
            className={styles.menuButton}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="landing-menu"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        id="landing-menu"
        className={styles.menuOverlay}
        data-open={open}
        data-lenis-prevent
        onClick={close}
      >
        <div
          ref={panelRef}
          className={styles.menuPanel}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.menuTop}>
            <Logo />
            <button
              ref={closeButtonRef}
              type="button"
              className={styles.menuButton}
              style={{ display: 'inline-flex' }}
              aria-label="Close menu"
              onClick={close}
            >
              <X size={22} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>

          <nav className={styles.menuLinks} aria-label="Menu">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.menuLink}
                onClick={close}
              >
                <span className={styles.menuDot} style={{ '--dot': link.dot } as CSSProperties} />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.menuActions}>
            {isLoggedIn ? (
              <Link href="/dashboard/home" className={styles.menuSignup} onClick={close}>
                My Family
              </Link>
            ) : (
              <>
                <Link href="/login" className={styles.menuLogin} onClick={close}>
                  Log In
                </Link>
                <Link href="/signup" className={styles.menuSignup} onClick={close}>
                  Start For Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
