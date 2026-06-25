'use client';

import { useId } from 'react';

/**
 * "Verified Family" seal — a periwinkle 16-bump scalloped flower with a metallic
 * gold ring and a bold white tick. Reproduced verbatim from the mobile app so the
 * two surfaces are pixel-identical. Drawn in a 0 0 100 100 viewBox and scales from
 * the centre, so render it at whatever size the context needs.
 *
 * Family-scoped only — it marks a FAMILY (not a person) that has reached the t5
 * reward milestone. Render it next to the family name, never next to a member.
 */

const SCALLOPS = 16;
const D_BUMP = 38.2; // bump-centre distance, doubling as the base-disc radius
const R_BUMP = 6.8; // rounded bump radius

const bumps = Array.from({ length: SCALLOPS }, (_, i) => {
  const a = (i / SCALLOPS) * Math.PI * 2;
  return { cx: 50 + Math.cos(a) * D_BUMP, cy: 50 + Math.sin(a) * D_BUMP };
});

export function FamilyVerifiedBadge({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  // Unique gradient ids per instance — if two badges render on one page, shared
  // ids would collide and one badge would pick up the other's gradient.
  const uid = useId().replace(/:/g, '');
  const peri = `fvbPeri-${uid}`;
  const gold = `fvbGold-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Verified family"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={peri} x1="0" y1="10" x2="0" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5D6CD9" />
          <stop offset="1" stopColor="#4150C4" />
        </linearGradient>
        <linearGradient id={gold} x1="22" y1="22" x2="78" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ECD498" />
          <stop offset="0.5" stopColor="#C8A557" />
          <stop offset="1" stopColor="#8F6E28" />
        </linearGradient>
      </defs>

      {/* Periwinkle scalloped flower: base disc + 16 rounded bumps */}
      <circle cx="50" cy="50" r="38.2" fill={`url(#${peri})`} />
      {bumps.map((b, i) => (
        <circle key={i} cx={b.cx} cy={b.cy} r={R_BUMP} fill={`url(#${peri})`} />
      ))}

      {/* Metallic gold ring */}
      <circle cx="50" cy="50" r="30" fill="none" stroke={`url(#${gold})`} strokeWidth="5" />

      {/* Bold white tick */}
      <path
        d="M37 50.5 L46 59.5 L66 37.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="7.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
