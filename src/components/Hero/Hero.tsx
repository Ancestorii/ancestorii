'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

const bulletItems = [
  'Write the story behind every photo',
  'Add voices, videos, and things only you remember',
  'Private, ad-free, and yours forever',
];

/* ─── VISUAL PANE ──────────────────────────────────── */
function HeroVisual() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <Image
        src="/hero.jpg"
        alt="Family memory"
        fill
        priority
        sizes="50vw"
        className="object-cover scale-[1.02]"
        style={{ objectPosition: '60% 20%' }}
      />

      {/* Feather into content pane */}
      <div
        className="absolute inset-y-0 left-0 w-40 pointer-events-none hidden lg:block"
        style={{
          background:
            'linear-gradient(to right, rgba(247,242,233,0.96) 0%, rgba(247,242,233,0.72) 45%, transparent 100%)',
        }}
      />

      {/* Bottom fade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 70%, rgba(240,234,220,0.2) 100%)',
        }}
      />

      {/* Floating card — top right */}
      <div className="absolute right-[7%] top-[10%] hidden xl:block w-[210px] rotate-[4deg] pointer-events-none">
        <div
          className="border border-[rgba(95,78,43,0.12)] bg-[rgba(255,251,244,0.80)] backdrop-blur-[8px] px-5 py-4 shadow-[0_20px_50px_rgba(62,43,18,0.10)]"
        >
          <p className="font-serif text-[0.9rem] leading-relaxed text-[#3C3326]">
            Keep the meaning beside the memory.
          </p>
        </div>
      </div>

      {/* Floating quote — bottom left */}
      <div className="absolute left-[7%] bottom-[9%] hidden 2xl:block w-[230px] -rotate-[3deg] pointer-events-none">
        <div
          className="border border-[rgba(95,78,43,0.11)] bg-[rgba(255,255,255,0.72)] backdrop-blur-[8px] px-5 py-4 shadow-[0_20px_50px_rgba(62,43,18,0.09)]"
        >
          <p className="font-serif italic text-[0.95rem] leading-relaxed text-[#403629]">
            "This was never just about storage."
          </p>
           <div className="absolute bottom-0 left-0 w-full h-[4px]" />
        </div>
      </div>
    </div>
  );
}

