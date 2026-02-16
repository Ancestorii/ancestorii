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
        Capture life
        <br />
        <span className="italic">
          as it unfolds.
        </span>
      </h1>

      <p
        className="
          mt-6
          text-white
          text-lg sm:text-xl
          w-full
          max-w-none sm:max-w-lg
        "
      >
        Add stories, voices, and everyday moments
        to a private family library that grows over time.
        <em className="italic"> Free to begin.</em>
      </p>

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
          Private by default.
        </p>
      </div>
    </div>
  );
}
