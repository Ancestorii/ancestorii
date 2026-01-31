'use client';

import Image from 'next/image';

export default function Founder() {
  return (
    <section className="w-full py-12 px-6 relative overflow-hidden">
      
      {/* Parchment background */}
      <div className="absolute inset-0 bg-[#f1ecdf]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_55%)] opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(0,0,0,0.08),transparent_60%)]" />

      <div className="relative mx-auto max-w-3xl text-center">

        {/* Headline */}
        <h2 className="text-2xl md:text-3xl font-serif text-[#2f3e34] mb-8">
          “This was always personal.”
        </h2>

        {/* Photo with paper shadow */}
        <div className="relative mx-auto w-[260px] md:w-[300px] mb-3 rotate-[-1.5deg]">
          
          {/* Paper shadow layer */}
          <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-[#e3dccb] shadow-sm" />

          {/* Photo paper */}
          <div className="relative bg-[#faf7f0] p-3 shadow-sm">
            <Image
  src="/founder.jpg"
  alt="Founder, David, with his mum"
  width={600}
  height={800}
  priority
  className="
    rounded-sm
    sepia-[0.25]
    contrast-[0.9]
    brightness-[0.85]
    saturate-[0.75]
  "
/>

{/* Darkening + vignette overlay */}
<div className="pointer-events-none absolute inset-3 rounded-sm
  bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_45%,rgba(0,0,0,0.28)_100%)]
  mix-blend-multiply"
/>

{/* Aged paper tint overlay */}
<div className="pointer-events-none absolute inset-3 rounded-sm
  bg-[#3b2f1a] opacity-[0.08] mix-blend-soft-light"
/>


            {/* Subtle vignette */}
            <div className="pointer-events-none absolute inset-3 rounded-sm bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_60%,rgba(0,0,0,0.12)_100%)] mix-blend-multiply" />
          </div>
        </div>

        {/* Caption */}
        <p className="text-sm text-[#6b6b6b] mb-6 italic">
  Founder, David, with his mum · 2013
</p>

        {/* Single paragraph quote */}
        <p className="text-left text-[#1f1f1f] text-[15px] leading-relaxed font-serif">
          “Ancestorii did not begin as a company. It began with a quiet fear that one day the stories, voices, and moments that shape a family could disappear without anyone noticing. I wanted a place where memories could live naturally, not buried in folders or lost on old phones, but kept together as something you could return to years from now and still feel close to. This is personal, and that is why it exists.”
          <span className="block mt-4 text-[#2f3e34]">
            David Leon, Founder
          </span>
        </p>

      </div>
    </section>
  );
}
