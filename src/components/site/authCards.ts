// Floating cards beside the account screens (see AuthShell). From the Claude Design Log In
// and Sign Up files, using the hero's own photos and quotes from this repo; the design's
// placeholder pictures are not used.

const PINK = '#FF2D87';
const BLUE = '#2B4BFF';
const ORANGE = '#FF7A1A';
const AQUA = '#12D3AC';
const INK = '#0A0A0F';

type Placement = {
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  z?: number;
  /** Bob amplitude (px), speed and phase. */
  float: [number, number, number];
};

export type AuthCard =
  | (Placement & { kind: 'photo'; src: string; label: string; color: string })
  | (Placement & { kind: 'quote'; text: string; who: string; color: string; fg: string });

export const LOGIN_CARDS: AuthCard[] = [
  { kind: 'photo', src: '/landing/hero-sunday-dinner.jpg', label: "Sunday dinner at Nan's", color: AQUA, x: -270, y: -300, w: 240, h: 310, rotate: -9, float: [8, 0.6, 0] },
  { kind: 'quote', text: 'I knew the moment he asked me to dance.', who: 'Nan, on meeting Grandad', color: BLUE, fg: '#FFFFFF', x: 30, y: -250, w: 250, h: 300, rotate: 7, z: 2, float: [9, 0.5, 2] },
  { kind: 'photo', src: '/landing/hero-nan-twins.jpg', label: 'Nan with the twins', color: PINK, x: -220, y: 20, w: 270, h: 340, rotate: -2, z: 1, float: [7, 0.7, 4] },
];

export const SIGNUP_CARDS: AuthCard[] = [
  { kind: 'photo', src: '/landing/hero-became-a-dad.jpg', label: 'The Day I Became a Dad', color: BLUE, x: -270, y: -290, w: 260, h: 330, rotate: -7, float: [8, 0.55, 1] },
  { kind: 'quote', text: 'Your dad cried more than you did.', who: 'Mum', color: ORANGE, fg: INK, x: 40, y: -220, w: 250, h: 290, rotate: 6, z: 2, float: [9, 0.6, 3] },
  { kind: 'photo', src: '/landing/hero-family-easter.jpg', label: 'The whole family, Easter', color: AQUA, x: -220, y: 90, w: 280, h: 230, rotate: -3, z: 1, float: [7, 0.7, 5] },
];
