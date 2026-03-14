'use client';

import { Button } from '@/components/ui/button';

export default function HeroContent() {
  return (
  <div
  className="
    flex flex-col items-start justify-start
    text-left w-full
    px-6
    pt-6 lg:pt-16 xl:pt-24
    pb-12 lg:pb-16 xl:pb-24
  "
>
      {/* Headline */}
      <h1
        className="
          w-full
          font-serif
          font-semibold
          text-[clamp(2.8rem,5.6vw,10rem)]
          leading-[1.02]
          tracking-tight
          text-white
          text-balance
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
          mt-[clamp(1.2rem,2vw,3rem)]
          text-[clamp(1rem,1.1vw,1.8rem)]
          text-white/90
          max-w-none
          font-medium
        "
      >
        A private space to upload photos, record voice stories, and build a living library of the moments that shaped your family.
      </p>

      {/* Divider */}
      <div
        className="
          mt-[clamp(1rem,1.6vw,2rem)]
          h-[2px]
          w-[clamp(60px,5vw,120px)]
          bg-[#E6C26E]
        "
      />

      {/* Trust Block */}
      <div
        className="
          mt-[clamp(1.4rem,2.4vw,3rem)]
          max-w-none
        "
      >
        <p
          className="
            text-[clamp(1rem,1.2vw,1.9rem)]
            font-bold
            text-[#E6C26E]
            tracking-wide
          "
        >
          Free to begin. Your first memory starts here.
        </p>

        <p
          className="
            mt-[clamp(0.7rem,1.1vw,1.4rem)]
            text-[clamp(0.9rem,1vw,1.4rem)]
            text-white/85
          "
        >
          No hidden costs. No ads. Just your family's memories,
          privately preserved.
        </p>
      </div>

      {/* CTA */}
      <div
        className="
          mt-[clamp(1.8rem,3.5vw,4rem)]
          w-full
          flex flex-col sm:flex-row
          items-start
          gap-[clamp(0.7rem,1.4vw,1.4rem)]
        "
      >
        {/* Primary CTA */}
        <Button
          onClick={() => (window.location.href = '/signup')}
          className="
            group relative
            w-full sm:w-auto
            min-w-[clamp(200px,16vw,280px)]

            px-[clamp(1.6rem,2vw,3rem)]
            py-[clamp(0.7rem,1vw,1.3rem)]

            rounded-full
            text-[1.15rem] sm:text-[clamp(0.85rem,1vw,1.2rem)]
            font-semibold
            text-[#1F2837]

            bg-gradient-to-r from-[#E6C26E] via-[#F3D99B] to-[#E6C26E]
            bg-[length:200%_auto]
            hover:bg-right

            shadow-[0_10px_25px_rgba(230,194,110,0.35)]
            hover:shadow-[0_25px_55px_rgba(230,194,110,0.45)]

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
            min-w-[clamp(200px,16vw,280px)]

            px-[clamp(1.6rem,2vw,3rem)]
            py-[clamp(0.7rem,1vw,1.3rem)]

            rounded-full
            text-[1.15rem] sm:text-[clamp(0.85rem,1vw,1.2rem)]
            font-semibold

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