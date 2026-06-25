// Single source of truth for the mobile app store links used by the deep-link handoff
// pages (/q/[code] and /m/[code]). Fill these in ONE place at launch:
//
//   APPSTORE_URL  → replace the `idREPLACE_WITH_APP_STORE_NUMERIC_ID` segment with the
//                   App Store numeric id from App Store Connect (e.g. id1234567890).
//   PLAYSTORE_URL → already uses the real package id (com.ancestorii.app, matching
//                   app.json); it resolves once the app is published on Google Play.
export const APPSTORE_URL = 'https://apps.apple.com/app/idREPLACE_WITH_APP_STORE_NUMERIC_ID';
export const PLAYSTORE_URL = 'https://play.google.com/store/apps/details?id=com.ancestorii.app';
