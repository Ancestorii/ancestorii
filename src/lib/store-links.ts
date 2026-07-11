// Single source of truth for the mobile app store links used by the deep-link handoff
// pages (/q/[code] and /m/[code]). Fill these in ONE place at launch:
//
//   APPSTORE_URL  → uses the App Store numeric id from App Store Connect (id6784750387).
//   PLAYSTORE_URL → the live Google Play listing for the real package id (com.ancestorii.app,
//                   matching app.json). The Android app is published, so this resolves.
export const APPSTORE_URL = 'https://apps.apple.com/app/id6784750387';
export const PLAYSTORE_URL = 'https://play.google.com/store/apps/details?id=com.ancestorii.app';
