'use client';

import { ui, Tag } from '@/components/dashboard/ui/AppBits';
import s from './acrylicEditor.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

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
      className={cx('fade-up d3', s.side)}
      style={{ gridRow: '2', gridColumn: '3' }}
      aria-label="Progress and details"
    >
      <h2 className="m-0">
        <Tag dot="var(--c2)">Acrylic Progress</Tag>
      </h2>

      <p className={s.progressValue}>
        {progress}
        <span className={s.progressPct}>%</span>
      </p>

      <p className={s.progressNote}>
        {filledSlots} of {totalSlots} slots filled
      </p>

      <div
        className={cx(ui.progress, s.progressBar)}
        role="progressbar"
        aria-label="Acrylic progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div className={cx(ui.progressFill, s.progressFill)} style={{ width: `${progress}%` }} />
      </div>

      <dl className={s.rows}>
        <StatRow label="Photos" value={totalPhotos} />
        <StatRow label="Captions" value={totalCaptions} />
        <StatRow label="Total Slots" value={totalSlots} />
      </dl>

      <div className={s.details}>
        <h2 className="m-0">
          <Tag dot="var(--c2)">Acrylic Details</Tag>
        </h2>
        <dl className={s.rows}>
          <StatRow label="Tier" value={TIER_LABELS[tierKey] || tierKey} />
          <StatRow label="Size" value={SIZE_LABELS[acrylicSize] || acrylicSize} />
          <StatRow label="Orientation" value={orientation === 'square' ? 'Square' : orientation.charAt(0).toUpperCase() + orientation.slice(1)} />
          <StatRow label="Layout" value={layoutType.charAt(0).toUpperCase() + layoutType.slice(1)} />
          <StatRow label="Material" value="Crystal-clear acrylic" />
          <StatRow label="Mount" value="Float-mount included" />
        </dl>
      </div>
    </aside>
  );
}

function StatRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className={s.row}>
      <dt className={s.rowLabel}>{label}</dt>
      <dd className={s.rowValue}>{value}</dd>
    </div>
  );
}
