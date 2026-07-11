import { APPSTORE_URL, PLAYSTORE_URL } from '@/lib/store-links';

// Shared app store badges, fed by the single source of truth in src/lib/store-links.ts.
//
// iOS uses the OFFICIAL Apple "Download on the App Store" badge artwork from
// public/badges/*.svg, wrapped in a link to the App Store. Per Apple guidelines the badge
// is rendered at its natural aspect ratio, never recoloured, stretched, or distorted, with
// clear space around it. Pick the artwork with the `theme` prop, set to the page's actual
// BACKGROUND so the badge always contrasts:
//   theme="light" → white / gold / light background → black badge  (public/badges/black.svg)
//   theme="dark"  → dark background                 → white badge  (public/badges/white.svg)
//
// Android uses the OFFICIAL Google Play "Get it on Google Play" badge (public/badges/google.svg),
// wrapped in a link to the Play Store. It is a single full-colour badge that reads on any
// background, so — unlike the Apple badge — it does NOT switch by theme. Rendered at its
// natural aspect ratio, never recoloured or stretched. Per Google's guideline the Play badge
// is shown at the SAME height as the Apple badge (never smaller) so the two line up.
type Props = {
  theme?: 'light' | 'dark';
  className?: string;
};

// Both badges share one on-screen height so they align and satisfy Google's rule that the
// Play badge be equal to or larger than the Apple badge when shown side by side.
const BADGE_HEIGHT = 44;

export default function StoreBadges({ theme = 'light', className = '' }: Props) {
  const appleBadgeSrc = theme === 'dark' ? '/badges/white.svg' : '/badges/black.svg';

  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <a href={APPSTORE_URL} target="_blank" rel="noopener noreferrer" className="inline-block">
        {/* Official Apple badge — natural aspect ratio, not recoloured or stretched. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={appleBadgeSrc}
          alt="Download Ancestorii on the App Store"
          width={132}
          height={BADGE_HEIGHT}
          style={{ height: BADGE_HEIGHT, width: 'auto', display: 'block' }}
        />
      </a>
      <a href={PLAYSTORE_URL} target="_blank" rel="noopener noreferrer" className="inline-block">
        {/* Official Google Play badge — full colour, same height as Apple, natural aspect ratio. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/badges/google.svg"
          alt="Get Ancestorii on Google Play"
          width={148}
          height={BADGE_HEIGHT}
          style={{ height: BADGE_HEIGHT, width: 'auto', display: 'block' }}
        />
      </a>
    </div>
  );
}
