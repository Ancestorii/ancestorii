'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

/* ─── GOLD ACCENT ─── */
const G = ({ children }: { children: React.ReactNode }) => (
  <strong style={{ color: '#b8924a', fontWeight: 500 }}>{children}</strong>
);

/* ─── FADE HOOK (matches JourneyExperience) ─── */
function useFade(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -32px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return {
    ref,
    style: {
      opacity: 0,
      transform: 'translateY(20px)',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    } as React.CSSProperties,
  };
}

/* ─── FEATURES ─── */
const features = [
  {
    id: '01',
    label: 'Choose your photos and add captions inside the app',
  },
  {
    id: '02',
    label: 'Printed on 200gsm gloss pages with a hardcover matte finish',
  },
  {
    id: '03',
    label: 'Free delivery worldwide — straight to your door',
  },
];

export default function MemoryBookSection() {
  const fH = useFade(0);
  const fI = useFade(120);
  const fF = useFade(200);

  return (
    <section className="mb-section">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');

        .mb-section {
          background: #FFFFFF;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          position: relative;
          overflow: hidden;
        }

        .mb-wrap {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* ── HEADER ── */
        .mb-header {
          padding: 64px 24px 0;
          margin-bottom: 40px;
        }
        .mb-eyebrow {
          font-size: 1rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #b8924a;
          margin: 0 0 20px;
          font-weight: 600;
          display: block;
        }
        .mb-h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          line-height: 0.97;
          letter-spacing: -0.02em;
          color: #1a1410;
          margin: 0 0 24px;
          font-size: 2.6rem;
        }
        .mb-sub {
          font-size: 1rem;
          line-height: 1.82;
          color: #2e2820;
          margin: 0;
          max-width: 100%;
        }

        /* ── IMAGE AREA ── */
        .mb-image-wrap {
          padding: 0 24px;
          margin-bottom: 48px;
        }
        .mb-image-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border: 1px solid rgba(26,20,16,0.10);
          overflow: hidden;
          background: #f7f2ea;
          box-shadow: 0 20px 50px -16px rgba(26,20,16,0.12);
        }
        .mb-image-badge {
          position: absolute;
          bottom: 16px;
          left: 16px;
          z-index: 2;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(26,20,16,0.08);
          padding: 10px 16px;
          box-shadow: 0 4px 16px rgba(26,20,16,0.06);
        }
        .mb-image-badge p {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-weight: 500;
          color: #1a1410;
          font-size: 0.88rem;
          line-height: 1.4;
          margin: 0;
        }

        /* ── FEATURES ── */
        .mb-features {
          padding: 0 24px 20px;
        }
        .mb-feat-item {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: start;
          gap: 16px;
          padding: 20px 0;
          border-bottom: 1px solid rgba(26,20,16,0.10);
        }
        .mb-feat-item:first-child {
          border-top: 2px solid rgba(26,20,16,0.18);
        }
        .mb-feat-num {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          font-size: 1.6rem;
          color: #b8924a;
          line-height: 1;
          min-width: 32px;
        }
        .mb-feat-text {
          font-size: 0.95rem;
          line-height: 1.7;
          color: #1a1410;
        }

        /* ── ACCENT QUOTE ── */
        .mb-accent {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-weight: 700;
          color: #1a1410;
          line-height: 1.5;
          margin: 0;
          font-size: 1.18rem;
          letter-spacing: 0.02em;
          padding: 32px 24px 0;
        }
        .mb-accent span {
          color: #b8924a;
        }

        /* ── CTA ── */
        .mb-cta-wrap {
          padding: 36px 24px 64px;
        }
        .mb-btn-dark {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #faf8f4;
          background: #1a1410;
          padding: 14px 32px;
          text-decoration: none;
          transition: background 0.22s;
          border: none;
          cursor: pointer;
        }
        .mb-btn-dark:hover {
          background: #b8924a;
        }

        /* ── TOP BORDER ── */
        .mb-section-border {
          border-top: 2px solid rgba(26,20,16,0.2);
          margin: 0 24px;
        }

        /* ══════════════════════════════
           TABLET ≥ 640px
        ══════════════════════════════ */
        @media (min-width: 640px) {
          .mb-header { padding: 80px 40px 0; margin-bottom: 48px; }
          .mb-h2 { font-size: 3.4rem; }
          .mb-sub { font-size: 1.05rem; }
          .mb-image-wrap { padding: 0 40px; margin-bottom: 56px; }
          .mb-features { padding: 0 40px 24px; }
          .mb-feat-text { font-size: 1rem; }
          .mb-accent { font-size: 1.2rem; padding: 36px 40px 0; }
          .mb-cta-wrap { padding: 40px 40px 80px; }
          .mb-btn-dark { font-size: 0.82rem; padding: 15px 34px; }
          .mb-section-border { margin: 0 40px; }
        }

        /* ══════════════════════════════
           LAPTOP ≥ 900px — side-by-side
        ══════════════════════════════ */
        @media (min-width: 900px) {
          .mb-header {
            padding: 100px 56px 0;
            margin-bottom: 56px;
          }
          .mb-header-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 56px;
            align-items: end;
          }
          .mb-h2 { font-size: 4.2rem; margin-bottom: 0; }
          .mb-sub { font-size: 1.08rem; max-width: 40ch; }

          .mb-body {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 56px;
            padding: 0 56px;
            align-items: center;
          }
          .mb-image-wrap {
            padding: 0;
            margin-bottom: 0;
          }
          .mb-right-col {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .mb-features { padding: 0 0 20px; }
          .mb-accent { padding: 32px 0 0; }
          .mb-cta-wrap { padding: 36px 56px 100px; }
          .mb-section-border { margin: 0 56px; }
        }

        /* ══════════════════════════════
           DESKTOP ≥ 1200px
        ══════════════════════════════ */
        @media (min-width: 1200px) {
          .mb-header {
            padding: 128px 72px 0;
            margin-bottom: 72px;
          }
          .mb-header-grid { gap: 80px; }
          .mb-h2 { font-size: 5.4rem; }
          .mb-sub { font-size: 1.12rem; max-width: 42ch; }
          .mb-eyebrow { font-size: 1.2rem; margin-bottom: 24px; }

          .mb-body { gap: 80px; padding: 0 72px; }
          .mb-feat-item { padding: 22px 0; gap: 20px; }
          .mb-feat-num { font-size: 1.8rem; }
          .mb-feat-text { font-size: 1.06rem; }
          .mb-accent { font-size: 1.3rem; padding: 40px 0 0; }

          .mb-cta-wrap { padding: 48px 72px 128px; }
          .mb-btn-dark { font-size: 0.85rem; padding: 16px 40px; }

          .mb-image-badge { bottom: 20px; left: 20px; padding: 12px 20px; }
          .mb-image-badge p { font-size: 0.95rem; }
          .mb-section-border { margin: 0 72px; }
        }

        /* ══════════════════════════════
           XL ≥ 1536px
        ══════════════════════════════ */
        @media (min-width: 1536px) {
          .mb-header { padding: 144px 96px 0; margin-bottom: 88px; }
          .mb-header-grid { gap: 96px; }
          .mb-h2 { font-size: 6.2rem; }
          .mb-sub { font-size: 1.18rem; max-width: 44ch; }
          .mb-eyebrow { font-size: 1.3rem; }

          .mb-body { gap: 96px; padding: 0 96px; }
          .mb-feat-num { font-size: 2rem; }
          .mb-feat-text { font-size: 1.12rem; }
          .mb-accent { font-size: 1.45rem; }

          .mb-cta-wrap { padding: 56px 96px 144px; }
          .mb-section-border { margin: 0 96px; }
        }
      `}</style>

      {/* Top border — matches JourneyExperience step dividers */}
      <div className="mb-section-border" />

      <div className="mb-wrap">

        {/* ── HEADER ── */}
        <div className="mb-header">
          <div ref={fH.ref} style={fH.style} className="mb-header-grid">
            <div>
              <span className="mb-eyebrow">From Screen to Shelf</span>
              <h2 className="mb-h2">
                Your photos deserve<br />
                more than <em style={{ fontStyle: 'italic', color: '#b8924a' }}>a phone.</em>
              </h2>
            </div>
            <div>
              <p className="mb-sub">
                Hundreds of photos. One book. Pick the moments that matter,
                add the stories behind them, and we'll print it as a
                hardcover book — <G>delivered to your door.</G> Premium pages.
                Real weight in your hands. Something your family can hold, not scroll.
              </p>
            </div>
          </div>
        </div>

        {/* ── BODY: image + features ── */}
        <div className="mb-body">

          {/* Image */}
          <div ref={fI.ref} style={fI.style} className="mb-image-wrap">
            <div className="mb-image-container">
              <Image
                src="/book-preview.png"
                alt="Memory Book preview — real photos printed on premium pages"
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                className="object-cover"
                style={{ objectPosition: '50% 50%' }}
              />
              <div className="mb-image-badge">
                <p>Built inside the app. Delivered to your door.</p>
              </div>
            </div>
          </div>

          {/* Features + quote + CTA */}
          <div ref={fF.ref} style={fF.style} className="mb-right-col">
            <div className="mb-features">
              {features.map((feat) => (
                <div key={feat.id} className="mb-feat-item">
                  <span className="mb-feat-num">{feat.id}</span>
                  <p className="mb-feat-text">{feat.label}</p>
                </div>
              ))}
            </div>

            <p
  className="mb-accent"
  style={{ fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.5 }}
>
  "The photos were on my phone for years.{' '}
  <span>Now they're on my shelf forever.</span>"
</p>

            <div className="mb-cta-wrap">
              <a href="/signup" className="mb-btn-dark">
                Start your book <ArrowRight size={14} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}