import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Family Memory Guides | Ancestorii',
  description:
    'Practical guides on capturing stories, voices, and photos while life is happening. Learn how to begin building your family library with clarity and intention.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/what-to-do-with-old-family-photos',
  },
};

/* ---------------- DATA ---------------- */
const guides = [
  {
    title: 'How to preserve family memories',
    desc: 'A simple place to begin when you want to start capturing life intentionally.',
    href: '/guides/how-to-preserve-family-memories',
  },
  {
    title: 'How to save family voices',
    desc: 'Because tone, humour, and presence matter as much as the words.',
    href: '/guides/how-to-save-family-voices',
  },
  {
    title: 'What to do with old family photos',
    desc: 'Add context and meaning so each image becomes part of a living collection.',
    href: '/guides/what-to-do-with-old-family-photos',
  },
  {
    title: 'How to record family stories',
    desc: 'Capture reflections and lessons in the words of the person who lived them.',
    href: '/guides/how-to-record-family-stories',
  },
];

/* ---------------- PAGE ---------------- */
export default function GuidesPage() {
  return (
    <main className="bg-[#FFFDF6] text-[#0F2040]">
      <Nav />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(212,175,55,0.08),transparent_55%),radial-gradient(circle_at_85%_85%,rgba(212,175,55,0.05),transparent_60%)]" />

        <div className="relative max-w-screen-lg mx-auto px-6 pt-16 pb-24 space-y-20">

          {/* INTRO */}
          <div className="max-w-2xl">
            <p className="text-sm tracking-[0.25em] text-[#8F7A2A] uppercase mb-4">
              Guides
            </p>

            <h1 className="text-[2.8rem] sm:text-[3.4rem] font-semibold leading-tight">
  Practical steps for{' '}
  <span className="italic text-[#E5C45C]">
    building your family library
  </span>
</h1>


            <p className="mt-6 text-base sm:text-lg text-[#0F2040]/65 max-w-xl">
              These guides are written for moments when you feel ready to begin.
              Each one offers simple ways to add meaning to photos, stories, and voices.
            </p>
          </div>

          {/* GUIDES LIST */}
          <div className="grid gap-y-6 sm:gap-y-8 max-w-3xl">
            {guides.map((guide, i) => (
              <Link
                key={i}
                href={guide.href}
                className="
                  group
                  flex items-start gap-6
                  rounded-xl
                  border border-[#E5C45C]/30
                  bg-[#FFFDF6]
                  px-6 py-6
                  transition
                  hover:bg-[#FFFBEE]
                  hover:shadow-md
                "
              >
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    {guide.title}
                  </h2>

                  <p className="mt-2 text-base text-[#1F2A44]/60 max-w-xl leading-relaxed">
                    {guide.desc}
                  </p>
                </div>

                <div className="mt-3 opacity-40 transition group-hover:opacity-100 group-hover:translate-x-1">
                  <ArrowRight className="w-5 h-5 text-[#8F7A2A]" />
                </div>
              </Link>
            ))}
          </div>

          {/* CLOSING */}
          <section className="text-center pt-6">
            <h2 className="text-[1.9rem] sm:text-[2.6rem] font-serif mb-6 text-[#0F2040]">
              Start with one addition.
            </h2>

            <p className="text-base sm:text-xl text-[#0F2040]/65 max-w-2xl mx-auto mb-10 leading-relaxed">
              A photo with context.  
              A short story.  
              A voice note.  
              Small entries build something lasting.
            </p>

            <Link
              href="/signup"
              className="
                inline-flex items-center
                rounded-full
                bg-[#E6C26E]
                hover:bg-[#F3D99B]
                px-8 py-4
                text-base sm:text-lg
                font-semibold
                text-[#1F2837]
                shadow-md
                transition
              "
            >
              Begin building your library
            </Link>
          </section>

        </div>
      </section>

      <Footer />
    </main>
  );
}
