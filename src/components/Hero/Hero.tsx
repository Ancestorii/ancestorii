'use client';

import StarFieldNew from '@/components/Hero/StarFieldNew';
import HeroContent from './HeroContent';

export default function Hero() {
  return (
    <section
  id="hero"
  className="relative flex items-center justify-center w-full min-h-[100vh] bg-black overflow-visible isolate"
>
      {/* Background */}
      <StarFieldNew />

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center w-full px-6 py-[14vh] sm:py-[15vh] md:py-[16vh]">
        <HeroContent />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none z-10" />
    </section>
  );
}
