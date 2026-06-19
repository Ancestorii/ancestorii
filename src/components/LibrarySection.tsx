'use client';

import React, { useEffect, useRef } from 'react';
import { Users, Clock, Lock, BookOpen, ArrowRight } from 'lucide-react';

const G = ({ children }: { children: React.ReactNode }) => (
  <strong style={{ color: '#b8924a', fontWeight: 500 }}>{children}</strong>
);

const steps = [
  {
    id: '01',
    eyebrow: 'Bring your family together',
    title: 'One library. Every story.',
    description: (
      <>
        Give each person their own space. Then <G>invite your family to
        contribute</G> — so the library belongs to everyone, not just you.
      </>
    ),
    accent: "\"Every generation adds to the same shelf.\"",
    Icon: Users,
    features: ['Profiles for each loved one', 'Invite family to contribute'],
  },
  {
    id: '02',
    eyebrow: 'Build the full picture',
    title: 'Timelines, albums, and voices.',
    description: (
      <>
        Lay out a life in order. Group photos into albums that carry
        <G> written messages and voice recordings</G> — so the feeling
        behind every photo stays.
      </>
    ),
    accent: "\"The photo shows what happened. The voice tells you how it felt.\"",
    Icon: Clock,
    features: ['Timelines per person', 'Albums with captions and voice notes'],
  },
  {
    id: '03',
    eyebrow: 'Preserve for the future',
    title: 'Seal a capsule for the right moment.',
    description: (
      <>
        Write something. Record a message. Then <G>set the exact date
        it opens</G> — a birthday, a wedding, a day not yet here.
      </>
    ),
    accent: "\"A message from today, delivered to the future.\"",
    Icon: Lock,
    features: ['Video, audio, or written messages', 'Unlocks on a date you choose'],
  },
  {
    id: '04',
    eyebrow: 'From screen to shelf',
    title: 'Hold your memories in your hands.',
    description: (
      <>
        Turn your library into <G>hardcover books, canvas prints,
        and framed photos</G> — built inside the app and delivered
        to your door.
      </>
    ),
    accent: "\"The photos were on my phone for years. Now they're on my shelf.\"",
    Icon: BookOpen,
    features: ['Memory Books, canvas, and framed prints', 'Printed and delivered worldwide'],
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

export default function LibrarySection() {
  const fH = useFade(0);
  const fS = useFade(100);

  return (
    <section className="lib-section">
      <style>{`
        .lib-section {
          background: #FFFFFF;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
        }
        .lib-wrap {
          max-width: 1280px;
          margin: 0 auto;
        }

        .lib-header {
          padding: 64px 24px 0;
          margin-bottom: 48px;
        }
        .lib-header-top { margin-bottom: 24px; }
        .lib-header-bottom {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        .lib-header-h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 600;
          line-height: 0.97;
          letter-spacing: -0.02em;
          color: #1a1410;
          margin: 0 0 24px;
          font-size: 2.6rem;
        }
        .lib-header-p {
          font-size: 1rem;
          line-height: 1.78;
          color: #3d3428;
          margin: 0 0 28px;
          max-width: 100%;
        }
        .lib-eyebrow {
          font-size: 1rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #b8924a;
          margin: 0 0 8px;
          font-weight: 600;
          display: block;
        }

        .lib-step {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          padding: 44px 24px;
          border-top: 2px solid rgba(26,20,16,0.2);
        }
        .lib-step:last-of-type {
          border-bottom: 2px solid rgba(26,20,16,0.2);
        }
        .lib-num {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 300;
          line-height: 0.85;
          color: #b8924a;
          letter-spacing: -0.05em;
          user-select: none;
          font-size: 7rem;
          margin-bottom: 14px;
        }
        .lib-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: #1a1410;
          margin: 0;
          font-size: 1.6rem;
        }
        .lib-desc {
          line-height: 1.82;
          color: #2e2820;
          margin: 0 0 18px;
          font-size: 0.98rem;
        }
        .lib-accent {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-weight: 800;
  color: #8a6b25;
  line-height: 1.65;
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: 0.01em;
}
        .lib-feat-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.84rem;
          color: #1a1410;
          padding: 6px 0;
          border-bottom: 1px solid rgba(26,20,16,0.15);
        }
        .lib-dot {
          display: block;
          width: 5px;
          height: 5px;
          background: #b8924a;
          flex-shrink: 0;
        }

        .lib-close {
          background: #1a1410;
          position: relative;
          overflow: hidden;
        }
        .lib-close-inner {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          padding: 72px 24px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .lib-close-h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 300;
          line-height: 0.97;
          letter-spacing: -0.02em;
          color: #f7f2ea;
          margin: 0;
          font-size: 2.6rem;
        }
        .lib-close-p {
          font-size: 1rem;
          line-height: 1.8;
          color: rgba(247,242,234,0.88);
          margin: 0 0 32px;
        }

        .lib-btn-dark {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 500;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: #faf8f4; background: #1a1410;
          padding: 14px 30px; text-decoration: none;
          transition: background 0.22s; border: none; cursor: pointer;
        }
        .lib-btn-dark:hover { background: #b8924a; }
        .lib-btn-gold {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 500;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: #1a1410; background: #b8924a;
          padding: 14px 32px; text-decoration: none;
          transition: background 0.22s; border: none; cursor: pointer;
        }
        .lib-btn-gold:hover { background: #cfa85e; }

        @media (min-width: 640px) {
          .lib-header { padding: 80px 40px 0; margin-bottom: 56px; }
          .lib-header-h2 { font-size: 3.4rem; }
          .lib-header-p { font-size: 1.05rem; }
          .lib-step { padding: 52px 40px; gap: 24px; }
          .lib-num { font-size: 8rem; }
          .lib-title { font-size: 1.9rem; }
          .lib-desc { font-size: 1rem; }
          .lib-accent { font-size: 1.28rem; }
          .lib-close-inner { padding: 88px 40px; }
          .lib-close-h2 { font-size: 3.2rem; }
          .lib-close-p { font-size: 1.05rem; }
          .lib-btn-dark, .lib-btn-gold { font-size: 0.82rem; padding: 15px 34px; }
        }

        @media (min-width: 900px) {
          .lib-header { padding: 100px 56px 0; margin-bottom: 64px; }
          .lib-header-bottom {
            grid-template-columns: 1fr 1fr;
            align-items: end;
            gap: 56px;
          }
          .lib-header-h2 { font-size: 4.2rem; margin-bottom: 32px; }
          .lib-header-p { font-size: 1.08rem; max-width: 40ch; }
          .lib-step {
            grid-template-columns: 240px 1fr;
            align-items: start;
            gap: 52px;
            padding: 60px 56px;
          }
          .lib-num { font-size: 9rem; margin-bottom: 16px; }
          .lib-eyebrow { font-size: 1.15rem; }
          .lib-title { font-size: 1.75rem; }
          .lib-desc { font-size: 1.02rem; max-width: 50ch; }
          .lib-accent { font-size: 1.2rem; }
          .lib-feat-item { font-size: 0.88rem; }
          .lib-close-inner {
            grid-template-columns: 1fr 1fr;
            align-items: end;
            padding: 104px 56px;
            gap: 56px;
          }
          .lib-close-h2 { font-size: 3.8rem; }
          .lib-close-p { font-size: 1.08rem; max-width: 40ch; }
        }

        @media (min-width: 1200px) {
          .lib-header { padding: 128px 72px 0; margin-bottom: 80px; }
          .lib-header-bottom { gap: 80px; }
          .lib-header-h2 { font-size: 5.4rem; margin-bottom: 40px; }
          .lib-header-p { font-size: 1.12rem; max-width: 42ch; margin-bottom: 40px; }
          .lib-step {
            grid-template-columns: 300px 1fr;
            gap: 80px;
            padding: 80px 72px;
          }
          .lib-num { font-size: 11rem; margin-bottom: 20px; }
          .lib-eyebrow { font-size: 1.2rem; margin-bottom: 12px; }
          .lib-title { font-size: 2.1rem; }
          .lib-desc { font-size: 1.06rem; line-height: 1.88; max-width: 52ch; margin-bottom: 24px; }
          .lib-accent { font-size: 1.4rem; }
          .lib-feat-item { font-size: 0.9rem; padding: 7px 0; }
          .lib-close-inner { padding: 128px 72px; gap: 80px; }
          .lib-close-h2 { font-size: 5rem; }
          .lib-close-p { font-size: 1.12rem; max-width: 42ch; margin-bottom: 40px; }
          .lib-btn-dark, .lib-btn-gold { font-size: 0.85rem; padding: 16px 40px; }
        }

        @media (min-width: 1536px) {
          .lib-header { padding: 144px 96px 0; margin-bottom: 96px; }
          .lib-header-bottom { gap: 96px; }
          .lib-header-h2 { font-size: 6.2rem; margin-bottom: 48px; }
          .lib-header-p { font-size: 1.18rem; max-width: 44ch; }
          .lib-step { grid-template-columns: 340px 1fr; gap: 96px; padding: 96px 96px; }
          .lib-num { font-size: 13rem; }
          .lib-eyebrow { font-size: 1.3rem; }
          .lib-title { font-size: 2.4rem; }
          .lib-desc { font-size: 1.12rem; max-width: 54ch; }
          .lib-accent { font-size: 1.55rem; }
          .lib-feat-item { font-size: 0.95rem; }
          .lib-close-inner { padding: 144px 96px; gap: 96px; }
          .lib-close-h2 { font-size: 5.8rem; }
          .lib-close-p { font-size: 1.18rem; }
        }
      `}</style>

      <div className="lib-wrap">
        <div className="lib-header">
          <div ref={fH.ref} style={fH.style} className="lib-header-top">
            <span className="lib-eyebrow" style={{ marginBottom: '20px' }}>Your Family Library</span>
            <h2 className="lib-header-h2">
              Every story. Every voice.
              <br />
              <em style={{ fontStyle: 'italic', color: '#b8924a' }}>One place.</em>
            </h2>
          </div>

          <div className="lib-header-bottom">
            <div />
            <div ref={fS.ref} style={fS.style}>
              <p className="lib-header-p">
                Invite your family. Let everyone add their photos, their
                voice, their side of the story. Then turn the best moments
                into something you can hold.
              </p>
              <a href="/signup" className="lib-btn-dark">
                Start your library — free <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>

        {steps.map((step, i) => {
          const f = useFade(50 * i);
          const { Icon } = step;
          return (
            <div key={step.id} ref={f.ref} style={f.style} className="lib-step">
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
  <div className="lib-num">{step.id}</div>
  <span className="lib-eyebrow">{step.eyebrow}</span>
  <h3 className="lib-title">{step.title}</h3>
</div>
              <div>
                <Icon strokeWidth={1.1} style={{ color: '#b8924a', marginBottom: '22px', display: 'block', width: '2em', height: '2em' }} />
                <p className="lib-desc">{step.description}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                  {step.features.map(feat => (
                    <li key={feat} className="lib-feat-item">
                      <span className="lib-dot" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <p className="lib-accent">{step.accent}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="lib-close">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(184,146,74,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent, rgba(184,146,74,0.7) 20%, rgba(184,146,74,0.7) 80%, transparent)' }} />

        <div className="lib-close-inner">
          <h2 className="lib-close-h2">
            Your family deserves<br />
            more than<br />
            <em style={{ fontStyle: 'italic', color: '#d4aa6a' }}>a camera roll.</em>
          </h2>
          <div>
            <p className="lib-close-p">
              Everyone contributes. Every story has a place. And when
              the time is right, your best moments become a book on
              your shelf, a canvas on your wall, or a photo in a frame.
            </p>
            <a href="/signup" className="lib-btn-gold">
              Start for free <ArrowRight size={14} />
            </a>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, rgba(227,179,65,0.9), rgba(227,179,65,0.4))' }} />
      </div>
    </section>
  );
}