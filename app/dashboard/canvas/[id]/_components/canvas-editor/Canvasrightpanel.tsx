'use client';

import { ui, Tag } from '@/components/dashboard/ui/AppBits';
import s from './canvasEditor.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

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
    <aside className={`fade-up d3 ${s.rightPanel}`} aria-label="Canvas progress and details">
      <Tag dot="var(--c2)">Canvas Progress</Tag>

      <p className={s.progressValue}>
        {progress}
        <span className={s.progressUnit}>%</span>
      </p>

      <p className={s.progressNote}>
        {filledSlots} of {totalSlots} slots filled
      </p>

      <div
        className={cx(ui.progress, s.progressBar)}
        role="progressbar"
        aria-label="Canvas progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div className={ui.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <dl className={s.list}>
        <StatRow label="Photos" value={totalPhotos} />
        <StatRow label="Captions" value={totalCaptions} />
        <StatRow label="Total Slots" value={totalSlots} />
      </dl>

      {/* ── Canvas details ── */}
      <div className={s.details}>
        <Tag dot="var(--c2)">Canvas Details</Tag>

        <dl className={s.list}>
          <DetailRow label="Tier" value={TIER_LABELS[tierKey] || tierKey} />
          <DetailRow label="Size" value={SIZE_LABELS[canvasSize] || canvasSize} />
          <DetailRow
            label="Orientation"
            value={orientation.charAt(0).toUpperCase() + orientation.slice(1)}
          />
          <DetailRow
            label="Layout"
            value={layoutType.charAt(0).toUpperCase() + layoutType.slice(1).replace('_', ' ')}
          />
          <DetailRow label="Stretcher" value="38mm premium" />
          <DetailRow label="Canvas" value="400gsm gallery-grade" />
        </dl>
      </div>
    </aside>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className={s.row}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={s.row}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
