'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Category = 'storage' | 'social' | 'genealogy';

const categories: { id: Category; label: string }[] = [
  { id: 'storage', label: 'vs Storage' },
  { id: 'social', label: 'vs Social' },
  { id: 'genealogy', label: 'vs Genealogy' },
];

const content = {
  storage: {
    them: {
      label: 'Dropbox, Google Drive, iCloud',
      verdict: 'Files without feeling.',
      points: [
        'Folders, not people',
        'No story behind the upload',
        'Organised chaos at best',
        'You find it. You feel nothing.',
      ],
    },
    us: {
      verdict: 'A life, not a drive.',
      points: [
        'Built around a person, not a path',
        'Every entry holds a story',
        'Timelines that actually make sense',
        'You find it. You feel everything.',
      ],
    },
  },
  social: {
    them: {
      label: 'Instagram, Facebook, Shared Albums',
      verdict: 'Moments made to disappear.',
      points: [
        'Built for engagement, not memory',
        'Algorithms decide what you see',
        'What matters today is gone tomorrow',
        'Public by default. Private never.',
      ],
    },
    us: {
      verdict: 'Quiet. Private. Permanent.',
      points: [
        'No feeds. No noise. No strangers',
        'You decide who sees anything',
        'Built to last decades, not days',
        'Private by design. Always.',
      ],
    },
  },
  genealogy: {
    them: {
      label: 'Ancestry, MyHeritage',
      verdict: 'Names and dates. Not people.',
      points: [
        'Records over personality',
        'Great at lineage, not character',
        'Documents who they were legally',
        'You find the name. Not the voice.',
      ],
    },
    us: {
      verdict: 'Who they were, not just when.',
      points: [
        'Voice, stories, and real moments',
        'Milestones with meaning attached',
        'The character behind the dates',
        'You find the voice. You hear them.',
      ],
    },
  },
};

