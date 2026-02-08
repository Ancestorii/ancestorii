import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'What to Do With Old Family Photos | Ancestorii',
  description:
    'A practical guide on what to do with old family photos. Learn how to protect them, add context, and preserve the stories behind each image.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/what-to-do-with-old-family-photos',
  },
};


/* ---------------- DATA ---------------- */
const guides = [
  {
    title: 'How to preserve family memories',
    desc: 'A gentle place to begin when you feel time moving faster than you expected.',
    href: '/guides/how-to-preserve-family-memories',

  },
  {
    title: 'How to save family voices',
    desc: 'Because a voice carries presence long after words are forgotten.',
    href: '/guides/how-to-save-family-voices',

  },
  {
    title: 'What to do with old family photos',
    desc: 'Photos survive. Context and meaning often do not.',
    href: '/guides/what-to-do-with-old-family-photos',
  },
  {
    title: 'How to record family stories',
    desc: 'So future generations understand more than names and dates.',
    href: '/guides/how-to-record-family-stories',

  },
];

/* ---------------- PAGE ---------------- */
export default function GuidesPage() {
  return (
    <main className="bg-[#FFFDF6] text-[#0F2040]">
      <Nav />

      <section className="relative overflow-hidden">
        {/* subtle archival glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(212,175,55,0.08),transparent_55%),radial-gradient(circle_at_85%_85%,rgba(212,175,55,0.05),transparent_60%)]" />

        <div className="relative max-w-screen-lg mx-auto px-6 pt-28 pb-24 space-y-20">
          {/* INTRO */}
          <div className="max-w-2xl">
            <p className="text-sm tracking-[0.25em] text-[#8F7A2A] uppercase mb-4">
              Guides
            </p>

            <h1 className="text-[2.8rem] sm:text-[3.4rem] font-semibold leading-tight">
              Quiet help for
              <br />
              <span className="italic text-[#E5C45C]">keeping what matters</span>.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#0F2040]/65 max-w-xl">
              These guides are written for moments when you feel something
              important should not be lost, but you are not sure where to
              begin.
            </p>

            <p className="mt-6 text-sm text-[#0F2040]/55">
              Click any guide below to read.
            </p>
          </div>

          {/* GUIDES LIST */}
          <div className="grid gap-y-6 sm:gap-y-8 max-w-3xl">
            {guides.map((guide, i) => {

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
                    px-6 py-6
                    transition
                    hover:bg-[#FFFBEE]
                    hover:shadow-md
                    cursor-pointer
                  "
                >

                  {/* Text */}
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-semibold">
                      {guide.title}
                    </h2>

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
                   {/* CLOSING INVITATION */}
<section className="max-w-5xl mx-auto px-6 pt-6 pb-14 sm:pt-12 sm:pb-28 text-center">
  <h2 className="text-[1.9rem] sm:text-[2.6rem] font-serif mb-4 sm:mb-6 text-[#0F2040]">
    Some things are worth keeping
  </h2>

  <p className="text-base sm:text-xl text-[#0F2040]/65 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed">
    Most memories are not lost all at once.
    They fade quietly, over time.
    You can begin preserving them now, while they still feel close.
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
    Begin preserving what matters
  </Link>
</section>

        </div>
      </section>

      <Footer />
    </main>
  );
}
