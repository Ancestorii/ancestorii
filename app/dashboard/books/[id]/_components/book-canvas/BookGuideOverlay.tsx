'use client';

import { useState } from 'react';
import { inter } from '@/lib/fonts';
const BOOK_CANVAS_COLORS = {
  canvas: '#F7F5F0',
  panel: '#FFFFFF',
  paper: '#FFFFFF',
  paperAlt: '#FDFCF9',
  dark: '#1A1714',
  darkSoft: '#2E2A24',
  mid: '#6B6358',
  muted: '#A39B8F',
  accent: '#B8860B',
  accentSoft: '#F0E2BF',
  accentBg: '#FBF6EA',
  line: '#D9D3C7',
  lineLight: '#EAE5DB',
  lineDark: '#B5AFA3',
  stage: '#EDEBE5',
  hover: '#F2EFE8',
} as const;

const STEPS = [
  {
    number: '01',
    title: 'Upload your photos',
    body: "Go to Media and upload photos. They'll appear in your library ready to place.",
    icon: (
      <svg width="28" height="28" fill="none" stroke={BOOK_CANVAS_COLORS.accent} strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Choose a page layout',
   body: 'Go to Layout and pick a style — Portrait, Landscape, Duo, Grid, or Feature. Each page can be different.',
    icon: (
      <svg width="28" height="28" fill="none" stroke={BOOK_CANVAS_COLORS.accent} strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Place photos on pages',
    body: 'Click a photo in your library, then click an empty slot on any page to place it.',
    icon: (
      <svg width="28" height="28" fill="none" stroke={BOOK_CANVAS_COLORS.accent} strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" />
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Add headings & comments',
    body: 'Type directly on the page. Use the Text tab to toggle headings and comments on or off per page.',
    icon: (
      <svg width="28" height="28" fill="none" stroke={BOOK_CANVAS_COLORS.accent} strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M4 7V4h16v3M9 20h6M12 4v16" />
      </svg>
    ),
  },
  {
    number: '05',
    title: 'Design your cover',
    body: 'Navigate to Cover and pick Classic, Full Bleed, or Trio. Add a title, subtitle, and cover image.',
    icon: (
      <svg width="28" height="28" fill="none" stroke={BOOK_CANVAS_COLORS.accent} strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M12 3v18" />
      </svg>
    ),
  },
  {
    number: '06',
    title: 'Preview & order',
    body: "Hit Preview to check your book. When you're happy, Order Book to send it to print.",
    icon: (
      <svg width="28" height="28" fill="none" stroke={BOOK_CANVAS_COLORS.accent} strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function BookGuideOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [activeStep, setActiveStep] = useState(0);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(26, 23, 20, 0.45)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'guideBackdropIn 0.25s ease both',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '90%',
          maxWidth: 640,
          maxHeight: '85vh',
          background: BOOK_CANVAS_COLORS.panel,
          borderRadius: 16,
          boxShadow:
            '0 4px 12px rgba(0,0,0,0.06), 0 24px 60px rgba(0,0,0,0.14)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'guidePanelIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        <div
          style={{
            padding: '28px 32px 0',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: inter.style.fontFamily,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#d4af37',
                  marginBottom: 8,
                }}
              >
                Getting Started
              </div>
              <h2
                style={{
                  fontFamily: inter.style.fontFamily,
                  fontSize: 22,
                  fontWeight: 800,
                  color: BOOK_CANVAS_COLORS.dark,
                  letterSpacing: '-0.03em',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Build your memory book
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1.5px solid ${BOOK_CANVAS_COLORS.line}`,
                borderRadius: 8,
                background: 'none',
                cursor: 'pointer',
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke={BOOK_CANVAS_COLORS.mid}
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 6,
              marginTop: 20,
            }}
          >
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveStep(i)}
                style={{
                  width: i === activeStep ? 28 : 8,
                  height: 8,
                  borderRadius: 99,
                  border: 'none',
                  cursor: 'pointer',
                  background:
                    i === activeStep
                      ? '#d4af37'
                      : i < activeStep
                        ? '#d4af3755'
                        : BOOK_CANVAS_COLORS.lineLight,
                  transition: 'all 0.25s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            height: 1,
            background: BOOK_CANVAS_COLORS.lineLight,
            margin: '20px 32px 0',
            flexShrink: 0,
          }}
        />

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '24px 32px 28px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STEPS.map((step, i) => {
              const active = i === activeStep;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveStep(i)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    borderRadius: 14,
                    border: active
                      ? `1.5px solid ${BOOK_CANVAS_COLORS.line}`
                      : `1px solid transparent`,
                    background: active
                      ? BOOK_CANVAS_COLORS.canvas
                      : 'transparent',
                    padding: active ? '20px 22px' : '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: inter.style.fontFamily,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = BOOK_CANVAS_COLORS.hover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: active ? 'flex-start' : 'center',
                      gap: 14,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: inter.style.fontFamily,
                        fontSize: 11,
                        fontWeight: 800,
                        color: active
                          ? '#d4af37'
                          : BOOK_CANVAS_COLORS.muted,
                        width: 26,
                        flexShrink: 0,
                        marginTop: active ? 2 : 0,
                      }}
                    >
                      {step.number}
                    </span>

                    {active ? (
                      <>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: BOOK_CANVAS_COLORS.accentBg,
                            border: `1.5px solid #d4af3733`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {step.icon}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: inter.style.fontFamily,
                              fontSize: 16,
                              fontWeight: 800,
                              color: BOOK_CANVAS_COLORS.dark,
                              letterSpacing: '-0.02em',
                              lineHeight: 1.25,
                              marginBottom: 6,
                            }}
                          >
                            {step.title}
                          </div>

                          <div
                            style={{
                              fontFamily: inter.style.fontFamily,
                              fontSize: 13,
                              fontWeight: 500,
                              color: BOOK_CANVAS_COLORS.mid,
                              lineHeight: 1.5,
                            }}
                          >
                            {step.body}
                          </div>
                        </div>
                      </>
                    ) : (
                      <span
                        style={{
                          fontFamily: inter.style.fontFamily,
                          fontSize: 14,
                          fontWeight: 650,
                          color: BOOK_CANVAS_COLORS.darkSoft,
                        }}
                      >
                        {step.title}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 32px 24px',
            flexShrink: 0,
            borderTop: `1px solid ${BOOK_CANVAS_COLORS.lineLight}`,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            disabled={activeStep === 0}
            style={{
              padding: '9px 20px',
              borderRadius: 10,
              border: `1.5px solid ${BOOK_CANVAS_COLORS.line}`,
              background: 'none',
              fontFamily: inter.style.fontFamily,
              fontSize: 13,
              fontWeight: 600,
              color:
                activeStep === 0
                  ? BOOK_CANVAS_COLORS.muted
                  : BOOK_CANVAS_COLORS.dark,
              cursor: activeStep === 0 ? 'default' : 'pointer',
              opacity: activeStep === 0 ? 0.4 : 1,
              transition: 'opacity 0.15s ease',
            }}
          >
            Previous
          </button>

          {activeStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() =>
                setActiveStep((s) => Math.min(STEPS.length - 1, s + 1))
              }
              style={{
                padding: '9px 24px',
                borderRadius: 10,
                border: 'none',
                background: BOOK_CANVAS_COLORS.dark,
                fontFamily: inter.style.fontFamily,
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 24px',
                borderRadius: 10,
                border: 'none',
                background: '#d4af37',
                fontFamily: inter.style.fontFamily,
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Start Building
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes guideBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes guidePanelIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}