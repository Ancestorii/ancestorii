'use client';

import Link from 'next/link';
import { BookOpen, Mic, Image, ScrollText, Library, ArrowRight } from 'lucide-react';

/* ---------------- DATA ---------------- */
const guides = [
  {
  title: 'Living library vs digital vault',
  desc: 'Not all memory platforms are built the same. Some store files. Others help stories grow.',
  href: '/guides/living-library-vs-digital-vault',
  icon: Library,
},

  {
    title: 'How to preserve family memories',
    desc: 'Because memories fade quietly, long before we realise they are leaving.',
    href: '/guides/how-to-preserve-family-memories',
    icon: BookOpen,
  },
  {
    title: 'How to save family voices',
    desc: 'A voice carries more than words. It carries presence.',
    href: '/guides/how-to-save-family-voices',
    icon: Mic,
  },
  {
    title: 'What to do with old family photos',
    desc: 'Photos survive. Context often does not.',
    href: '/guides/what-to-do-with-old-family-photos',
    icon: Image,
  },
  {
    title: 'How to record family stories',
    desc: 'So future generations understand more than names and dates.',
    href: '/guides/how-to-record-family-stories',
    icon: ScrollText,
  },
];

/* ---------------- COMPONENT ---------------- */
export default function GuidesPreview() {
  return (
    <section className="relative bg-[#FFFDF6] text-[#0F2040] overflow-hidden">
      {/* soft archival glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(212,175,55,0.08),transparent_55%),radial-gradient(circle_at_85%_80%,rgba(212,175,55,0.05),transparent_60%)]" />

      <div className="relative px-6 pt-16 pb-16 sm:pt-24 sm:pb-24">
        {/* CENTERING WRAPPER (desktop only) */}
        <div className="mx-auto max-w-screen-lg">
          <div className="space-y-14 sm:space-y-16 sm:mx-auto sm:flex sm:flex-col sm:items-center">
            {/* INTRO */}
            <div className="max-w-2xl">
              <p className="text-sm tracking-[0.25em] text-[#8F7A2A] uppercase mb-4">
                Quiet guidance
              </p>

              <h2 className="text-[2.4rem] sm:text-[3rem] font-semibold leading-tight text-[#0F2040]">
                Guides for keeping
                <br />
                <span className="italic text-[#E5C45C]">what matters</span>.
              </h2>

              <p className="mt-5 text-base sm:text-lg text-[#0F2040]/65 max-w-xl">
                Thoughtful writing for moments when you are not ready to let
                things fade, but not sure where to begin.
              </p>

              {/* CLICK PROMPT */}
              <p className="mt-6 text-sm text-[#0F2040]/55">
                You can explore the guides below.
              </p>
            </div>

            {/* GUIDES LIST */}
            <div className="grid gap-y-6 sm:gap-y-8 max-w-3xl">
              {guides.map((guide, i) => {
                const Icon = guide.icon;

                return (
                  <Link
                    key={i}
                    href={guide.href}
                    className="
                      group
                      flex items-start gap-6
                      rounded-xl
                      border border-[#E5C45C]/30
                      bg-[#FFFDF6]
                      px-6 py-5
                      transition
                      hover:bg-[#FFFBEE]
                      hover:shadow-md
                      cursor-pointer
                    "
                  >
                    {/* Icon */}
                    <div className="mt-1 flex items-center justify-center w-11 h-11 rounded-full border border-[#E5C45C]/45 bg-[#FFFDF6]">
                      <Icon className="w-5 h-5 text-[#C9AE4A]" />
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-semibold text-[#0F2040]">
                        {guide.title}
                      </h3>

                      <p className="mt-2 text-base text-[#1F2A44]/60 max-w-xl leading-relaxed">
                        {guide.desc}
                      </p>
                    </div>

                    {/* Arrow affordance */}
                    <div className="mt-3 opacity-40 transition group-hover:opacity-100 group-hover:translate-x-1">
                      <ArrowRight className="w-5 h-5 text-[#8F7A2A]" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* VIEW ALL */}
            <div className="pt-4">
              <Link
  href="/guides"
  className="
    inline-flex items-center gap-2
    text-lg font-semibold
    text-[#C9AE4A]
    hover:text-[#E5C45C]
    transition
  "
>
  View all guides
  <ArrowRight className="w-4 h-4" />
</Link>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
