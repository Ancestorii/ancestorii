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
        A private space to capture stories, voices, photos and everyday life as it happens.
      </p>

      {/* Divider */}
      <div className="mt-6 h-[2px] w-20 bg-[#E6C26E]" />

      {/* Trust Block */}
      <div className="mt-10 max-w-3xl">
        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[#E6C26E] tracking-wide">
          Free to begin. Free to create.
        </p>

        <p className="mt-5 text-sm sm:text-base lg:text-lg text-white/70">
          No hidden costs. No ads. No data selling. No social media presence.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-14 w-full flex flex-col items-start">
        <Button
          onClick={() => (window.location.href = '/signup')}
          className="
            bg-[#E6C26E]
            hover:bg-[#F3D99B]
            text-[#1F2837]
            px-14 lg:px-16
            py-5 lg:py-6
            rounded-full
            text-lg lg:text-xl
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