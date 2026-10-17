'use client';

import { openCookieSettings } from '@/lib/consent';
import s from './CookieConsent.module.css';

/** Opens the cookie banner again, so a visitor can change their answer. Looks like a link
 *  unless a className is given (the footer passes its own). */
export default function CookieSettingsButton({
  className,
  label = 'Cookie settings',
}: {
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={className ?? s.settingsLink}
      onClick={openCookieSettings}
      data-consent-ui=""
    >
      {label}
    </button>
  );
}
