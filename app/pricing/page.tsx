import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import PricingClient from './PricingClient';

export const metadata: Metadata = {
  title: 'Pricing | Ancestorii',
  description:
    'Start building your private living family library for free. Transparent plans designed to grow with your memories, stories and legacy.',
  alternates: {
    canonical: 'https://www.ancestorii.com/pricing',
  },
};

export default function PricingPage() {
  return (
    <>
      <Script id="pricing-schema" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Ancestorii Subscription Plans',
        })}
      </Script>

      <main className="bg-[#FFFDF6] text-[#0F2040]">
        <Nav />

        {/* HERO — same structure, parchment tone instead of dark */}
        <section className="bg-[#F6F1E4] border-b border-[#E8D9A8]">
          <div className="px-6 pt-20 pb-20 sm:pt-24 sm:pb-24">
            <div className="max-w-5xl mx-auto">
              <div className="max-w-3xl">

                <p className="text-lg tracking-[0.25em] uppercase text-[#B89B3C]">
                  Pricing
                </p>

                <h1 className="mt-5 font-serif text-[2.6rem] sm:text-[3.4rem] md:text-[4.1rem] leading-[1.05]">
                  A private place for your family’s stories.
                </h1>

                <p className="mt-6 text-base sm:text-lg text-[#0F2040]/70 leading-relaxed max-w-2xl">
                  Start building without a card. Keep it private. Invite family when you’re ready.
                  Upgrade only if you need more space.
                </p>

              </div>
            </div>
          </div>
        </section>

        {/* FREE — unchanged structure */}
        <section className="px-6 -mt-10 sm:-mt-14">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-[2rem] bg-white border border-[#EEDFAE] overflow-hidden">
              <div className="grid md:grid-cols-[1.15fr_0.85fr]">
                <div className="p-8 sm:p-10">

                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF3D6] text-[#8F7A2A] text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    Free forever
                  </div>

                  <h2 className="mt-5 font-serif text-2xl sm:text-3xl">
                    Begin with the essentials.
                  </h2>

                  <p className="mt-4 text-[#0F2040]/70 leading-relaxed max-w-xl">
                    Create your first timeline, add an album, and save a capsule with the story behind it.
                    If your family grows into it, expand later.
                  </p>

                  <div className="mt-7 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/signup"
                      className="inline-flex justify-center items-center px-7 py-3.5 rounded-full bg-[#E6C26E] hover:bg-[#F3D99B] text-[#0F2040] font-semibold transition"
                    >
                      Create your free library
                    </Link>

                    <a
                      href="#plans"
                      className="inline-flex justify-center items-center px-7 py-3.5 rounded-full border border-[#D4AF37] text-[#0F2040] font-semibold hover:bg-[#FFF4D8] transition"
                    >
                      See paid options
                    </a>
                  </div>
                </div>

                <div className="p-8 sm:p-10 bg-[#FFF9EE] border-t md:border-t-0 md:border-l border-[#EEDFAE]">
                  <div className="text-5xl sm:text-6xl font-extrabold leading-none">
                    £0
                  </div>

                  <ul className="mt-6 space-y-3 text-sm sm:text-base text-[#0F2040]/80">
                    <li className="flex gap-3">
                      <span className="text-[#D4AF37]">●</span>
                      <span>1 timeline, 1 album and 1 capsule</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#D4AF37]">●</span>
                      <span>Private by default</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#D4AF37]">●</span>
                      <span>Add stories, voices and context</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#D4AF37]">●</span>
                      <span>Upgrade whenever you choose</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PLANS — same section, softer gold tone */}
        <section id="plans" className="mt-16 sm:mt-20 bg-[#F6F1E4] border-y border-[#EEDFAE]">
          <div className="px-6 py-16 sm:py-20">
            <div className="max-w-6xl mx-auto">
              <div className="max-w-2xl">
                <h3 className="font-serif text-2xl sm:text-3xl">
                  More space when your collection grows.
                </h3>
                <p className="mt-3 text-[#0F2040] leading-relaxed">
                  These plans are for storage and capacity. You can start free, build first, then expand later.
                </p>
              </div>

              <PricingClient />
            </div>
          </div>
        </section>

        {/* TRUST — same layout, no dark block */}
        <section className="bg-[#FFF9EE] border-t border-[#EEDFAE]">
          <div className="px-6 py-16 sm:py-20">
            <div className="max-w-5xl mx-auto grid gap-10 md:grid-cols-2 items-start">

              <div>
                <h2 className="font-serif text-2xl sm:text-3xl leading-tight">
                  Your memories remain yours.
                </h2>
                <p className="mt-4 text-[#0F2040] leading-relaxed">
                  No public feeds. No ads. No selling of data.
                  Ancestorii exists for families who want privacy, intention, and long term care.
                </p>

                <div className="mt-8 flex flex-wrap gap-3 text-sm text-[#0F2040]">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#EEDFAE] px-4 py-2">
                    <span className="text-[#D4AF37]">●</span> Private by default
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#EEDFAE] px-4 py-2">
                    <span className="text-[#D4AF37]">●</span> Cancel anytime
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#EEDFAE] px-4 py-2">
                    <span className="text-[#D4AF37]">●</span> Upgrade anytime
                  </span>
                </div>
              </div>

              <div className="rounded-[2rem] bg-[#F6F1E4] border border-[#EEDFAE] p-8 sm:p-10">
                <p className="text-sm tracking-[0.25em] uppercase text-[#B89B3C]">
                  Ready when you are
                </p>
                <p className="mt-4 text-[#0F2040] leading-relaxed">
                  If you’re not sure what you need, start with the free library.
                  Most people only upgrade once they’ve actually begun.
                </p>

                <Link
                  href="/signup"
                  className="mt-8 inline-flex w-full justify-center items-center px-7 py-3.5 rounded-full bg-[#E6C26E] hover:bg-[#F3D99B] text-[#0F2040] font-semibold transition"
                >
                  Create your library
                </Link>

                <p className="mt-4 text-xs text-[#0F2040] text-center">
                  No card required. Start for free.
                </p>
              </div>

            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}