/* ─── CONTENT PANE ─────────────────────────────────── */
function HeroContent() {
  return (
    <div
      className="relative flex flex-col justify-center h-full w-full overflow-hidden bg-[rgb(250,245,235)]"
      style={{ padding: 'clamp(2.5rem, 5.5vw, 6.5rem)' }}
    >
      {/* Parchment texture */}
      <div className="absolute inset-0 bg-[url('/parchment.png')] bg-cover bg-center opacity-25 pointer-events-none" />

<div
  className="absolute inset-0 pointer-events-none"
  style={{
    background: 'rgba(255,255,255,0.25)',
  }}
/>

      {/* Warm radial + directional washes */}
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

      <div className="relative z-10 w-full max-w-[600px] xl:max-w-[820px] 2xl:max-w-[900px]">

        {/* OVERLINE */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-5 flex-shrink-0 bg-[#B8932A]" />
          <p
  className="font-serif uppercase text-[#B8932A]"
  style={{
    fontSize: 'clamp(0.65rem, 0.8vw, 0.78rem)',
    letterSpacing: '0.26em',
    fontWeight: 700,
  }}
>
  Your Family Library
</p>
        </div>

        {/* HEADLINE */}
        <h1
          className="font-serif font-bold text-[#1A1612]"
          style={{
            fontSize: 'clamp(2.8rem, 4.6vw, 4.8rem)',
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
          }}
        >
          Some things
<br />
<em style={{ color: '#B8932A', fontStyle: 'italic' }}>
  a photo can’t hold.
</em>
        </h1>

        {/* RULE */}
        <div
  className="mt-8 mb-7"
  style={{
    height: '1px',
    width: '15rem',
    background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)',
  }}
/>

        {/* SUB-COPY */}
       <p
  className="font-serif text-[#3D3526] text-[0.95rem] sm:text-[1.1rem] lg:text-[1.4rem] xl:text-[1.5rem]"
  style={{ lineHeight: 1.7, maxWidth: '46ch' }}
>
  The place where your family keeps the stories, voices, and memories that matter.{' '}
  <span style={{ color: '#B8932A' }}>Not everything belongs in a camera roll.</span>
</p>

        {/* NUMBERED BULLETS */}
        <ul className="mt-7 space-y-0">
  {bulletItems.map((item, index) => (
    <li
      key={item}
      className="
        flex items-start gap-4
        border-b border-[rgba(95,78,43,0.08)]
        py-4
        font-serif text-[#4A4030]
        text-[0.95rem] sm:text-[1.05rem] lg:text-[1.25rem] xl:text-[1.35rem]
      "
    >
      <span
        className="
          flex-shrink-0 text-[#B8932A] mt-[0.15em]
          text-[0.8rem] sm:text-[0.9rem] lg:text-[1.05rem]
        "
        style={{ letterSpacing: '0.08em', minWidth: '1.6rem' }}
      >
        0{index + 1}
      </span>

      <span className="leading-relaxed">
        {item}
      </span>
    </li>
  ))}
</ul>

        {/* BUTTONS */}
        <div className="mt-10 flex flex-col sm:flex-row items-start gap-3">
          <Button
            onClick={() => (window.location.href = '/signup')}
            className="rounded-none border-none shadow-none font-serif font-semibold text-[#FAF5EB] hover:opacity-90 active:scale-[0.98] transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #1A1612 0%, #2E2820 100%)',
              fontSize: 'clamp(0.72rem, 0.88vw, 0.82rem)',
              letterSpacing: '0.1em',
              padding: 'clamp(0.68rem, 1vw, 0.85rem) clamp(1.6rem, 2.5vw, 2.5rem)',
            }}
          >
            START FOR FREE →
          </Button>
          <Button
            onClick={() => (window.location.href = '/pricing')}
            className="rounded-none bg-transparent shadow-none font-serif font-normal hover:bg-[#1A1612]/5 transition-all duration-200"
            style={{
              color: '#4A4030',
              border: '1px solid rgba(74,64,48,0.32)',
              fontSize: 'clamp(0.72rem, 0.88vw, 0.82rem)',
              letterSpacing: '0.08em',
              padding: 'clamp(0.68rem, 1vw, 0.85rem) clamp(1.6rem, 2.5vw, 2.5rem)',
            }}
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

      {/* Photo with overlay card */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: '56vw', minHeight: '240px', maxHeight: '340px' }}
      >
        <Image
          src="/hero.jpg"
          alt="Family memory"
          fill
          priority
          sizes="100vw"
          className="object-cover scale-[1.02]"
          style={{ objectPosition: '50% 14%' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 52%, rgba(250,245,235,0.94) 100%)' }}
        />
        {/* Small card bottom-left */}
        <div className="absolute right-4 top-4 max-w-[220px]">
          <div className="border border-[rgba(95,78,43,0.10)] bg-[rgba(255,251,244,0.76)] backdrop-blur-[8px] px-4 py-3 shadow-[0_14px_36px_rgba(62,43,18,0.08)]">
            <p className="font-serif text-[0.86rem] leading-relaxed text-[#3E3427]">
              This still matters.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative overflow-hidden bg-[rgb(250,245,235)]">
        <div className="absolute inset-0 bg-[url('/parchment.png')] bg-cover bg-center opacity-28 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 12% 10%, rgba(243,217,155,0.22), transparent 26%)' }}
        />

        <div className="relative z-10 px-6 pt-7 pb-10">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-px w-4 bg-[#B8932A]" />
            <p
  className="font-serif uppercase text-[#B8932A]"
  style={{
    fontSize: 'clamp(0.65rem, 0.8vw, 0.78rem)',
    letterSpacing: '0.26em',
    fontWeight: 700,
  }}
>
  Your Family Library
</p>
          </div>

          <h1
            className="font-serif font-bold text-[#1A1612]"
            style={{ fontSize: 'clamp(2.8rem, 10vw, 3.8rem)', lineHeight: 0.9, letterSpacing: '-0.03em' }}
          >
            Some things
<br />
<em style={{ color: '#B8932A', fontStyle: 'italic' }}>
  a photo can’t hold.
</em>
          </h1>

         <div
  className="mt-6 mb-6"
  style={{
    height: '1px',
    width: '15rem',
    background: 'linear-gradient(to right, rgba(184,147,42,0.85), transparent)',
  }}
/>

          <p className="font-serif text-[#3D3526] mb-6 text-[1.05rem] sm:text-[1.1rem]" style={{ lineHeight: 1.7 }}>
            The place where your family keeps the stories, voices, and memories that matter.
          </p>

          <ul className="space-y-0 mb-8">
            {bulletItems.map((item, index) => (
              <li
                key={item}
                className="flex items-start gap-3.5 py-3 border-b border-[rgba(95,78,43,0.08)] font-serif text-[#4A4030]"
                style={{ fontSize: '0.95rem' }}
              >
                <span className="flex-shrink-0 text-[#B8932A]" style={{ fontSize: '0.85rem', letterSpacing: '0.1em', fontWeight: 600 }}>
                  0{index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2.5">
            <Button
              onClick={() => (window.location.href = '/signup')}
              className="w-full rounded-none border-none shadow-none font-serif font-semibold text-[#FAF5EB] py-3.5"
              style={{ background: 'linear-gradient(135deg, #1A1612 0%, #2E2820 100%)', fontSize: '0.74rem', letterSpacing: '0.1em' }}
            >
              START FOR FREE →
            </Button>
            <Button
              onClick={() => (window.location.href = '/pricing')}
              className="w-full rounded-none bg-transparent shadow-none font-serif font-normal py-3.5"
              style={{ color: '#4A4030', border: '1px solid rgba(74,64,48,0.32)', fontSize: '0.74rem', letterSpacing: '0.08em' }}
            >
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
          <span
  className="font-serif uppercase"
  style={{
    fontSize: '0.7rem',
    letterSpacing: '0.26em',
    color: 'rgba(26, 22, 18, 0.9)',
    fontWeight: 600,
    background: 'rgba(255,255,255,0.75)',
    padding: '0.25rem 0.6rem',
    backdropFilter: 'blur(4px)',
  }}
>
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
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-[rgb(247,242,233)]"
      style={{ minHeight: '560px' }}
    >
      <MobileHero />

      <div
        className="hidden lg:grid"
        style={{
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          height: 'min(90vh, 860px)',
          minHeight: '580px',
        }}
      >
        <HeroContent />
        <HeroVisual />
      </div>

      <DesktopFootnote />

{/* GOLD LINE ACROSS FULL HERO */}
<div
  className="absolute bottom-0 left-0 w-full h-[5px] z-20"
  style={{
    background: 'linear-gradient(to right, rgba(227,179,65,1), rgba(227,179,65,0.7))',
  }}
/>

</section>
  );
}