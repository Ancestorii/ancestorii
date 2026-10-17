'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { jakarta } from '@/components/landing/fonts';
import { readConsent, saveConsent, SETTINGS_EVENT, type Consent } from '@/lib/consent';
import s from './CookieConsent.module.css';

// Asks once before the marketing tags load (see DeferredTags), with Accept and Reject given the
// same weight. "Cookie settings" in the footer opens it again. Never shown on the /export pages
// that Puppeteer prints to PDF.
export default function CookieConsent() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // After hydration only: the answer lives in this browser, so the server can't know it.
    const frame = requestAnimationFrame(() => setOpen(readConsent() === null));
    const reopen = () => setOpen(true);
    window.addEventListener(SETTINGS_EVENT, reopen);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(SETTINGS_EVENT, reopen);
    };
  }, []);

  if (!open || pathname?.startsWith('/export')) return null;

  const choose = (value: Consent) => {
    saveConsent(value);
    setOpen(false);
  };

  return (
    <section className={`${jakarta.variable} ${s.banner}`} aria-label="Cookies">
      <p className={s.text}>
        We use cookies to see how people find Ancestorii and whether our adverts work.{' '}
        <Link href="/privacy-policy#section-17" prefetch={false} className={s.link}>
          Privacy policy
        </Link>
      </p>
      <div className={s.actions}>
        <button type="button" className={s.reject} onClick={() => choose('denied')}>
          Reject
        </button>
        <button type="button" className={s.accept} onClick={() => choose('granted')}>
          Accept
        </button>
      </div>
    </section>
  );
}
