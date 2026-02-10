import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Moments Worth Keeping | Ancestorii',
  description:
    'Moments Worth Keeping is a short podcast about memories, photos, and the small details that quietly shape a life. Each episode offers a few calm minutes to slow things down and reflect on what remains.',
};


export default function MomentsWorthKeepingPage() {
  return (
    <>
      <Nav />

      <main className="relative isolate bg-[#FFFDF6] text-[#0F2040]">

        {/* Parchment texture */}
        <Image
          src="/parchment.png"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover opacity-[0.25] -z-10 pointer-events-none"
        />

        {/* Soft archival light */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_60%)]" />

        <div className="relative mx-auto max-w-2xl px-6 pt-28 pb-32">

          {/* HEADER */}
          <header className="text-center mb-20 space-y-6">
            <p className="text-xs tracking-[0.35em] uppercase text-[#C9AE4A]">
              Podcast
            </p>

            <h1 className="font-serif text-4xl sm:text-5xl leading-tight text-[#0F2040]">
              Moments Worth Keeping
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-[#1F2A44]/70 max-w-xl mx-auto">
              A short podcast about memories, photos, and the small details that
              quietly shape a life. Each episode is a few calm minutes to slow
              things down and reflect on what remains.
            </p>

            <div className="pt-6">
              <Link
                href="https://open.spotify.com/show/0fR2O7fyOBB98yGlRpRsiJ"
                target="_blank"
                className="
                  inline-flex items-center gap-2
                  text-sm font-medium
                  text-[#0F2040]
                  transition
                  hover:text-[#C9AE4A]
                "
              >
                Listen on Spotify
                <span className="text-[#C9AE4A]">→</span>
              </Link>
            </div>
          </header>

          {/* EPISODES */}
          <section className="space-y-12">

            <article className="border-l-2 border-[#E5C45C] pl-6">
              <p className="text-sm tracking-wide uppercase text-[#8F7A2A] mb-2">
                Episode 1
              </p>

              <h2 className="font-serif text-2xl text-[#0F2040]">
                An Introduction
              </h2>

              <p className="mt-2 text-sm text-[#1F2A44]/60">
                10th February 2026
              </p>
            </article>

            {/* Future episodes go here */}
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}
