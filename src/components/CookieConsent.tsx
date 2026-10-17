'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { jakarta } from '@/components/landing/fonts';
import { readConsent, saveConsent, SETTINGS_EVENT, type Consent } from '@/lib/consent';
import s from './CookieConsent.module.css';

// Pages whose phone layout pins controls to the bottom (the dashboard's navigation, the story
// editor's writing help): the banner sits higher there so it doesn't cover them.
const APP_ROUTE = /^\/(dashboard|onboarding)(\/|$)|^\/stories\/(create$|.+\/edit$)/;

// Asks once before the marketing tags load (see DeferredTags, which also starts or stops them
// when the answer changes), with Accept and Reject given the same weight. "Cookie settings"
// (footer, profile, privacy policy) opens it again. Never shown on the /export pages that
// Puppeteer prints to PDF.
export default function CookieConsent() {
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);
  const firstButton = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const focusOnOpen = useRef(false);

  useEffect(() => {
    // After hydration only: the answer lives in this browser, so the server can't know it.
    const frame = requestAnimationFrame(() => setOpen(readConsent() === null));
    const reopen = () => {
      // Opened from a Cookie settings button: focus moves into the banner, and back after.
      returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      focusOnOpen.current = true;
      setOpen(true);
    };
    window.addEventListener(SETTINGS_EVENT, reopen);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(SETTINGS_EVENT, reopen);
    };
  }, []);

  useEffect(() => {
    if (open && focusOnOpen.current) {
      focusOnOpen.current = false;
      firstButton.current?.focus();
    }
  }, [open]);

  if (!open || pathname.startsWith('/export')) return null;

  const choose = (value: Consent) => {
    saveConsent(value);
    setOpen(false);
    returnTo.current?.focus();
    returnTo.current = null;
  };

  return (
    <section
      className={`${jakarta.variable} ${s.banner} ${APP_ROUTE.test(pathname) ? s.raised : ''}`}
      aria-label="Cookies"
      data-consent-ui=""
    >
      <p className={s.text}>
        We&apos;d like to use cookies from Google, Meta, Reddit and Spotify to measure visits and our
        adverts, and to show our adverts to people who have visited.{' '}
        <Link href="/privacy-policy#section-17" prefetch={false} className={s.link}>
          Privacy policy
        </Link>
      </p>
      <div className={s.actions}>
        <button type="button" ref={firstButton} className={s.reject} onClick={() => choose('denied')}>
          Reject
        </button>
        <button type="button" className={s.accept} onClick={() => choose('granted')}>
          Accept
        </button>
      </div>
    </section>
  );
}
