'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function HeroContent() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center w-full max-w-6xl
                 pt-[6vh] pb-[8vh] sm:pt-[10vh] sm:pb-[12vh]
                 px-4 sm:px-6 md:px-0 -translate-y-[2vh] sm:-translate-y-[4vh]"
    >
      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        className="
          font-extrabold
          text-[2.4rem] sm:text-[3.8rem] md:text-[5.2rem] lg:text-[6.2rem]
          leading-tight md:leading-[1.1]
          tracking-tight
          pb-6
          drop-shadow-[0_0_22px_rgba(0,0,0,0.9)]
          bg-gradient-to-r from-[#d4af37] via-[#d4af37] to-[#d4af37]
          bg-clip-text text-transparent
        "
      >
        Some memories
        <br />
        fade quietly.
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }}
        className="
          mt-8
          text-base sm:text-lg md:text-xl lg:text-[1.6rem]
          text-white font-semibold
          max-w-3xl leading-relaxed
          drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]
          px-2
        "
      >
        <span className="block mt-2 sm:mt-3">
          A private place to preserve memories, voices, and moments
          for you and for those who come after.
        </span>
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.7, ease: 'easeOut' }}
        className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-12 sm:mt-16"
      >
        <Button
          className="
            relative overflow-hidden
            bg-gradient-to-r from-[#E6C26E] to-[#F3D99B]
            text-[#1F2837]
            font-semibold
            text-base sm:text-lg md:text-xl
            px-8 sm:px-10 md:px-12
            py-4 sm:py-5 md:py-6
            rounded-full
            shadow-md
            transition-transform duration-300
            hover:scale-105
            hover:shadow-[0_0_25px_rgba(212,175,55,0.6)]
          "
          onClick={() => (window.location.href = '/signup')}
        >
          <span className="relative z-10">Explore Privately</span>
          <span
            className="absolute inset-0 bg-gradient-to-r
                       from-transparent via-white/40 to-transparent
                       animate-[shine_3s_linear_infinite]"
          />
        </Button>
      </motion.div>

      {/* Free reassurance */}
<motion.p
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.95, duration: 0.6, ease: 'easeOut' }}
  className="
    mt-6
    text-lg sm:text-xl md:text-2xl
    font-extrabold
    text-[#D4AF37]
    leading-snug
    drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]
  "
>
  Begin storing your memories
  <br className="block sm:hidden" />
  for free.
</motion.p>


      {/* Trust line — BELOW CTAs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.05, duration: 0.6, ease: 'easeOut' }}
        className="
          mt-10
          text-base sm:text-lg md:text-xl
          text-white/95
          tracking-wide
        "
      >
        Private • Personal • Built for generations
      </motion.div>
    </div>
  );
}
