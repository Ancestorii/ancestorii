'use client';

import { Button } from '@/components/ui/button';

export default function HeroContent() {
  return (
    <div
      className="
        flex flex-col items-start justify-center
        text-left w-full
        px-6 sm:px-8
        pt-10 sm:pt-0
        pb-10
      "
    >
      {/* Headline */}
      <h1
        className="
          w-full
          font-serif
          font-semibold
          text-[2.6rem]
          sm:text-[3.2rem]
          md:text-[4.5rem]
          lg:text-[5.5rem]
          xl:text-[6.5rem]
          leading-[1.05]
          tracking-tight
          text-white
        "
      >
        Your Story.
        <br />
        <span className="text-[#E6C26E]">
          Still Unfolding.
        </span>
      </h1>

      {/* Core Statement */}
      <p
        className="
          mt-10
          text-lg
          sm:text-xl
          lg:text-2xl
          text-white/90
          max-w-3xl
          font-medium
        "
      >
        A private space to upload photos, record voice stories, and build a living library of the moments that shaped your family.
      </p>

      {/* Divider */}
      <div className="mt-6 h-[2px] w-20 bg-[#E6C26E]" />

      {/* Trust Block */}
      <div className="mt-10 max-w-3xl">
        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#E6C26E] tracking-wide">
          Free to begin. Your first memory starts here.
        </p>

        <p className="mt-5 text-sm sm:text-base lg:text-lg text-white/85">
          No hidden costs. No ads. Just your family's memories, privately preserved.
        </p>
      </div>


     {/* CTA */}
<div className="mt-14 w-full flex flex-col sm:flex-row items-start gap-5">

  {/* Primary CTA */}
  <Button
    onClick={() => (window.location.href = '/signup')}
    className="
      group relative
      w-full sm:w-auto
      min-w-[260px]
      px-12 py-6
      rounded-full
      text-lg font-semibold
      text-[#1F2837]

      bg-gradient-to-r from-[#E6C26E] via-[#F3D99B] to-[#E6C26E]
      bg-[length:200%_auto]
      hover:bg-right

      shadow-[0_10px_25px_rgba(230,194,110,0.35)]
      hover:shadow-[0_18px_40px_rgba(230,194,110,0.45)]

      hover:-translate-y-0.5
      active:scale-[0.97]

      transition-all duration-300 ease-out
    "
  >
    Start with one memory
  </Button>


  {/* Secondary CTA */}
  <Button
    onClick={() => (window.location.href = '/pricing')}
    className="
      w-full sm:w-auto
      min-w-[260px]
      px-12 py-6
      rounded-full
      text-lg font-semibold

      text-[#1F2837]
      bg-white
      backdrop-blur-md

      border border-white/30
      hover:bg-gray-100

      shadow-lg
      hover:shadow-xl

      transition-all duration-300
    "
  >
    See our plans
  </Button>

</div>
    </div>
  );
}