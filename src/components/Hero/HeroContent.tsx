'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function HeroContent() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center w-full max-w-6xl overflow-visible
                 pt-[12vh] pb-[12vh] px-4 sm:px-6 md:px-0 -translate-y-[4vh]"
    >
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        className="
          overflow-visible
          font-extrabold
          text-[2.2rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6rem]
          leading-tight md:leading-[1.15]
          pb-5
          bg-gradient-to-r from-[#d4af37] via-[#d4af37] to-[#d4af37]
          bg-clip-text text-transparent
          drop-shadow-[0_0_22px_rgba(0,0,0,0.9)]
          tracking-tight
          md:whitespace-nowrap
        "
      >
        Preserve{' '}
        <span className="relative inline-block bg-gradient-to-r from-[#d4af37] via-[#d4af37] to-[#d4af37] bg-clip-text text-transparent">
          Your
          <span className="absolute left-0 right-0 -bottom-0 sm:-bottom-3 md:-bottom-4 h-[3px] sm:h-[5px] bg-[#d4af37]/80 rounded-full overflow-hidden">
  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shine_4s_linear_infinite]" />
</span>
        </span>{' '}
        Family's Legacy
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }}
        className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl lg:text-[1.6rem] text-white font-semibold max-w-3xl leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] px-2"
      >
        Capture, organize, and protect life’s most meaningful moments — ensuring your story lives on forever.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7, ease: 'easeOut' }}
        className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-10 sm:mt-14"
      >
        {/* Gold button with gold shimmer */}
        <Button
          className="relative overflow-hidden bg-gradient-to-r from-[#E6C26E] to-[#F3D99B] text-[#1F2837] font-semibold text-base sm:text-lg md:text-xl px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-full shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(212,175,55,0.6)]"
          onClick={() => (window.location.href = '/signup')}
        >
          <span className="relative z-10">Get Started</span>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_3s_linear_infinite]" />
        </Button>

        {/* White button — smooth scroll to pricing */}
        <Button
          className="bg-white border-2 border-[#d4af37] text-[#0f2040] font-semibold text-base sm:text-lg md:text-xl px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-full hover:bg-[#FFFFFF] hover:scale-105 hover:shadow-[0_0_35px_rgba(255,255,255,0.8)] transition-transform duration-300"
          onClick={() => {
            const pricingSection = document.getElementById('pricing');
            if (pricingSection) {
              const yOffset = -80; // offset for sticky header
              const y =
                pricingSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }}
        >
          View Plans
        </Button>
      </motion.div>
    </div>
  );
}
