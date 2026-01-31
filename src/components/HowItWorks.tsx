'use client';

import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Feather,
  Camera,
  Users,
  LockKeyhole,
} from 'lucide-react';


/* ---------------- MOTION ---------------- */
const fade: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ---------------- DATA ---------------- */
const journey = [
  {
    title: 'It always starts quietly.',
    highlight: 'With intention.',
    desc: 'Not after something is lost — but while it still exists, unnoticed.',
    icon: Feather,
  },
  {
    title: 'Moments happen once.',
    highlight: 'Presence can remain.',
    desc: 'Hold onto the feeling, the context, the atmosphere of a moment.',
    icon: Camera,
  },
  {
    title: 'Memories need anchors.',
    highlight: 'People give them meaning.',
    desc: 'Stories matter most when they’re tied to the ones who lived them.',
    icon: Users,
  },
  {
    title: 'Time moves forward.',
    highlight: 'Care keeps things safe.',
    desc: 'Private, protected, and kept with the respect family memories deserve.',
    icon: LockKeyhole,
  },
];

/* ---------------- PAGE ---------------- */
export default function HowItWorks() {
  return (
    <section className="relative bg-[#FFFDF6] text-[#0F2040] overflow-hidden">
      {/* soft archival glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(212,175,55,0.10),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(212,175,55,0.06),transparent_60%)]" />

      <div className="relative max-w-screen-lg mx-auto px-6 pt-16 pb-28 sm:pt-28 sm:pb-32 space-y-28">

        {/* INTRO */}
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="max-w-2xl"
        >
          <p className="text-sm tracking-[0.25em] text-[#8F7A2A] uppercase mb-4">
            For the moments you don’t want to lose
          </p>

          <h2 className="text-[2.8rem] sm:text-[3.6rem] font-semibold leading-tight text-[#0F2040]">
            This is how
            <br />
            memories are <span className="italic text-[#E5C45C]">kept alive</span>.
          </h2>

          <p className="mt-5 text-base sm:text-lg text-[#0F2040]/65">
            Photos survive.
            <br />
            Everything around them usually fades.
          </p>
        </motion.div>

        {/* JOURNEY */}
        <div className="relative grid grid-cols-[1fr_3fr] gap-x-12">
          <div className="relative flex justify-center">
  <motion.div
    initial={{ scaleY: 0, opacity: 0 }}
    whileInView={{ scaleY: 1, opacity: 1 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
    }}
    className="
      w-[2px] h-full origin-top
      bg-[#C9CCD6]
    "
  />
</div>

          <div className="space-y-28">
            {journey.map((item, i) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={i}
                  variants={fade}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.4 }}
                  className="relative pl-2"
                >
                  <div className="absolute -left-[3.4rem] top-2 flex items-center justify-center w-12 h-12 rounded-full bg-[#FFFDF6] border border-[#E5C45C]/45 shadow-sm">
                    <Icon className="w-5 h-5 text-[#C9AE4A]" />
                  </div>

                  <h3 className="text-[1.95rem] sm:text-[2.3rem] font-semibold leading-snug text-[#0F2040] max-w-xl">
                    {item.title}
                    <br />
                    <span className="italic text-[#C9AE4A]">{item.highlight}</span>
                  </h3>

                  <p className="mt-4 text-lg text-[#1F2A44]/60 max-w-lg leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* OUTRO */}
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="text-center max-w-2xl mx-auto space-y-8"
        >
          <p
  className="
    text-[1.25rem] sm:text-lg
    leading-snug
    text-[#0F2040]/55
    max-w-[22ch] sm:max-w-none
    mx-auto
  "
>
  One day, someone will look for you in the past.
</p>


          <h3 className="text-[2.3rem] sm:text-[2.9rem] font-semibold text-[#0F2040]">
            Leave them something <span className="italic text-[#E5C45C]">real</span>.
          </h3>

         <div className="mt-10 w-full flex justify-center">
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
    Hold onto what matters
  </Button>
</div>
        </motion.div>

      </div>
    </section>
  );
}

