import type { AuthCard } from '@/components/site/authCards';

// Decorative cards for the utility pages (invite, join, cancel, the app hand-off pages).
// Only the landing hero's own photos, captions and family sayings are used here: real
// pictures from this repo, never stock or mockups.

export type FanCard =
  | { kind: 'photo'; src: string; label: string; color: string; tilt: number }
  | { kind: 'quote'; text: string; who: string; color: string; fg: string; tilt: number };

/** Floating cards beside the invite and join forms (AuthShell). Same placements as Sign Up. */
export const FAMILY_CARDS: AuthCard[] = [
  { kind: 'photo', src: '/landing/hero-oma-baby-rose.jpg', label: 'Oma and baby Rose', color: 'var(--c0)', x: -270, y: -290, w: 260, h: 330, rotate: -7, float: [8, 0.55, 1] },
  { kind: 'quote', text: 'Never go to bed on an argument.', who: 'Grandma June', color: 'var(--c1)', fg: 'white', x: 40, y: -220, w: 250, h: 290, rotate: 6, z: 2, float: [9, 0.6, 3] },
  { kind: 'photo', src: '/landing/hero-family-easter.jpg', label: 'The whole family, Easter', color: 'var(--c2)', x: -220, y: 90, w: 280, h: 230, rotate: -3, z: 1, float: [7, 0.7, 5] },
];

/** A row of hero cards under the cancel page's message, in the hero ring's own order. */
export const ROW_CARDS: FanCard[] = [
  { kind: 'photo', src: '/landing/hero-nan-twins.jpg', label: 'Nan with the twins', color: 'var(--c0)', tilt: -6 },
  { kind: 'quote', text: 'I knew the moment he asked me to dance.', who: 'Nan, on meeting Grandad', color: 'var(--c1)', fg: 'white', tilt: 3 },
  { kind: 'photo', src: '/landing/hero-sixth-birthday.jpg', label: "Tom's sixth birthday", color: 'var(--c2)', tilt: -2 },
  { kind: 'quote', text: 'You were the loudest baby on the whole ward.', who: 'Mum', color: 'var(--c0)', fg: 'var(--ink)', tilt: 4 },
  { kind: 'photo', src: '/landing/hero-became-a-dad.jpg', label: 'The Day I Became a Dad', color: 'var(--c3)', tilt: -5 },
];

/** Cards either side of the code on /q (a question to answer). */
export const QUESTION_SIDES: [FanCard, FanCard] = [
  { kind: 'photo', src: '/landing/hero-sunday-dinner.jpg', label: "Sunday dinner at Nan's", color: 'var(--c2)', tilt: -8 },
  { kind: 'photo', src: '/landing/hero-nan-twins.jpg', label: 'Nan with the twins', color: 'var(--c3)', tilt: 7 },
];

/** Cards either side of the code on /m (a shared memory). */
export const MEMORY_SIDES: [FanCard, FanCard] = [
  { kind: 'photo', src: '/landing/hero-oma-baby-rose.jpg', label: 'Oma and baby Rose', color: 'var(--c3)', tilt: -8 },
  { kind: 'photo', src: '/landing/hero-family-easter.jpg', label: 'The whole family, Easter', color: 'var(--c2)', tilt: 7 },
];
