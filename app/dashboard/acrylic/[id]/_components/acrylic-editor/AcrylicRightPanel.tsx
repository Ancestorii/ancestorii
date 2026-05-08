'use client';

import { inter } from '@/lib/fonts';
import { ACRYLIC_COLORS } from './AcrylicEditor';

const SIZE_LABELS: Record<string, string> = { '16x24': '16×24″', '24x24': '24×24″', '24x36': '24×36″' };
const TIER_LABELS: Record<string, string> = { portrait: 'The Portrait', centrepiece: 'The Centrepiece', masterpiece: 'The Masterpiece' };

export default function AcrylicRightPanel({
  progress, filledSlots, totalSlots, totalPhotos, totalCaptions,
  tierKey, orientation, acrylicSize, layoutType,
}: {
  progress: number; filledSlots: number; totalSlots: number;
  totalPhotos: number; totalCaptions: number;
  tierKey: string; orientation: string; acrylicSize: string; layoutType: string;
}) {
  return (
    <aside
      className="fade-up d3"
      style={{ gridRow: '2', gridColumn: '3', background: ACRYLIC_COLORS.panel, borderLeft: `1.5px solid ${ACRYLIC_COLORS.line}`, display: 'flex', flexDirection: 'column', padding: '20px 18px' }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: inter.style.fontFamily, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: ACRYLIC_COLORS.muted, marginBottom: 20 }}>
          Acrylic Progress
        </div>

        <div style={{ fontFamily: inter.style.fontFamily, fontSize: 52, fontWeight: 700, lineHeight: 1, color: ACRYLIC_COLORS.dark, letterSpacing: '-0.03em' }}>
          {progress}<span style={{ fontSize: 24, color: ACRYLIC_COLORS.muted }}>%</span>
        </div>

        <div style={{ fontFamily: inter.style.fontFamily, fontSize: 11, fontWeight: 600, color: ACRYLIC_COLORS.mid, marginTop: 4 }}>
          {filledSlots} of {totalSlots} slots filled
        </div>

        <div style={{ height: 6, width: '100%', borderRadius: 99, background: ACRYLIC_COLORS.lineLight, overflow: 'hidden', marginTop: 16, marginBottom: 28 }}>
          <div style={{ width: `${progress}%`, height: '100%', borderRadius: 99, background: ACRYLIC_COLORS.accent, transition: 'width 0.3s ease' }} />
        </div>

        <StatRow fontFamily={inter.style.fontFamily} label="Photos" value={totalPhotos} />
        <StatRow fontFamily={inter.style.fontFamily} label="Captions" value={totalCaptions} />
        <StatRow fontFamily={inter.style.fontFamily} label="Total Slots" value={totalSlots} />

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1.5px solid ${ACRYLIC_COLORS.lineLight}` }}>
          <div style={{ fontFamily: inter.style.fontFamily, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: ACRYLIC_COLORS.muted, marginBottom: 16 }}>
            Acrylic Details
          </div>
          <DetailRow fontFamily={inter.style.fontFamily} label="Tier" value={TIER_LABELS[tierKey] || tierKey} />
          <DetailRow fontFamily={inter.style.fontFamily} label="Size" value={SIZE_LABELS[acrylicSize] || acrylicSize} />
          <DetailRow fontFamily={inter.style.fontFamily} label="Orientation" value={orientation === 'square' ? 'Square' : orientation.charAt(0).toUpperCase() + orientation.slice(1)} />
          <DetailRow fontFamily={inter.style.fontFamily} label="Layout" value={layoutType.charAt(0).toUpperCase() + layoutType.slice(1)} />
          <DetailRow fontFamily={inter.style.fontFamily} label="Material" value="Crystal-clear acrylic" />
          <DetailRow fontFamily={inter.style.fontFamily} label="Mount" value="Float-mount included" />
        </div>
      </div>
    </aside>
  );
}

function StatRow({ label, value, fontFamily }: { label: string; value: number; fontFamily: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${ACRYLIC_COLORS.lineLight}` }}>
      <span style={{ fontFamily, fontSize: 12, fontWeight: 500, color: ACRYLIC_COLORS.mid }}>{label}</span>
      <span style={{ fontFamily: inter.style.fontFamily, fontSize: 14, fontWeight: 800, color: ACRYLIC_COLORS.dark }}>{value}</span>
    </div>
  );
}

function DetailRow({ label, value, fontFamily }: { label: string; value: string; fontFamily: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${ACRYLIC_COLORS.lineLight}` }}>
      <span style={{ fontFamily, fontSize: 11, fontWeight: 500, color: ACRYLIC_COLORS.muted }}>{label}</span>
      <span style={{ fontFamily: inter.style.fontFamily, fontSize: 12, fontWeight: 700, color: ACRYLIC_COLORS.dark }}>{value}</span>
    </div>
  );
}