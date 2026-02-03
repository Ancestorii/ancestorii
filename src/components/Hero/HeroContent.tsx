'use client';

import { Button } from '@/components/ui/button';

export default function HeroContent() {
  return (
    <div
  className="
    flex flex-col items-start justify-center
    text-left w-full
    px-4 sm:px-6
    pb-6 sm:pb-8
    max-w-none md:max-w-none
  "
>
      <h1
  className="
    relative
    w-full
    font-semibold
    text-[3.1rem] sm:text-[4rem] md:text-[4.6rem]
    leading-tight
    tracking-tight
    mb-0 sm:mb-3 md:mb-8
    text-[#D4AF37]
  "
>
  <span className="relative z-10">
    Where Your <span className="italic">Story</span> Begins.
  </span>

  {/* DESKTOP GRADIENT OVERLAY */}
</h1>
      {/* Supporting subline */}
<p
  className="
    mt-6
    text-white
    text-lg sm:text-xl
    w-full
    max-w-none sm:max-w-lg
  "
>
  One day, your children will want to know where their story began.
  You can start telling it here, <em className="italic">free to begin</em>.
</p>


      {/* CTA */}
<div className="mt-10 w-full flex flex-col items-center lg:items-start">
  <Button
    onClick={() => (window.location.href = '/signup')}
    className="
      bg-[#E6C26E]
      hover:bg-[#F3D99B]
      text-[#1F2837]
      px-12 py-6
      rounded-full
      text-lg sm:text-xl
      font-semibold
      shadow-lg
    "
  >
    Start with one memory
  </Button>

  <p className="mt-3 text-sm text-white/70 text-center lg:text-left">
    There’s no cost to start.
  </p>
</div>

    </div>
  );
}
