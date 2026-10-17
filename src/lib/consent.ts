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

// What the tags leave behind on ancestorii.com (seen in a live capture): Google Analytics _ga and
// _ga_<id>, Google Ads _gcl_*, Meta _fbp/_fbc, Reddit _rdt_*, Spotify __spdt, plus their storage.
const COOKIE_NAME = /^(_ga(_.+)?|_gcl_.+|_fbp|_fbc|_rdt_.+|__spdt.*)$/;
const STORAGE_KEY = /^(_gcl_|lastExternalReferrer|spdt|_rdt)/;

/** Deletes the marketing cookies and storage set on this site, after consent is taken back. */
export function clearMarketingStorage() {
  const host = window.location.hostname;
  const site = host.split('.').slice(-2).join('.');
  const domains = ['', `; domain=${host}`, `; domain=.${host}`, `; domain=.${site}`];
  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0].trim();
    if (!COOKIE_NAME.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
    }
  }
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (STORAGE_KEY.test(key)) window.localStorage.removeItem(key);
    }
  } catch {
    // Storage blocked: nothing to clear.
  }
}
