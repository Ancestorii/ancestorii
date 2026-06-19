'use client';

import Link from 'next/link';

const px = "px-6 sm:px-8 md:px-[8%] lg:px-[12%] xl:px-[14%] 2xl:px-[16%]";

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8932A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[3px]">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Cross() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C0B9AE" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-[4px]">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <div style={{ background: '#FFFDF8', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ━━━ HERO ━━━ */}
      <div className={`${px} pt-16 sm:pt-20 md:pt-28 lg:pt-36 xl:pt-44 pb-16 md:pb-20 xl:pb-24 text-center`}>
        <div className="flex items-center justify-center gap-2.5 mb-5 md:mb-6">
          <div className="h-px w-5 bg-[#B8932A]" />
          <span className="text-[11px] md:text-[12px] xl:text-[13px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">Pricing</span>
          <div className="h-px w-5 bg-[#B8932A]" />
        </div>

        <h1 className="text-[clamp(36px,7vw,90px)] leading-[0.95] tracking-[-0.03em] text-[#181512]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
          Share for free.<br />
          Build for <span className="italic text-[#A9782F]">£49 a year.</span>
        </h1>

        <p className="mt-6 md:mt-8 text-[15px] md:text-[17px] xl:text-[19px] leading-[1.75] text-[#4A4030] max-w-[48ch] mx-auto">
          Our Stories is free for everyone. My Family starts free and grows with you. No hidden fees. No tricks. No ads.
        </p>
      </div>

      {/* ━━━ TIER CARDS ━━━ */}
      <div className={`${px} pb-16 md:pb-20 xl:pb-24`}>
        <div className="grid lg:grid-cols-3 gap-0">

          {/* ── OUR STORIES ── */}
          <div className="border border-[#ECE5D8] p-7 md:p-9 xl:p-11 flex flex-col">
            <span className="text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">Public</span>
            <h2 className="mt-3 text-[24px] md:text-[28px] xl:text-[32px] tracking-[-0.03em] text-[#181512] leading-[1.05]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              Our Stories
            </h2>
            <div className="mt-4 mb-6">
              <span className="text-[36px] md:text-[42px] xl:text-[48px] tracking-[-0.04em] text-[#B8932A] leading-none" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>Free</span>
              <span className="ml-2 text-[13px] text-[#8A7F72]">forever</span>
            </div>
            <div className="h-px bg-[#ECE5D8] mb-6" />
            <div className="space-y-3.5 flex-1">
              {[
                'Read stories from families everywhere',
                'Like, comment, and share memories',
                'Publish your own stories publicly',
                'No algorithms or follower counts',
              ].map((t, i) => (
                <div key={i} className="flex gap-3 text-[13px] md:text-[14px] xl:text-[15px] text-[#3D3526] leading-[1.6]">
                  <Check />{t}
                </div>
              ))}
            </div>
            <Link href="/signup" className="mt-8 md:mt-10 flex items-center justify-center w-full py-3.5 text-[13px] font-semibold text-[#181512] border border-[#ECE5D8] transition hover:border-[#B8932A] hover:bg-[#FFFBF0] tracking-[0.03em]">
              Get started
            </Link>
          </div>

          {/* ── MY FAMILY FREE ── */}
          <div className="border border-[#ECE5D8] lg:border-l-0 p-7 md:p-9 xl:p-11 flex flex-col border-t-0 lg:border-t">
            <span className="text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">Private — Free</span>
            <h2 className="mt-3 text-[24px] md:text-[28px] xl:text-[32px] tracking-[-0.03em] text-[#181512] leading-[1.05]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              My Family
            </h2>
            <div className="mt-4 mb-6">
              <span className="text-[36px] md:text-[42px] xl:text-[48px] tracking-[-0.04em] text-[#181512] leading-none" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>£0</span>
              <span className="ml-2 text-[13px] text-[#8A7F72]">no card needed</span>
            </div>
            <div className="h-px bg-[#ECE5D8] mb-6" />
            <div className="space-y-3.5 flex-1">
              {[
                { t: '5GB storage', on: true },
                { t: '1 timeline', on: true },
                { t: '1 album', on: true },
                { t: '1 capsule', on: true },
                { t: '20MB max file size', on: true },
                { t: '1 min video length', on: true },
                { t: 'Unlimited family profiles', on: true },
                { t: 'Priority support', on: false },
                { t: 'Early access to features', on: false },
                { t: '10% off heirlooms', on: false },
              ].map((f, i) => (
                <div key={i} className={`flex gap-3 text-[13px] md:text-[14px] xl:text-[15px] leading-[1.6] ${f.on ? 'text-[#3D3526]' : 'text-[#C0B9AE]'}`}>
                  {f.on ? <Check /> : <Cross />}{f.t}
                </div>
              ))}
            </div>
            <Link href="/signup" className="mt-8 md:mt-10 flex items-center justify-center w-full py-3.5 text-[13px] font-semibold text-[#181512] border border-[#ECE5D8] transition hover:border-[#B8932A] hover:bg-[#FFFBF0] tracking-[0.03em]">
              Start for free
            </Link>
          </div>

          {/* ── MY FAMILY PREMIUM ── */}
          <div className="border-2 border-[#181512] bg-[#181512] p-7 md:p-9 xl:p-11 flex flex-col text-[#F5F1E6]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-[#C8A557] font-semibold">Private — Premium</span>
              <span className="text-[10px] tracking-[0.1em] uppercase text-[#181512] bg-[#C8A557] px-2.5 py-1 font-semibold">Recommended</span>
            </div>
            <h2 className="mt-3 text-[24px] md:text-[28px] xl:text-[32px] tracking-[-0.03em] text-[#F5F1E6] leading-[1.05]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
              My Family
            </h2>
            <div className="mt-4">
              <span className="text-[36px] md:text-[42px] xl:text-[48px] tracking-[-0.04em] text-[#F5F1E6] leading-none" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>£49</span>
              <span className="ml-2 text-[13px] text-[#F5F1E6]/35">/ year</span>
            </div>
            <div className="mt-2 mb-6 flex gap-3">
              <span className="text-[12px] text-[#F5F1E6]/25">€59 / year</span>
              <span className="text-[12px] text-[#F5F1E6]/15">·</span>
              <span className="text-[12px] text-[#F5F1E6]/25">$69 / year</span>
            </div>
            <div className="h-px bg-[#F5F1E6]/10 mb-6" />
            <div className="space-y-3.5 flex-1">
              {[
                '50GB storage',
                'Unlimited timelines',
                'Unlimited albums',
                'Unlimited capsules',
                '10GB max file size',
                '30 min video length',
                'Unlimited family profiles',
                'Priority support',
                'Early access to features',
                '10% off all heirlooms',
              ].map((t, i) => (
                <div key={i} className="flex gap-3 text-[13px] md:text-[14px] xl:text-[15px] text-[#F5F1E6]/80 leading-[1.6]">
                  <Check />{t}
                </div>
              ))}
            </div>
            <Link href="/signup" className="mt-8 md:mt-10 flex items-center justify-center w-full py-3.5 text-[13px] font-semibold text-[#181512] transition hover:opacity-90 tracking-[0.03em]" style={{ background: 'linear-gradient(135deg, #C8A557 0%, #D4AF37 100%)' }}>
              Start free, upgrade anytime
            </Link>
          </div>
        </div>
      </div>

      {/* ━━━ HEIRLOOMS ━━━ */}
      <div className={`${px} pb-16 md:pb-20 xl:pb-24`}>
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[11px] md:text-[12px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">Physical Products</span>
          <h2 className="mt-3 text-[clamp(28px,5vw,58px)] tracking-[-0.03em] text-[#181512] leading-[1]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
            My Heirlooms
          </h2>
          <p className="mt-3 text-[14px] md:text-[15px] xl:text-[16px] text-[#4A4030] max-w-[44ch] mx-auto leading-[1.7]">
            Pay per product. No subscription required. Premium members save 10% on every order.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 xl:gap-7">
          {[
            { name: 'Memory Book', price: 'From £44.99', desc: 'A hardcover book you design page by page. Three tiers available. Your stories, your photos, your layout.' },
            { name: 'Canvas Print', price: 'From £29.99', desc: 'Museum grade photo on stretched canvas. The kind of image that belongs on a wall, not buried in a camera roll.' },
            { name: 'Acrylic Print', price: 'From £39.99', desc: 'HD UV print behind polished acrylic glass. Vivid colour, clean edges, permanent weight.' },
          ].map((p) => (
            <div key={p.name} className="p-7 md:p-8 xl:p-10 flex flex-col bg-white border border-[#ECE5D8]">
              <h3 className="text-[20px] md:text-[24px] xl:text-[28px] tracking-[-0.02em] leading-[1.1] text-[#181512]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                {p.name}
              </h3>
              <p className="mt-2 text-[20px] md:text-[24px] xl:text-[28px] tracking-[-0.02em] leading-none text-[#C8A557]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                {p.price}
              </p>
              <p className="mt-4 text-[13px] md:text-[14px] leading-[1.7] flex-1 text-[#181512]">
                {p.desc}
              </p>
              <Link href={p.name === 'Memory Book' ? '/memory-books' : '/signup'} className="mt-6 inline-flex items-center text-[12px] md:text-[13px] font-medium tracking-[0.04em] transition text-[#B8932A] hover:text-[#96751E]">
                Learn more →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━ ALWAYS FREE ━━━ */}
      <div className={`${px} pb-16 md:pb-20 xl:pb-24`}>
        <div className="bg-[#FAF5EB] p-8 md:p-12 xl:p-16">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-16">
            <div className="md:max-w-[40%]">
              <span className="text-[11px] md:text-[12px] tracking-[0.16em] uppercase text-[#B8932A] font-semibold">Promise</span>
              <h2 className="mt-3 text-[clamp(28px,4.5vw,48px)] tracking-[-0.03em] text-[#181512] leading-[1]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                What you will<br />
                <span className="italic text-[#A9782F]">never pay for.</span>
              </h2>
            </div>
            <div className="flex-1 space-y-4 md:space-y-5 text-[14px] md:text-[16px] xl:text-[17px] leading-[1.75] text-[#3D3526]">
              {[
                'Reading, liking, commenting, and sharing on Our Stories.',
                'Accessing your private library after downgrading. Your memories stay.',
                'Viewing everything you have built, even on the free plan.',
                'Your data. We do not sell it, rent it, or show you ads.',
                'Support. Premium gets priority, but everyone gets help.',
              ].map((line, i) => (
                <div key={i} className="flex gap-4">
                  <span className="shrink-0 mt-[0.5em] w-1.5 h-1.5 md:w-2 md:h-2 bg-[#B8932A]" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ━━━ CTA ━━━ */}
      <div className={`${px} pb-20 md:pb-32 xl:pb-40`}>
        <div className="flex justify-center">
          <div className="w-full max-w-[560px] xl:max-w-[640px] 2xl:max-w-[720px] px-8 py-10 md:px-10 md:py-12 xl:px-12 xl:py-14 text-center" style={{ background: '#1A1612' }}>
            <p className="text-[22px] md:text-[26px] xl:text-[30px] 2xl:text-[34px] leading-[1.2] tracking-[-0.02em] text-white mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
              Start with one memory.<br />
              <span className="italic text-[#C8A557]">Build from there.</span>
            </p>
            <p className="text-[13px] md:text-[14px] xl:text-[15px] text-[#A09888] mb-6 leading-relaxed">No credit card. No commitment. Just start.</p>
            <Link href="/signup" prefetch className="block w-full px-8 py-3.5 xl:py-4 text-[13px] xl:text-[14px] font-semibold tracking-[0.06em] text-[#1A1612] transition hover:opacity-90" style={{ background: 'linear-gradient(135deg, #C8A557 0%, #D4AF37 100%)' }}>
              START FOR FREE
            </Link>
            <p className="mt-3 text-[11px] xl:text-[12px] text-[#6F6255] tracking-[0.04em]">No credit card required · Takes 2 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}