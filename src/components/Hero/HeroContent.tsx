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
          text-[2.6rem] sm:text-[3.2rem] md:text-[3.8rem]
          leading-[1.1]
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
          mt-8
          text-lg sm:text-xl
          text-white/90
          max-w-2xl
          font-medium
        "
      >
        A private space to capture stories, voices, photos and everyday life as it happens.
      </p>

      {/* Divider */}
      <div className="mt-8 h-[1px] w-16 bg-[#E6C26E]" />

      {/* What It Does */}
      <div className="mt-8 space-y-4 max-w-2xl text-base sm:text-lg text-white/85">
        <p>
          <span className="text-[#E6C26E] font-semibold">Create</span> timelines for each loved one.
        </p>
        <p>
          <span className="text-[#E6C26E] font-semibold">Upload</span> photos and videos into organised albums.
        </p>
        <p>
          <span className="text-[#E6C26E] font-semibold">Record</span> voice memories that can be replayed anytime.
        </p>
        <p>
          <span className="text-[#E6C26E] font-semibold">Keep everything private</span> in one secure place.
        </p>
      </div>

      {/* Trust Block */}
      <div className="mt-12 max-w-2xl">
        <p className="text-lg sm:text-xl font-bold text-[#E6C26E] tracking-wide">
          Free to begin. Free to create.
        </p>

        <p className="mt-4 text-sm sm:text-base text-white/70">
          No hidden costs. No ads. No data selling. No social media presence.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-12 w-full flex flex-col items-start">
        <Button
          onClick={() => (window.location.href = '/signup')}
          className="
            bg-[#E6C26E]
            hover:bg-[#F3D99B]
            text-[#1F2837]
            px-12 py-5
            rounded-full
            text-lg
            font-semibold
            shadow-xl
          "
        >
          Start with one memory
        </Button>
      </div>
    </div>
  );
}