export default function PlatformComparison() {
  const [active, setActive] = useState<Category>('storage');
  const data = content[active];

  return (
    <section style={{
      background: '#F7F0E3',
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 300,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        .pc-wrap {
          max-width: 1280px;
          margin: 0 auto;
          position: relative;
        }

        /* ── HEADER ── */
        .pc-header {
          padding: 64px 24px 48px;
          border-bottom: 2px solid rgba(26,20,16,0.15);
          display: flex;
flex-direction: column;
gap: 24px;
        }
        .pc-eyebrow {
          font-size: 1rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #b8924a;
          font-weight: 600;
          display: block;
          margin-bottom: 18px;
        }
        .pc-h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          line-height: 0.95;
          letter-spacing: -0.02em;
          color: #1a1410;
          margin: 0;
          font-size: 2.6rem;
        }
        .pc-header-sub {
          font-size: 1rem;
          line-height: 1.78;
          color: #4a3f30;
          margin: 0 0 0;
          
        }

        /* ── TABS ── */
        .pc-tabs {
          display: flex;
          padding: 0 24px;
          border-bottom: 2px solid rgba(26,20,16,0.15);
          gap: 0;
        }
        .pc-tab {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(26,20,16,0.4);
          background: none;
          border: none;
          cursor: pointer;
          padding: 20px 0;
          margin-right: 36px;
          position: relative;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .pc-tab:hover { color: #1a1410; }
        .pc-tab.active { color: #b8924a; font-weight: 600; }
        .pc-tab.active::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0; right: 0;
          height: 2px;
          background: #b8924a;
        }

        /* ── COMPARISON GRID ── */
        .pc-grid {
          display: grid;
          grid-template-columns: 1fr;
        }

        .pc-col {
          padding: 44px 24px;
        }
        .pc-col-them {
          border-bottom: 2px solid rgba(26,20,16,0.1);
        }

        .pc-col-label {
          font-size: 0.62rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 6px;
        }
        .pc-col-them .pc-col-label { color: rgba(26,20,16,0.55); }
        .pc-col-us   .pc-col-label { color: #b8924a; font-weight: 600; }

        .pc-them-names {
          font-size: 0.7rem;
          color: rgba(26,20,16,0.5);
          letter-spacing: 0.04em;
          margin-bottom: 18px;
          display: block;
        }

        .pc-verdict {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 500;
          line-height: 1.05;
          letter-spacing: -0.01em;
          margin: 0 0 24px;
          font-size: 1.7rem;
        }
        .pc-col-them .pc-verdict { color: rgba(26,20,16,0.5); font-style: italic; }
        .pc-col-us   .pc-verdict { color: #1a1410; }

        .pc-points { list-style: none; padding: 0; margin: 0; }
        .pc-point {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 0;
          border-top: 1px solid rgba(26,20,16,0.08);
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .pc-col-them .pc-point { color: rgba(26,20,16,0.55); }
        .pc-col-us   .pc-point { color: #1a1410; }

        .pc-marker-them {
          display: block; width: 14px; height: 14px;
          flex-shrink: 0; margin-top: 1px; position: relative;
        }
        .pc-marker-them::before, .pc-marker-them::after {
          content: ''; position: absolute;
          top: 50%; left: 50%;
          width: 10px; height: 1.5px;
          background: rgba(26,20,16,0.35);
        }
        .pc-marker-them::before { transform: translate(-50%,-50%) rotate(45deg); }
        .pc-marker-them::after  { transform: translate(-50%,-50%) rotate(-45deg); }

        .pc-marker-us {
          display: block; width: 6px; height: 6px;
          background: #b8924a; flex-shrink: 0; margin-top: 5px;
        }

        /* ══════════════════════════════
           TABLET  ≥ 640px
        ══════════════════════════════ */
        @media (min-width: 640px) {
          .pc-header  { padding: 80px 40px 52px; }
          .pc-h2      { font-size: 3.2rem; }
          .pc-tabs    { padding: 0 40px; }
          .pc-col     { padding: 52px 40px; }
          .pc-verdict { font-size: 2rem; }
          .pc-point   { font-size: 0.95rem; }
          .pc-header-sub { font-size: 1.05rem; }
        }

        /* ══════════════════════════════
           LAPTOP  ≥ 900px — 2-col header + 2-col grid
        ══════════════════════════════ */
        @media (min-width: 900px) {
          .pc-header {
            padding: 96px 56px 60px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 64px;
            align-items: end;
          }
          .pc-h2         { font-size: 3.8rem; }
          .pc-header-sub { font-size: 1.06rem; max-width: 40ch; }
          .pc-eyebrow    { font-size: 1.1rem; }

          .pc-tabs { padding: 0 56px; }
          .pc-tab  { font-size: 0.76rem; padding: 22px 0; margin-right: 44px; }

          .pc-grid { grid-template-columns: 1fr 1fr; }
          .pc-col  { padding: 60px 56px; }
          .pc-col-them {
            border-bottom: none;
            border-right: 2px solid rgba(26,20,16,0.12);
          }
          .pc-verdict { font-size: 2.2rem; margin-bottom: 28px; }
          .pc-point   { font-size: 0.97rem; padding: 12px 0; }
        }

        /* ══════════════════════════════
           DESKTOP  ≥ 1200px
        ══════════════════════════════ */
        @media (min-width: 1200px) {
          .pc-header  { padding: 120px 72px 68px; gap: 80px; }
          .pc-h2      { font-size: 4.6rem; }
          .pc-header-sub { font-size: 1.1rem; max-width: 42ch; }
          .pc-eyebrow { font-size: 1.2rem; }

          .pc-tabs { padding: 0 72px; }
          .pc-tab  { font-size: 0.8rem; padding: 24px 0; margin-right: 52px; }

          .pc-col     { padding: 72px 72px; }
          .pc-verdict { font-size: 2.6rem; margin-bottom: 32px; }
          .pc-point   { font-size: 1rem; padding: 13px 0; }
        }

        /* ══════════════════════════════
           XL  ≥ 1536px
        ══════════════════════════════ */
        @media (min-width: 1536px) {
          .pc-header  { padding: 136px 96px 80px; gap: 96px; }
          .pc-h2      { font-size: 5.4rem; }
          .pc-header-sub { font-size: 1.16rem; max-width: 44ch; }
          .pc-eyebrow { font-size: 1.3rem; }

          .pc-tabs { padding: 0 96px; }
          .pc-tab  { font-size: 0.84rem; margin-right: 60px; }

          .pc-col     { padding: 88px 96px; }
          .pc-verdict { font-size: 3rem; }
          .pc-point   { font-size: 1.05rem; }
        }
      `}</style>

      {/* Top rule */}
      <div style={{ height: '3px', background: 'linear-gradient(to right, rgba(184,146,74,0.9), rgba(184,146,74,0.4))' }} />

      <div className="pc-wrap">

        {/* HEADER */}
        <div className="pc-header">
          <div>
            <span className="pc-eyebrow">Why Ancestorii</span>
            <h2 className="pc-h2">
              Not storage.
              <br />
              Not social.
              <br />
              <em style={{ fontStyle: 'italic', color: '#b8924a' }}>Something else entirely.</em>
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '6px' }}>
            <p className="pc-header-sub">
              Most apps store photos and files. Ancestorii keeps the people, the voices, and the stories that belong beside them — privately, and for the long term.
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="pc-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`pc-tab ${active === cat.id ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* COMPARISON */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="pc-grid"
          >
            {/* THEM */}
            <div className="pc-col pc-col-them">
              <span className="pc-col-label">The standard way</span>
              <span className="pc-them-names">{data.them.label}</span>
              <p className="pc-verdict">{data.them.verdict}</p>
              <ul className="pc-points">
                {data.them.points.map((p, i) => (
                  <li key={i} className="pc-point">
                    <span className="pc-marker-them" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* US */}
            <div className="pc-col pc-col-us">
              <span className="pc-them-names" style={{ visibility: 'hidden' }}>placeholder</span>
              <span className="pc-col-label">The Ancestorii way</span>
              <p className="pc-verdict">{data.us.verdict}</p>
              <ul className="pc-points">
                {data.us.points.map((p, i) => (
                  <li key={i} className="pc-point">
                    <span className="pc-marker-us" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>

      {/* Bottom rule */}
      <div style={{ height: '3px', background: 'linear-gradient(to right, rgba(184,146,74,0.9), rgba(184,146,74,0.4))' }} />
    </section>
  );
}