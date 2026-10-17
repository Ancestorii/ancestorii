'use client';

import { openCookieSettings } from '@/lib/consent';

/** Footer link that opens the cookie banner again, so a visitor can change their answer. */
export default function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={openCookieSettings}>
      Cookie settings
    </button>
  );
}
