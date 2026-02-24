'use client';

import { Button } from '@/components/ui/button';
import { Feather, Camera, Users, LockKeyhole } from 'lucide-react';

const journey = [
  {
    title: 'It begins with a single moment.',
    highlight: 'A whisper that refuses to fade.',
    quote: '“So I can hear my mother’s voice again.”',
    desc: 'Not an ending. Not nostalgia. A living continuation.',
    icon: Feather,
  },
  {
    title: 'Memories drift quickly.',
    highlight: 'Stories stay anchored.',
    quote: '“So I understand why that photo mattered.”',
    desc: 'Context gives memory weight. Reflection gives it life.',
    icon: Camera,
  },
  {
    title: 'A family archive.',
    highlight: 'Built slowly. Intentionally.',
    quote: '“So my children know where they come from.”',
    desc: 'Something that grows with you, not behind you.',
    icon: Users,
  },
  {
    title: 'Privacy is sacred.',
    highlight: 'Not optional.',
    quote: '“So only we can hold it close.”',
    desc: 'No feeds. No exposure. Just family.',
    icon: LockKeyhole,
  },
];

export default function CoreValueSnapshot() {
  return (
    <section className="relative bg-[#FBF7ED] text-[#0F2040] overflow-hidden">

      <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-28">

        {/* Stronger Hero Typography */}
        <div className="text-center max-w-4xl mx-auto mb-20">

           {/* Two-line headline */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="font-serif text-[2.4rem] sm:text-[3.2rem] leading-tight">
            Memory deserves meaning.
            <br />
            <span className="text-[#C9AE4A] italic">
              Not just storage.
            </span>
          </h2>
        </div>

          <div className="mt-4 h-[2px] w-20 bg-[#C9AE4A] mx-auto" />

          <p className="mt-8 text-xl sm:text-2xl leading-relaxed font-medium max-w-3xl mx-auto">
            Not another folder.
            <br />
            Not another app.
          </p>

          <p className="mt-6 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
            A place where stories are kept intentionally,
            so they stay alive long after the moment passes.
          </p>

        </div>

        {/* KEEP YOUR EXISTING BOXES EXACTLY AS THEY WERE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">

          {journey.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={index}
                className="
                  relative
                  bg-white
                  p-8 sm:p-10
                  border border-[#C9AE4A]/40
                  shadow-[0_10px_40px_rgba(0,0,0,0.06)]
                "
              >
                <div className="absolute -top-5 left-8 w-11 h-11 bg-[#FBF7ED] border border-[#C9AE4A] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#C9AE4A]" />
                </div>

                <h3 className="font-serif text-2xl mt-6 mb-3 leading-snug">
                  {step.title}
                  <br />
                  <span className="italic text-[#C9AE4A]">
                    {step.highlight}
                  </span>
                </h3>

                <p className="text-[#0F2040] leading-relaxed mb-6">
                  {step.desc}
                </p>

                <blockquote className="italic text-[#7A6530] border-l-2 border-[#C9AE4A] pl-4 text-sm">
                  {step.quote}
                </blockquote>

              </div>
            );
          })}

        </div>

        {/* Stronger Closing Presence */}
        <div className="mt-24 text-center max-w-3xl mx-auto">

          <p className="font-serif text-3xl leading-tight">
            One day, someone will want more than a photograph.
          </p>

          <p className="mt-8 text-xl leading-relaxed font-medium">
            They will want your voice.
            Your thoughts.
            Your meaning.
          </p>

          <div className="mt-12 h-[2px] w-16 bg-[#C9AE4A] mx-auto" />

          <div className="mt-12">
            <Button
              onClick={() => (window.location.href = '/signup')}
              className="
                bg-[#E3B341]
                hover:bg-[#F0CF7A]
                text-[#0F2040]
                px-14 py-6
                rounded-full
                text-lg
                font-semibold
                shadow-xl
              "
            >
              Start for free
            </Button>

            <p className="mt-6 text-base text-[#7A6530]">
              Free to begin. Private by default.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}