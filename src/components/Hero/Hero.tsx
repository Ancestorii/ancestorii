'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

const bulletItems = [
  'Write the story that the photo cannot show',
  'Keep voices, moments, and things only you remember',
  'Private, personal, and yours forever',
];
/* ─── VISUAL PANE ──────────────────────────────────── */
function HeroVisual() {
  return (
    <div className="relative w-full h-full overflow-hidden">

      <Image
        src="/hero.png" // 🔥 use AVIF or WebP (NOT jpg)
        alt="Family memory"
        fill
        priority
        quality={60}
        sizes="(max-width: 1024px) 100vw, 50vw"
        placeholder="blur"
        blurDataURL="/hero-blur.jpg"
        className="object-cover"
        style={{ objectPosition: '60% 20%' }}
      />

      {/* LIGHT overlay only (cheap to render) */}
      <div className="absolute inset-y-0 left-0 w-32 hidden lg:block pointer-events-none bg-gradient-to-r from-[#f7f2e9]/95 to-transparent" />

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-[#f0eadc]/20" />

      {/* REMOVE heavy blur + shadow = faster */}
      <div className="absolute right-[7%] top-[10%] hidden xl:block w-[200px] rotate-[4deg] pointer-events-none">
        <div className="border border-black/10 bg-white/90 px-4 py-3">
          <p className="font-serif text-[0.85rem] text-[#3C3326]">
            Before it’s forgotten.
          </p>
        </div>
      </div>

      <div className="absolute left-[7%] bottom-[9%] hidden 2xl:block w-[210px] -rotate-[3deg] pointer-events-none">
        <div className="border border-black/10 bg-white/70 px-4 py-3">
          <p className="font-serif italic text-[0.9rem] text-[#403629]">
            "This was never just about storage."
          </p>
        </div>
      </div>

    </div>
  );
}

/* ─── CONTENT PANE ─────────────────────────────────── */
function HeroContentDesktop() {
  return (
    <div className="hc-pane relative flex flex-col justify-center h-full w-full overflow-hidden bg-[rgb(250,245,235)]">
     <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(243,217,155,0.15),transparent_40%)]" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(255,255,255,0.25)' }} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 10% 14%, rgba(243,217,155,0.30), transparent 26%),
            linear-gradient(to right, rgba(250,245,235,0.98) 0%, rgba(250,245,235,0.94) 58%, rgba(250,245,235,0.62) 84%, transparent 100%),
            linear-gradient(to bottom, transparent 72%, rgba(240,234,220,0.32) 100%)
          `,
        }}
      />

      <div className="hc-inner relative z-10 w-full">
        <div className="hc-overline flex items-center gap-3 mb-6">
          
          <div className="h-px w-5 flex-shrink-0 bg-[#B8932A]" />
          <p className="hc-overline-text font-serif uppercase text-[#B8932A]" style={{ letterSpacing: '0.26em', fontWeight: 700 }}>
            Your Family Library
          </p>
        </div>

        <h1 className="hc-h1 font-serif font-bold text-[#1A1612]" style={{ lineHeight: 0.92, letterSpacing: '-0.03em' }}>
          Some things
          <br />
          <em style={{ color: '#B8932A', fontStyle: 'italic' }}>a photo can't hold.</em>
        </h1>

        <div className="hc-rule" style={{ height: '1px', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

        
        <p className="hc-sub font-serif text-[#3D3526]" style={{ lineHeight: 1.7 }}>
  Because one day, you won’t be able to ask again.{' '}
  <span style={{ color: '#B8932A' }}>Not everything belongs in a camera roll.</span>
</p>

        <ul className="mt-7 space-y-0">
          {bulletItems.map((item, index) => (
            <li key={item} className="hc-li flex items-start gap-4 border-b border-[rgba(95,78,43,0.08)] font-serif text-[#4A4030]">
              <span className="hc-num flex-shrink-0 text-[#B8932A] mt-[0.15em]" style={{ letterSpacing: '0.08em', minWidth: '1.6rem' }}>
                0{index + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>

        <div className="hc-btns mt-10 flex flex-col sm:flex-row items-start gap-3">
          <Button
            onClick={() => (window.location.href = '/signup')}
            className="rounded-none border-none shadow-none font-serif font-semibold text-[#FAF5EB] hover:opacity-90 active:scale-[0.98] transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #1A1612 0%, #2E2820 100%)', letterSpacing: '0.1em' }}
          >
            START FOR FREE →
          </Button>
          <Button
            onClick={() => (window.location.href = '/pricing')}
            className="rounded-none bg-transparent shadow-none font-serif font-normal hover:bg-[#1A1612]/5 transition-all duration-200"
            style={{ color: '#4A4030', border: '1px solid rgba(74,64,48,0.32)', letterSpacing: '0.08em' }}
          >
            SEE PRICING
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── MOBILE ────────────────────────────────────────── */
function MobileHero() {
  return (
    <div className="lg:hidden flex flex-col">
      <div className="relative w-full overflow-hidden" style={{ height: '56vw', minHeight: '240px', maxHeight: '340px' }}>
        <Image
          src="/hero.png"
          alt="Family memory"
          fill
          priority
          sizes="100vw"
          className="object-cover scale-[1.02]"
          style={{ objectPosition: '50% 14%' }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent 52%, rgba(250,245,235,0.94) 100%)' }} />
        <div className="absolute right-4 top-4 max-w-[220px]">
          <div className="border border-[rgba(95,78,43,0.10)] bg-[rgba(255,251,244,0.76)] backdrop-blur-[8px] px-4 py-3 shadow-[0_14px_36px_rgba(62,43,18,0.08)]">
            <p className="font-serif text-[0.86rem] leading-relaxed text-[#3E3427]">Before it’s forgotten.</p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-[rgb(250,245,235)]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(243,217,155,0.15),transparent_40%)]" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(255,255,255,0.25)' }} />

        <div className="relative z-10 px-6 pt-7 pb-10">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-px w-4 bg-[#B8932A]" />
            <p className="font-serif uppercase text-[#B8932A]" style={{ fontSize: '0.62rem', letterSpacing: '0.26em', fontWeight: 700 }}>
              Your Family Library
            </p>
          </div>

          <h1 className="font-serif font-bold text-[#1A1612]" style={{ fontSize: 'clamp(2.6rem, 9vw, 3.4rem)', lineHeight: 0.9, letterSpacing: '-0.03em' }}>
            Some things<br />
            <em style={{ color: '#B8932A', fontStyle: 'italic' }}>a photo can't hold.</em>
          </h1>

          <div className="mt-6 mb-6" style={{ height: '1px', width: '12rem', background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)' }} />

          <p className="font-serif text-[#3D3526] mb-6" style={{ fontSize: '1rem', lineHeight: 1.7 }}>
  Because one day, you won’t be able to ask again.{' '}
  <span style={{ color: '#B8932A' }}>Not everything belongs in a camera roll.</span>
</p>

          <ul className="space-y-0 mb-8">
            {bulletItems.map((item, index) => (
              <li key={item} className="flex items-start gap-3.5 py-3 border-b border-[rgba(95,78,43,0.08)] font-serif text-[#4A4030]" style={{ fontSize: '0.95rem' }}>
                <span className="flex-shrink-0 text-[#B8932A]" style={{ fontSize: '0.82rem', letterSpacing: '0.1em', fontWeight: 600 }}>
                  0{index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2.5">
            <Button onClick={() => (window.location.href = '/signup')} className="w-full rounded-none border-none shadow-none font-serif font-semibold text-[#FAF5EB] py-3.5" style={{ background: 'linear-gradient(135deg, #1A1612 0%, #2E2820 100%)', fontSize: '0.74rem', letterSpacing: '0.1em' }}>
              START FOR FREE →
            </Button>
            <Button onClick={() => (window.location.href = '/pricing')} className="w-full rounded-none bg-transparent shadow-none font-serif font-normal py-3.5" style={{ color: '#4A4030', border: '1px solid rgba(74,64,48,0.32)', fontSize: '0.74rem', letterSpacing: '0.08em' }}>
              SEE PRICING
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── DESKTOP FOOTNOTE ──────────────────────────────── */
function DesktopFootnote() {
  return (
    <div className="absolute bottom-5 right-14 hidden lg:flex items-center gap-4 pointer-events-none select-none">
      {['Private', 'Personal', 'Preserved'].map((word, i) => (
        <span key={word} className="flex items-center gap-4">
          {i > 0 && <span style={{ color: 'rgba(74,64,48,0.22)', fontSize: '0.4rem' }}>●</span>}
          <span className="font-serif uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.26em', color: 'rgba(26,22,18,0.9)', fontWeight: 600, background: 'rgba(255,255,255,0.75)', padding: '0.25rem 0.6rem', backdropFilter: 'blur(4px)' }}>
            {word}
          </span>
        </span>
      ))}
    </div>
  );
}

/* ─── HERO SHELL ────────────────────────────────────── */
export default function Hero() {
  return (
    <section id="hero" className="relative w-full overflow-hidden bg-[rgb(247,242,233)]" style={{ minHeight: '560px' }}>

      <style>{`
        /* ── LAPTOP  lg: 1024px ── */
        .hc-pane        { padding: 48px 40px; }
        .hc-inner       { max-width: 520px; }
        .hc-overline-text { font-size: 0.62rem; }
        .hc-h1          { font-size: 2.8rem; }
        .hc-rule        { width: 10rem; margin: 20px 0; }
        .hc-sub         { font-size: 0.98rem; max-width: 38ch; }
        .hc-li          { font-size: 0.95rem; padding: 12px 0; }
        .hc-num         { font-size: 0.78rem; }
        .hc-btns button { font-size: 0.7rem; padding: 0.7rem 1.5rem; }

        /* ── LARGE LAPTOP  xl: 1280px ── */
        @media (min-width: 1280px) {
          .hc-pane        { padding: 56px 52px; }
          .hc-inner       { max-width: 580px; }
          .hc-overline-text { font-size: 0.68rem; }
          .hc-h1          { font-size: 3.6rem; }
          .hc-rule        { width: 13rem; margin: 26px 0; }
          .hc-sub         { font-size: 1.1rem; max-width: 42ch; }
          .hc-li          { font-size: 1.08rem; padding: 14px 0; }
          .hc-num         { font-size: 0.88rem; }
          .hc-btns button { font-size: 0.76rem; padding: 0.78rem 1.9rem; }
        }

        /* ── DESKTOP  1.5xl: 1440px ── */
        @media (min-width: 1440px) {
          .hc-pane        { padding: 64px 64px; }
          .hc-inner       { max-width: 680px; }
          .hc-overline-text { font-size: 0.72rem; }
          .hc-h1          { font-size: 4.2rem; }
          .hc-rule        { width: 15rem; margin: 28px 0; }
          .hc-sub         { font-size: 1.25rem; max-width: 44ch; }
          .hc-li          { font-size: 1.18rem; padding: 15px 0; }
          .hc-num         { font-size: 0.95rem; }
          .hc-btns button { font-size: 0.8rem; padding: 0.82rem 2.1rem; }
        }

        /* ── XL  2xl: 1536px ── */
        @media (min-width: 1536px) {
          .hc-pane        { padding: 72px 80px; }
          .hc-inner       { max-width: 780px; }
          .hc-overline-text { font-size: 0.78rem; }
          .hc-h1          { font-size: 4.8rem; }
          .hc-rule        { width: 17rem; margin: 32px 0; }
          .hc-sub         { font-size: 1.4rem; max-width: 46ch; }
          .hc-li          { font-size: 1.3rem; padding: 16px 0; }
          .hc-num         { font-size: 1.05rem; }
          .hc-btns button { font-size: 0.82rem; padding: 0.85rem 2.5rem; }
        }

        /* ── GRID HEIGHTS ── */
        .hero-grid-lg  { height: min(88vh, 720px);  min-height: 560px; }
        .hero-grid-xl  { height: min(90vh, 800px);  min-height: 580px; }
        .hero-grid-2xl { height: min(90vh, 880px);  min-height: 620px; }

        @media (min-width: 1440px) { .hero-grid-xl { height: min(90vh, 860px); } }
        @media (min-width: 1536px) { .hero-grid-xl { height: min(90vh, 920px); } }
      `}</style>

      <MobileHero />

      {/* LAPTOP lg → just below xl */}
      <div
        className="hidden lg:grid xl:hidden hero-grid-lg"
        style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}
      >
        <HeroContentDesktop />
        <HeroVisual />
      </div>

      {/* XL + */}
      <div
        className="hidden xl:grid hero-grid-xl"
        style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}
      >
        <HeroContentDesktop />
        <HeroVisual />
      </div>

      <DesktopFootnote />

      <div
        className="absolute bottom-0 left-0 w-full h-[5px] z-20"
        style={{ background: 'linear-gradient(to right, rgba(227,179,65,1), rgba(227,179,65,0.7))' }}
      />
    </section>
  );
}