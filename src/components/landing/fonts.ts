import { Plus_Jakarta_Sans } from 'next/font/google';

// Landing page typeface (from the Claude Design "Ancestorii Landing" file).
// Scoped to the landing root via its CSS variable so the rest of the site is untouched.
export const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});
