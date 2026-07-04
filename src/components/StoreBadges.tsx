import { APPSTORE_URL } from '@/lib/store-links';

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
// Android is not published yet, so it stays a plain, non clickable "Android coming soon"
// label — no fake Google Play badge.
type Props = {
  theme?: 'light' | 'dark';
  className?: string;
};

export default function StoreBadges({ theme = 'light', className = '' }: Props) {
  const badgeSrc = theme === 'dark' ? '/badges/white.svg' : '/badges/black.svg';
  const androidColor = theme === 'dark' ? '#f5f1e6' : '#5A4F3C';

  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <a href={APPSTORE_URL} target="_blank" rel="noopener noreferrer" className="inline-block">
        {/* Official Apple badge — natural aspect ratio, not recoloured or stretched. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={badgeSrc}
          alt="Download Ancestorii on the App Store"
          width={132}
          height={44}
          style={{ height: 44, width: 'auto', display: 'block' }}
        />
      </a>
      {/* Android not published yet — plain text label, not a fake Google Play badge. */}
      <span aria-disabled="true" className="text-sm font-medium" style={{ color: androidColor }}>
        Android coming soon
      </span>
    </div>
  );
}
