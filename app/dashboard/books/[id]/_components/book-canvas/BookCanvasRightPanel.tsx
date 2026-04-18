'use client';

import { useState } from 'react';
import { inter } from '@/lib/fonts';
import { BOOK_CANVAS_COLORS, type CanvasSpread } from './BookCanvas';
import type { Page } from '@/types/memory-book';

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
  const [hovered, setHovered] = useState(false);

  return (
    <aside
      className="fade-up d3"
      style={{
        gridRow: '2',
        gridColumn: '3',
        background: BOOK_CANVAS_COLORS.panel,
        borderLeft: `1.5px solid ${BOOK_CANVAS_COLORS.line}`,
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
            color: BOOK_CANVAS_COLORS.muted,
            marginBottom: 20,
          }}
        >
          Book Progress
        </div>

        <div
          style={{
            fontFamily: inter.style.fontFamily,
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1,
            color: BOOK_CANVAS_COLORS.dark,
            letterSpacing: '-0.03em',
          }}
        >
          {progress}
          <span
            style={{
              fontSize: 24,
              color: BOOK_CANVAS_COLORS.muted,
            }}
          >
            %
          </span>
        </div>

        <div
          style={{
            fontFamily: inter.style.fontFamily,
            fontSize: 11,
            fontWeight: 600,
            color: BOOK_CANVAS_COLORS.mid,
            marginTop: 4,
          }}
        >
          {filled} of {totalPages} pages filled
        </div>

        <div
          style={{
            height: 6,
            width: '100%',
            borderRadius: 99,
            background: BOOK_CANVAS_COLORS.lineLight,
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
              background: BOOK_CANVAS_COLORS.accent,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <StatRow
          fontFamily={inter.style.fontFamily}
          label="Photos"
          value={totalPhotos}
        />
        <StatRow fontFamily={inter.style.fontFamily} label="Comments" value={totalComments} />
        <StatRow
          fontFamily={inter.style.fontFamily}
          label="Captions"
          value={totalCaptions}
        />
        <StatRow
          fontFamily={inter.style.fontFamily}
          label="Pages"
          value={totalPages}
        />

        <button
          type="button"
          onClick={onOpenGuide}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: '100%',
            marginTop: 24,
            borderRadius: 18,
            overflow: 'hidden',
            cursor: 'pointer',
            border: `1.5px solid ${BOOK_CANVAS_COLORS.lineLight}`,
            background: BOOK_CANVAS_COLORS.panel,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            transform: hovered ? 'scale(1.02)' : 'scale(1)',
            transformOrigin: 'center',
            boxShadow: hovered
              ? '0 16px 40px rgba(0,0,0,0.12)'
              : '0 8px 24px rgba(0,0,0,0.06)',
            transition: 'all 0.18s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: 170,
              overflow: 'hidden',
            }}
          >
            <img
              src="/book.png"
              alt="Guide"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          <div
            style={{
              padding: '18px 16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: BOOK_CANVAS_COLORS.dark,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
              }}
            >
              Build your memory book
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: BOOK_CANVAS_COLORS.accent,
              }}
            >
              Learn how to build your book

              <svg
                width="14"
                height="14"
                fill="none"
                stroke={BOOK_CANVAS_COLORS.accent}
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{ marginTop: 1 }}
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </div>
          </div>

          <div
            style={{
              height: 4,
              width: '100%',
              background: BOOK_CANVAS_COLORS.accent,
            }}
          />
        </button>
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
        borderBottom: `1px solid ${BOOK_CANVAS_COLORS.lineLight}`,
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize: 12,
          fontWeight: 500,
          color: BOOK_CANVAS_COLORS.mid,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: inter.style.fontFamily,
          fontSize: 14,
          fontWeight: 800,
          color: BOOK_CANVAS_COLORS.dark,
        }}
      >
        {value}
      </span>
    </div>
  );
}