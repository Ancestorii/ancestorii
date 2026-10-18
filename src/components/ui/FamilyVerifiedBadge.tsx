'use client';

/**
 * "Verified Family" seal: a solid blue (#2B4BFF, the app's blue) 16-bump scalloped
 * seal with a bold white tick. The scalloped shape and the tick follow the mobile app's
 * seal; the colours follow the web app's palette (no gold). Drawn in a 0 0 100 100
 * viewBox and scales from the centre, so render it at whatever size the context needs.
 *
 * Family-scoped only: it marks a FAMILY (not a person) that has reached the t5
 * reward milestone. Render it next to the family name, never next to a member.
 */

const SCALLOPS = 16;
const D_BUMP = 38.2; // bump-centre distance, doubling as the base-disc radius
const R_BUMP = 6.8; // rounded bump radius
const BLUE = '#2B4BFF';

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
      {/* Blue scalloped seal: base disc + 16 rounded bumps */}
      <circle cx="50" cy="50" r={D_BUMP} fill={BLUE} />
      {bumps.map((b, i) => (
        <circle key={i} cx={b.cx} cy={b.cy} r={R_BUMP} fill={BLUE} />
      ))}

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
