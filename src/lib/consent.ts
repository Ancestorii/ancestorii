// The visitor's answer to the cookie banner, kept in this browser. Until they accept, the
// marketing tags in DeferredTags (GTM with Google Analytics, Google Ads and the Reddit Pixel;
// the Meta Pixel; the Spotify Pixel) never load.
export type Consent = 'granted' | 'denied';

const KEY = 'ancestorii-cookie-consent';
export const CONSENT_EVENT = 'ancestorii:consent';
export const SETTINGS_EVENT = 'ancestorii:cookie-settings';

export function readConsent(): Consent | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null; // storage blocked: ask again
  }
}

export function saveConsent(value: Consent) {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // Storage blocked (some private modes): the answer still applies to this page.
  }
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: value }));
}

/** Opens the banner again, so the visitor can change their answer. */
export function openCookieSettings() {
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}
