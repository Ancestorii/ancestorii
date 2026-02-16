'use client';

import { Button } from '@/components/ui/button';
import { Feather, Camera, Users, LockKeyhole } from 'lucide-react';

/* ---------------- DATA ---------------- */
const journey = [
  {
    title: 'It always begins simply.',
    highlight: 'With one memory.',
    quote: '“So you can hear your mum’s voice again.”',
    desc: 'Not because something is ending, but because life is unfolding.',
    icon: Feather,
  },
  {
    title: 'Moments pass quickly.',
    highlight: 'Stories can stay.',
    quote: '“So you know why your dad kept that photo.”',
    desc: 'Add the feeling, the context, and the reason a moment mattered.',
    icon: Camera,
  },
  {
    title: 'Collections grow over time.',
    highlight: 'One addition at a time.',
    quote: '“So your kids know who your grandmother was, in your words.”',
    desc: 'A living family library forms slowly, shaped by the people inside it.',
    icon: Users,
  },
  {
    title: 'Privacy matters.',
    highlight: 'Care makes it lasting.',
    quote: '“So only you and your family can see it.”',
    desc: 'Private, intentional, and built to grow with you.',
    icon: LockKeyhole,
  },
];

/* ---------------- PAGE ---------------- */
export default function HowItWorks() {
  return (
    <section className="relative bg-[#FFFDF6] text-[#0F2040] overflow-hidden">
      {/* soft glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(212,175,55,0.10),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(212,175,55,0.06),transparent_60%)]" />

      <div className="relative max-w-screen-lg mx-auto px-6 pt-16 pb-16 sm:pt-28 sm:pb-32 space-y-24 sm:space-y-28">
        {/* INTRO */}
        <div className="max-w-2xl">
          <p className="text-sm tracking-[0.25em] text-[#8F7A2A] uppercase mb-4">
            Build your family library
          </p>

          <h2 className="text-[2.8rem] sm:text-[3.6rem] font-semibold leading-tight text-[#0F2040]">
            This is how
            <br />
            memories <span className="italic text-[#E5C45C]">take shape</span>.
          </h2>

          <p className="mt-5 text-base sm:text-lg text-[#0F2040]/65">
            A photo is a start.
            <br />
            The story around it gives it depth.
          </p>
        </div>

        {/* JOURNEY */}
        <div className="relative grid grid-cols-[1fr_3fr] gap-x-12">
          {/* Static line */}
          <div className="relative flex justify-center">
            <div className="w-[2px] h-full bg-[#C9CCD6]" />
          </div>

          <div className="space-y-20 sm:space-y-24">
            {journey.map((item, i) => {
              const Icon = item.icon;

              return (
                <div key={i} className="relative pl-2">
                  {/* Icon */}
                  <div className="absolute -left-[3.4rem] top-2 flex items-center justify-center w-12 h-12 rounded-full bg-[#FFFDF6] border border-[#E5C45C]/45 shadow-sm">
                    <Icon className="w-5 h-5 text-[#C9AE4A]" />
                  </div>

                  {/* Title */}
                  <h3 className="text-[1.95rem] sm:text-[2.3rem] font-semibold leading-snug text-[#0F2040] max-w-xl">
                    {item.title}
                    <br />
                    <span className="italic text-[#C9AE4A]">
                      {item.highlight}
                    </span>
                  </h3>

                  {/* Description */}
                  <p className="mt-4 text-lg text-[#1F2A44]/60 max-w-lg leading-relaxed">
                    {item.desc}
                  </p>

                  {/* Quote */}
                  <div className="mt-10">
                    <p
                      className="
                        text-[1.05rem] sm:text-[1.1rem]
                        leading-snug
                        text-[#0F2040]/55
                        italic
                        font-serif
                        max-w-[36ch]
                      "
                    >
                      {item.quote}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OUTRO */}
        <div className="text-center max-w-2xl mx-auto space-y-8">
          <p className="text-[1.25rem] sm:text-lg leading-snug text-[#0F2040]/55 max-w-[22ch] sm:max-w-none mx-auto">
            Over time, a collection forms.
          </p>

          <h3 className="text-[2.3rem] sm:text-[2.9rem] font-semibold text-[#0F2040]">
            Add something{' '}
            <span className="italic text-[#E5C45C]">today</span>.
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
              Start with one memory
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
