'use client';

import HeroContent from './HeroContent';
import HeroVisual from './HeroVisual';
import TextStarField from './TextStarField';

export default function Hero() {
  return (
    <section
      id="hero"
      className="
        relative w-full
        overflow-hidden md:overflow-visible
        bg-gradient-to-b
        from-[#14161B]
        via-[#0F1217]
        to-[#0A0C10]
      "
    >
      {/* =========================
          MOBILE
          Image → Banner → Text
         ========================= */}
      <div className="lg:hidden">
        {/* TOP IMAGE */}
        <HeroVisual />

        {/* Trust strip */}
        <div
          className="
            w-full
            bg-gradient-to-r
            from-[#F3D99B]/90
            via-[#E6C26E]
            to-[#F3D99B]/90
            py-3 sm:py-4
          "
        >
          <div
            className="
              mx-auto max-w-5xl px-4
              text-center
              text-[#3E3320]
              text-base sm:text-lg
              font-serif italic
              tracking-normal
              leading-relaxed
              whitespace-nowrap
            "
          >
            Private • Personal • A Living Library
          </div>
        </div>

        {/* TEXT SECTION */}
        <div className="relative flex-1 flex items-center">
          <div
            className="
              relative w-full px-5 sm:px-6 pt-6 pb-4 overflow-hidden
              bg-gradient-to-b
              from-[#20222A] via-[#1A1C24] to-[#141720]
            "
          >
            {/* MOBILE EDGE FADE */}
            <div
              className="
                absolute inset-0 z-[1] pointer-events-none
                bg-[linear-gradient(
                  to_right,
                  rgba(20,23,32,1) 0%,
                  rgba(20,23,32,0) 12%,
                  rgba(20,23,32,0) 88%,
                  rgba(20,23,32,1) 100%
                )]
              "
            />

            <TextStarField />

            <div className="relative z-10">
              <HeroContent />
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          DESKTOP
          Text | Image
          Banner bottom
         ========================= */}
      <div className="hidden lg:flex flex-col min-h-screen">
        {/* Split */}
        <div className="flex-1 grid grid-cols-2">
          {/* LEFT: TEXT */}
          <div
            className="
              relative flex items-center overflow-visible
              bg-gradient-to-b
              from-[#20222A] via-[#1A1C24] to-[#141720]
            "
          >
            {/* Right seam fade */}
            <div
              className="
                absolute inset-y-0 right-0 w-32 z-[1] pointer-events-none
                bg-gradient-to-r
                from-transparent
                to-[#141720]
              "
            />

            <TextStarField />

            <div className="relative z-10 w-full px-14 lg:px-20">
              <HeroContent />
            </div>
          </div>

          {/* RIGHT: IMAGE */}
          <div className="relative">
            <HeroVisual />
          </div>
        </div>

        {/* Banner at bottom */}
        <div
          className="
            w-full
            bg-gradient-to-r
            from-[#F3D99B]/90
            via-[#E6C26E]
            to-[#F3D99B]/90
            py-4
          "
        >
          <div
            className="
              mx-auto max-w-5xl px-6
              text-center
              text-[#3E3320]
              text-base sm:text-lg lg:text-2xl
              font-serif italic
              tracking-normal
              leading-relaxed
            "
          >
            Private • Personal • A Living Library
          </div>
        </div>
      </div>
    </section>
  );
}
