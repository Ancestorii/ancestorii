'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Feather, Camera, Mic, LockKeyhole, ArrowRight } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Add a loved one.',
    highlight: 'Start their library.',
    desc: 'Create a space for someone you care about. A person becomes the centre, not a folder.',
    quote: '“So our family story has a home.”',
    icon: Users,
  },
  {
    step: '02',
    title: 'Build their timeline.',
    highlight: 'Milestones that make sense.',
    desc: 'Add life moments in order so the story is easy to follow, from early years to now.',
    quote: '“So I can see the full story in one place.”',
    icon: Feather,
  },
  {
    step: '03',
    title: 'Create albums.',
    highlight: 'Chapters, not uploads.',
    desc: 'Group photos into meaningful chapters like School Years, Weddings, Holidays and more.',
    quote: '“So every photo belongs somewhere.”',
    icon: Camera,
  },
  {
    step: '04',
    title: 'Save capsules.',
    highlight: 'Voice, thoughts, and context.',
    desc: 'Capture voice notes and reflections that preserve presence and meaning behind moments.',
    quote: '“So I can hear her voice again.”',
    icon: Mic,
  },
  {
    step: '05',
    title: 'Keep it private.',
    highlight: 'Family controlled.',
    desc: 'Everything stays private. No feeds. No noise. Only who you choose.',
    quote: '“So only we can hold it close.”',
    icon: LockKeyhole,
  },
];

export default function JourneyExperience() {
  return (
    <section className="relative bg-[#F6F0E4] text-[#0F2040] overflow-hidden">

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-28 lg:py-44">

        {/* ================= DESKTOP ================= */}
        <div className="hidden lg:grid grid-cols-2 gap-32">

          {/* LEFT SIDE */}
          <div className="sticky top-40 h-fit">

            <h2 className="font-serif text-[4.2rem] leading-[1.05] mb-12">
              Build a private family library.
              <br />
              <span className="text-[#C9AE4A] italic">
                Structured. Meaningful. Alive.
              </span>
            </h2>

            <div className="h-[3px] w-32 bg-[#C9AE4A] mb-12" />

            <p className="text-[1.35rem] leading-relaxed mb-10 max-w-xl font-medium">
              This is where memories gain structure.
              Where voices stay present.
              Where photographs finally make sense.
            </p>

            <Button
              onClick={() => (window.location.href = '/signup')}
              className="bg-[#E3B341] hover:bg-[#F0CF7A] text-[#0F2040] px-14 py-7 rounded-full text-xl font-semibold shadow-xl"
            >
              Begin your family library
            </Button>

            <p className="mt-6 text-base text-[#7A6530] font-medium">
              Free to begin. Private by default.
            </p>

          </div>

          {/* RIGHT SIDE */}
          <div className="relative">

            <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-[#C9AE4A]/30" />

            <div className="space-y-24">

              {steps.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="relative pl-24">

                    <div className="absolute left-0 top-4 w-16 h-16 rounded-full bg-[#F6F0E4] border-2 border-[#C9AE4A] flex items-center justify-center shadow-md">
                      <Icon className="w-7 h-7 text-[#C9AE4A]" />
                    </div>

                    <span className="text-sm tracking-[0.4em] font-bold text-[#C9AE4A]">
                      STEP {item.step}
                    </span>

                    <h3 className="font-serif text-[3.2rem] mt-4 leading-tight">
                      {item.title}
                      <span className="block italic text-[#C9AE4A] text-[2.4rem] mt-2">
                        {item.highlight}
                      </span>
                    </h3>

                    <p className="text-[1.25rem] leading-relaxed mt-6 max-w-2xl">
                      {item.desc}
                    </p>

                    <blockquote className="mt-8 italic text-[#7A6530] text-xl">
                      {item.quote}
                    </blockquote>

                  </div>
                );
              })}

            </div>
          </div>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="lg:hidden">

          <div className="mb-14">
            <h2 className="font-serif text-[2.8rem] leading-tight">
              Build a private family library.
              <br />
              <span className="text-[#C9AE4A] italic">
                Structured. Meaningful. Alive.
              </span>
            </h2>

            <p className="mt-6 inline-flex items-center gap-3 text-base font-semibold text-[#0F2040] bg-white px-4 py-2 rounded-full shadow-sm border border-[#C9AE4A]/40">
  Swipe to explore
  <ArrowRight className="w-4 h-4 text-[#C9AE4A]" />
</p>
          </div>

          <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-12">

            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="snap-center flex-shrink-0 w-full max-w-[420px] bg-white border border-[#C9AE4A]/40 p-8 rounded-3xl shadow-[0_25px_60px_-20px_rgba(0,0,0,0.12)]"
                >
                  <div className="flex justify-between items-center mb-6">

                    <span className="text-xs tracking-[0.35em] font-bold text-[#C9AE4A]">
                      STEP {item.step}
                    </span>

                    <div className="w-14 h-14 bg-[#F6F0E4] border border-[#C9AE4A] flex items-center justify-center rounded-xl">
                      <Icon className="w-6 h-6 text-[#C9AE4A]" />
                    </div>

                  </div>

                  <h3 className="font-serif text-2xl mb-4 leading-tight">
                    {item.title}
                    <span className="block italic text-[#C9AE4A] text-xl mt-2">
                      {item.highlight}
                    </span>
                  </h3>

                  <p className="text-lg leading-relaxed mb-8">
                    {item.desc}
                  </p>

                  <blockquote className="italic text-[#7A6530] border-l-2 border-[#C9AE4A] pl-4 text-base">
                    {item.quote}
                  </blockquote>

                </div>
              );
            })}
          </div>
        </div>

        {/* ================= FINAL EMOTIONAL SECTION ================= */}
        <div className="mt-12 lg:mt-44 text-center max-w-4xl mx-auto">

          <p className="font-serif text-4xl lg:text-5xl leading-tight">
            One day, someone will want more than a photograph.
          </p>

          <p className="mt-10 text-2xl leading-relaxed font-medium">
            They will want your voice.
            <br />
            Your thoughts.
            <br />
            Your meaning.
          </p>

          <div className="mt-14 h-[3px] w-20 bg-[#C9AE4A] mx-auto" />

          <div className="mt-14">
            <Button
              onClick={() => (window.location.href = '/signup')}
              className="bg-[#E3B341] hover:bg-[#F0CF7A] text-[#0F2040] px-16 py-7 rounded-full text-xl font-semibold shadow-xl"
            >
              Preserve what matters
            </Button>

            <p className="mt-6 text-base text-[#7A6530] font-medium">
              Free to begin. Private by default.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}