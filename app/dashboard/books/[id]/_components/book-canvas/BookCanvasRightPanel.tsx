'use client';

import { ArrowRight, BookOpen } from 'lucide-react';
import { ui, IconTile, Tag, toneByKey } from '@/components/dashboard/ui/AppBits';
import type { CanvasSpread } from './BookCanvas';
import chrome from './bookChrome.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export default function BookCanvasRightPanel({
  progress,
  filled,
  totalPages,
  totalPhotos,
  totalCaptions,
  totalComments,
  currentSpread,
  currentSpreadLabel,
  spread,
  onOpenGuide,
}: {
  progress: number;
  filled: number;
  totalPages: number;
  totalPhotos: number;
  totalCaptions: number;
  totalComments: number;
  currentSpread: CanvasSpread;
  currentSpreadLabel: string;
  spread: number;
  onOpenGuide: () => void;
}) {
  return (
    <aside
      className={cx('fade-up d3', chrome.panel)}
      style={{
        gridRow: '2',
        gridColumn: '3',
      }}
      aria-label="Book progress"
    >
      <Tag dot="var(--c2)">Book Progress</Tag>

      <p className={chrome.progressValue}>
        {progress}
        <span className={chrome.progressPct}>%</span>
      </p>

      <p className={chrome.progressNote}>
        {filled} of {totalPages} pages filled
      </p>

      <div
        className={cx(ui.progress, chrome.progressBar)}
        role="progressbar"
        aria-label="Pages filled"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div className={cx(ui.progressFill, chrome.progressFill)} style={{ width: `${progress}%` }} />
      </div>

      <dl className={chrome.stats}>
        <StatRow label="Photos" value={totalPhotos} />
        <StatRow label="Comments" value={totalComments} />
        <StatRow label="Captions" value={totalCaptions} />
        <StatRow label="Pages" value={totalPages} />
      </dl>

      <button
        type="button"
        onClick={onOpenGuide}
        className={cx(ui.card, ui.cardLink, chrome.guideCard)}
      >
        <IconTile Icon={BookOpen} tone={toneByKey('orange')} />
        <span className={chrome.guideTitle}>Build your memory book</span>
        <span className={chrome.guideLink}>
          Learn how to build your book
          <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
        </span>
      </button>
    </aside>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className={chrome.statRow}>
      <dt className={chrome.statLabel}>{label}</dt>
      <dd className={chrome.statValue}>{value}</dd>
    </div>
  );
}
