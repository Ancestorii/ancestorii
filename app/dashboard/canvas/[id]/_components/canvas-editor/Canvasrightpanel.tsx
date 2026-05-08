'use client';

import { inter } from '@/lib/fonts';
import { CANVAS_COLORS } from './Canvaseditor';

const SIZE_LABELS: Record<string, string> = {
  '16x36': '16×36″',
  '20x32': '20×32″',
  '24x72': '24×72″',
};

const TIER_LABELS: Record<string, string> = {
  moment: 'The Moment',
  heirloom: 'The Heirloom',
  heritage: 'The Heritage',
};

export default function CanvasRightPanel({
  progress,
  filledSlots,
  totalSlots,
  totalPhotos,
  totalCaptions,
  tierKey,
  orientation,
  canvasSize,
  layoutType,
}: {
  progress: number;
  filledSlots: number;
  totalSlots: number;
  totalPhotos: number;
  totalCaptions: number;
  tierKey: string;
  orientation: string;
  canvasSize: string;
  layoutType: string;
}) {
  return (
    <aside
      className="fade-up d3"
      style={{
        gridRow: '2',
        gridColumn: '3',
        background: CANVAS_COLORS.panel,
        borderLeft: `1.5px solid ${CANVAS_COLORS.line}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 18px',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontFamily: inter.style.fontFamily,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: CANVAS_COLORS.muted,
            marginBottom: 20,
          }}
        >
          Canvas Progress
        </div>

        <div
          style={{
            fontFamily: inter.style.fontFamily,
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1,
            color: CANVAS_COLORS.dark,
            letterSpacing: '-0.03em',
          }}
        >
          {progress}
          <span style={{ fontSize: 24, color: CANVAS_COLORS.muted }}>%</span>
        </div>

        <div
          style={{
            fontFamily: inter.style.fontFamily,
            fontSize: 11,
            fontWeight: 600,
            color: CANVAS_COLORS.mid,
            marginTop: 4,
          }}
        >
          {filledSlots} of {totalSlots} slots filled
        </div>

        <div
          style={{
            height: 6,
            width: '100%',
            borderRadius: 99,
            background: CANVAS_COLORS.lineLight,
            overflow: 'hidden',
            marginTop: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: 99,
              background: CANVAS_COLORS.accent,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <StatRow fontFamily={inter.style.fontFamily} label="Photos" value={totalPhotos} />
        <StatRow fontFamily={inter.style.fontFamily} label="Captions" value={totalCaptions} />
        <StatRow fontFamily={inter.style.fontFamily} label="Total Slots" value={totalSlots} />

        {/* ── Canvas details ── */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: `1.5px solid ${CANVAS_COLORS.lineLight}`,
          }}
        >
          <div
            style={{
              fontFamily: inter.style.fontFamily,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: CANVAS_COLORS.muted,
              marginBottom: 16,
            }}
          >
            Canvas Details
          </div>

          <DetailRow fontFamily={inter.style.fontFamily} label="Tier" value={TIER_LABELS[tierKey] || tierKey} />
          <DetailRow fontFamily={inter.style.fontFamily} label="Size" value={SIZE_LABELS[canvasSize] || canvasSize} />
          <DetailRow
            fontFamily={inter.style.fontFamily}
            label="Orientation"
            value={orientation.charAt(0).toUpperCase() + orientation.slice(1)}
          />
          <DetailRow
            fontFamily={inter.style.fontFamily}
            label="Layout"
            value={layoutType.charAt(0).toUpperCase() + layoutType.slice(1).replace('_', ' ')}
          />
          <DetailRow fontFamily={inter.style.fontFamily} label="Stretcher" value="38mm premium" />
          <DetailRow fontFamily={inter.style.fontFamily} label="Canvas" value="400gsm gallery-grade" />
        </div>
      </div>
    </aside>
  );
}

function StatRow({
  label,
  value,
  fontFamily,
}: {
  label: string;
  value: number;
  fontFamily: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: `1px solid ${CANVAS_COLORS.lineLight}`,
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize: 12,
          fontWeight: 500,
          color: CANVAS_COLORS.mid,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: inter.style.fontFamily,
          fontSize: 14,
          fontWeight: 800,
          color: CANVAS_COLORS.dark,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function DetailRow({
  label,
  value,
  fontFamily,
}: {
  label: string;
  value: string;
  fontFamily: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: `1px solid ${CANVAS_COLORS.lineLight}`,
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize: 11,
          fontWeight: 500,
          color: CANVAS_COLORS.muted,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: inter.style.fontFamily,
          fontSize: 12,
          fontWeight: 700,
          color: CANVAS_COLORS.dark,
        }}
      >
        {value}
      </span>
    </div>
  );
}