'use client';

import React, { useEffect, useRef } from 'react';
import { UserPlus, Clock, BookImage, Lock, ArrowRight } from 'lucide-react';

const G = ({ children }: { children: React.ReactNode }) => (
  <strong style={{ color: '#b8924a', fontWeight: 500 }}>{children}</strong>
);

const steps = [
  {
    id: '01',
    eyebrow: 'Start here',
    title: 'Add a loved one.',
    description: (
      <>
        Give someone their own space in your family library.
        A name, a photo, a bit of who they are. <G>Everything you add from here belongs to them.</G>
      </>
    ),
    accent: '"A person with a story worth keeping."',
    Icon: UserPlus,
    features: ['Name, photo & biography', 'Soon you can invite family to contribute'],
  },
  {
    id: '02',
    eyebrow: 'Build their story',
    title: 'Create a timeline of their life.',
    description: (
      <>
        Add the moments that shaped them in order —
        so the full picture finally makes sense.
        <G> Each entry holds a photo, a date, and the story behind it.</G>
      </>
    ),
    accent: '"A life laid out clearly, so nothing gets lost."',
    Icon: Clock,
    features: ['Chronological milestones', 'Photos + written stories per entry'],
  },
  {
    id: '03',
    eyebrow: 'Collect the memories',
    title: 'Albums with messages and voice notes.',
    description: (
      <>
        Group photos into albums that actually mean something.
        Every photo carries <G>a written message and a voice note</G> —
        so the story behind it never disappears.
      </>
    ),
    accent: '"The photo shows what happened. The voice tells you how it felt."',
    Icon: BookImage,
    features: ['Albums by theme or era', 'Voice note recordings per photo'],
  },
  {
    id: '04',
    eyebrow: 'Preserve for the future',
    title: 'Seal a capsule for the right moment.',
    description: (
      <>
        Write something. Record a message. Then seal it and
        <G> set the exact moment it opens</G> — a birthday, a wedding, a day not yet here.
      </>
    ),
    accent: '"The closest thing to being in a room you can\'t be in yet."',
    Icon: Lock,
    features: ['Video, audio or written messages', 'Unlocks on a date you choose'],
  },
];

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

export default function JourneyExperience() {
  const fH = useFade(0);
  const fS = useFade(100);

  return (
    <section className="jx-section">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');

        .jx-section {
          background: #FFFFFF;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
        }

        .jx-wrap {
          max-width: 1280px;
          margin: 0 auto;
        }

        /* ── HEADER ── */
        .jx-header {
          padding: 64px 24px 0;
          margin-bottom: 48px;
        }
        .jx-header-top {
          margin-bottom: 24px;
        }
        .jx-header-bottom {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .jx-header-h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          line-height: 0.97;
          letter-spacing: -0.02em;
          color: #1a1410;
          margin: 0 0 24px;
          font-size: 2.6rem;
        }
        .jx-header-p {
          font-size: 1rem;
          line-height: 1.78;
          color: #3d3428;
          margin: 0 0 28px;
          max-width: 100%;
        }

        /* ── STEP ── */
        .jx-step {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          padding: 44px 24px;
          border-top: 2px solid rgba(26,20,16,0.2);
        }
        .jx-step:last-of-type {
          border-bottom: 2px solid rgba(26,20,16,0.2);
        }
        .jx-num {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          line-height: 0.85;
          color: #b8924a;
          letter-spacing: -0.05em;
          user-select: none;
          font-size: 7rem;
          margin-bottom: 14px;
        }
        .jx-eyebrow {
          font-size: 1rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #b8924a;
          margin: 0 0 8px;
          font-weight: 600;
          display: block;
        }
        .jx-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: #1a1410;
          margin: 0;
          font-size: 1.6rem;
        }
        .jx-desc {
          line-height: 1.82;
          color: #2e2820;
          margin: 0 0 18px;
          font-size: 0.98rem;
        }
        .jx-accent {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-weight: 700; /* stronger for mobile */
  color: #a67c2e;
  line-height: 1.55;
  margin: 0;
  font-size: 1.18rem;
  letter-spacing: 0.02em;
  word-spacing: 0.12em;
}
        .jx-feat-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.84rem;
          color: #1a1410;
          padding: 6px 0;
          border-bottom: 1px solid rgba(26,20,16,0.15);
        }
        .jx-dot {
          display: block;
          width: 5px;
          height: 5px;
          background: #b8924a;
          flex-shrink: 0;
        }

        /* ── CLOSING ── */
        .jx-close {
          background: #1a1410;
          position: relative;
          overflow: hidden;
        }
        .jx-close-inner {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          padding: 72px 24px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .jx-close-h2 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 300;
          line-height: 0.97;
          letter-spacing: -0.02em;
          color: #f7f2ea;
          margin: 0;
          font-size: 2.6rem;
        }
        .jx-close-p {
          font-size: 1rem;
          line-height: 1.8;
          color: rgba(247,242,234,0.88);
          margin: 0 0 32px;
        }

        /* ── BUTTONS ── */
        .jx-btn-dark {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 500;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: #faf8f4; background: #1a1410;
          padding: 14px 30px; text-decoration: none;
          transition: background 0.22s; border: none; cursor: pointer;
        }
        .jx-btn-dark:hover { background: #b8924a; }
        .jx-btn-gold {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 500;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: #1a1410; background: #b8924a;
          padding: 14px 32px; text-decoration: none;
          transition: background 0.22s; border: none; cursor: pointer;
        }
        .jx-btn-gold:hover { background: #cfa85e; }

        /* ══════════════════════════════
           TABLET  ≥ 640px
        ══════════════════════════════ */
        @media (min-width: 640px) {
          .jx-header { padding: 80px 40px 0; margin-bottom: 56px; }
          .jx-header-h2 { font-size: 3.4rem; }
          .jx-header-p { font-size: 1.05rem; }

          .jx-step { padding: 52px 40px; gap: 24px; }
          .jx-num { font-size: 8rem; }
          .jx-title { font-size: 1.9rem; }
          .jx-desc { font-size: 1rem; }
          .jx-accent { font-size: 1.18rem; }

          .jx-close-inner { padding: 88px 40px; }
          .jx-close-h2 { font-size: 3.2rem; }
          .jx-close-p { font-size: 1.05rem; }
          .jx-btn-dark, .jx-btn-gold { font-size: 0.82rem; padding: 15px 34px; }
        }

        /* ══════════════════════════════
           LAPTOP  ≥ 900px
        ══════════════════════════════ */
        @media (min-width: 900px) {
          .jx-header {
            padding: 100px 56px 0;
            margin-bottom: 64px;
          }
          .jx-header-bottom {
            grid-template-columns: 1fr 1fr;
            align-items: end;
            gap: 56px;
          }
          .jx-header-h2 { font-size: 4.2rem; margin-bottom: 32px; }
          .jx-header-p { font-size: 1.08rem; max-width: 40ch; }

          .jx-step {
            grid-template-columns: 220px 1fr;
            align-items: start;
            gap: 52px;
            padding: 60px 56px;
          }
          .jx-num { font-size: 9rem; margin-bottom: 16px; }
          .jx-eyebrow { font-size: 1.15rem; font-weight: 600; }
          .jx-title { font-size: 1.75rem; }
          .jx-desc { font-size: 1.02rem; max-width: 50ch; }
          .jx-accent { font-size: 1.2rem; }
          .jx-feat-item { font-size: 0.88rem; }

          .jx-close-inner {
            grid-template-columns: 1fr 1fr;
            align-items: end;
            padding: 104px 56px;
            gap: 56px;
          }
          .jx-close-h2 { font-size: 3.8rem; }
          .jx-close-p { font-size: 1.08rem; max-width: 40ch; }
        }

        /* ══════════════════════════════
           DESKTOP  ≥ 1200px
        ══════════════════════════════ */
        @media (min-width: 1200px) {
          .jx-header {
            padding: 128px 72px 0;
            margin-bottom: 80px;
          }
          .jx-header-bottom { gap: 80px; }
          .jx-header-h2 { font-size: 5.4rem; margin-bottom: 40px; }
          .jx-header-p { font-size: 1.12rem; max-width: 42ch; margin-bottom: 40px; }

          .jx-step {
            grid-template-columns: 280px 1fr;
            gap: 80px;
            padding: 80px 72px;
          }
          .jx-num { font-size: 11rem; margin-bottom: 20px; }
          .jx-eyebrow { font-size: 1.2rem; font-weight: 600; margin-bottom: 12px; }
          .jx-title { font-size: 2.1rem; }
          .jx-desc { font-size: 1.06rem; line-height: 1.88; max-width: 52ch; margin-bottom: 24px; }
          .jx-accent { font-size: 1.3rem; }
          .jx-feat-item { font-size: 0.9rem; padding: 7px 0; }

          .jx-close-inner { padding: 128px 72px; gap: 80px; }
          .jx-close-h2 { font-size: 5rem; }
          .jx-close-p { font-size: 1.12rem; max-width: 42ch; margin-bottom: 40px; }
          .jx-btn-dark, .jx-btn-gold { font-size: 0.85rem; padding: 16px 40px; }
        }

        /* ══════════════════════════════
           XL  ≥ 1536px
        ══════════════════════════════ */
        @media (min-width: 1536px) {
          .jx-header { padding: 144px 96px 0; margin-bottom: 96px; }
          .jx-header-bottom { gap: 96px; }
          .jx-header-h2 { font-size: 6.2rem; margin-bottom: 48px; }
          .jx-header-p { font-size: 1.18rem; max-width: 44ch; }

          .jx-step { grid-template-columns: 320px 1fr; gap: 96px; padding: 96px 96px; }
          .jx-num { font-size: 13rem; }
          .jx-eyebrow { font-size: 1.3rem; font-weight: 600; }
          .jx-title { font-size: 2.4rem; }
          .jx-desc { font-size: 1.12rem; max-width: 54ch; }
          .jx-accent { font-size: 1.45rem; }
          .jx-feat-item { font-size: 0.95rem; }

          .jx-close-inner { padding: 144px 96px; gap: 96px; }
          .jx-close-h2 { font-size: 5.8rem; }
          .jx-close-p { font-size: 1.18rem; }
        }
      `}</style>

      <div className="jx-wrap">

        {/* HEADER */}
        <div className="jx-header">
          {/* Headline — full width */}
          <div ref={fH.ref} style={fH.style} className="jx-header-top">
            <span className="jx-eyebrow" style={{ marginBottom: '20px' }}>Building Your Library</span>
            <h2 className="jx-header-h2">
              Your family's story,
              <br />
              <em style={{ fontStyle: 'italic', color: '#b8924a' }}>finally together.</em>
            </h2>
          </div>

          {/* Sub-copy + CTA — sits in right half on desktop */}
          <div className="jx-header-bottom">
            <div /> {/* spacer — left col empty */}
            <div ref={fS.ref} style={fS.style}>
              <p className="jx-header-p">
                Most apps store photos. Ancestorii keeps the people, voices, and messages that belong beside them.
              </p>
              <a href="/signup" className="jx-btn-dark">
                Begin your library <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* STEPS */}
        {steps.map((step, i) => {
          const f = useFade(50 * i);
          const { Icon } = step;
          return (
            <div key={step.id} ref={f.ref} style={f.style} className="jx-step">
              {/* LEFT */}
              <div>
                <div className="jx-num">{step.id}</div>
                <span className="jx-eyebrow">{step.eyebrow}</span>
                <h3 className="jx-title">{step.title}</h3>
              </div>
              {/* RIGHT */}
              <div>
                <Icon strokeWidth={1.1} style={{ color: '#b8924a', marginBottom: '22px', display: 'block', width: '2em', height: '2em' }} />
                <p className="jx-desc">{step.description}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                  {step.features.map(feat => (
                    <li key={feat} className="jx-feat-item">
                      <span className="jx-dot" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <p className="jx-accent">{step.accent}</p>
              </div>
            </div>
          );
        })}

      </div>

      {/* CLOSING PANEL */}
      <div className="jx-close">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(184,146,74,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent, rgba(184,146,74,0.7) 20%, rgba(184,146,74,0.7) 80%, transparent)' }} />

        <div className="jx-close-inner">
          <h2 className="jx-close-h2">
            One day,<br />
            a photo alone<br />
            <em style={{ fontStyle: 'italic', color: '#d4aa6a' }}>won't be enough.</em>
          </h2>
          <div>
            <p className="jx-close-p">
              People will want the voice behind the image. The meaning. The feeling that used to live in the room. This is where those things stay.
            </p>
            <a href="/signup" className="jx-btn-gold">
              Start your family library <ArrowRight size={14} />
            </a>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, rgba(227,179,65,0.9), rgba(227,179,65,0.4))' }} />
      </div>
    </section>
  );
}