'use client';

import Link from 'next/link';

export default function Security() {
  return (
    <section className="relative bg-[#F3EBD8] text-[#0F2040] overflow-hidden">

      {/* subtle gold texture glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(212,175,55,0.08),transparent_55%),radial-gradient(circle_at_85%_80%,rgba(212,175,55,0.06),transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto px-6 py-24 sm:py-32 space-y-18">

        {/* SECTION HEADER */}
        <div className="max-w-3xl">
          <p className="text-sm tracking-[0.3em] uppercase font-semibold text-[#D4AF37]">
            Security & Continuity
          </p>

          <h2 className="mt-6 font-serif text-[3rem] sm:text-[4rem] leading-[1.05]">
            Your family history is not
            <br />
            a rented space.
          </h2>

          <p className="mt-8 text-lg leading-relaxed">
            Ancestorii is designed for long-term preservation.
            If your plan changes, your memories do not disappear.
          </p>
        </div>

        {/* SECURITY GRID */}
        <div className="grid gap-16 md:grid-cols-2">

          {/* LEFT SIDE */}
          <div className="space-y-8">
            <h3 className="font-serif text-2xl sm:text-3xl">
              What happens if you stop paying?
            </h3>

            <ul className="space-y-5 text-lg">
              <li className="flex gap-4">
                <span className="text-[#D4AF37]">●</span>
                <span>You keep access to your library.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-[#D4AF37]">●</span>
                <span>Your existing memories remain intact.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-[#D4AF37]">●</span>
                <span>
                  If you exceed free limits, creation pauses;
                  nothing is deleted.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="text-[#D4AF37]">●</span>
                <span>
                  You can upgrade again at any time.
                </span>
              </li>
            </ul>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-8">
            <h3 className="font-serif text-2xl sm:text-3xl">
              Long-term continuity
            </h3>

            <ul className="space-y-5 text-lg">
              <li className="flex gap-4">
                <span className="text-[#D4AF37]">●</span>
                <span>
                  Structured architecture designed for longevity.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="text-[#D4AF37]">●</span>
                <span>
                  Optional annual physical archive (in development).
                </span>
              </li>
              <li className="flex gap-4">
                <span className="text-[#D4AF37]">●</span>
                <span>
                  Designed to remain accessible across generations.
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* PRIVACY SECTION */}
        <div className="pt-16 border-t border-[#E8D9A8]">

          <div className="max-w-3xl">
            <p className="text-sm tracking-[0.3em] uppercase font-semibold text-[#D4AF37]">
              Our Privacy Model
            </p>

            <h2 className="mt-6 font-serif text-[2.8rem] sm:text-[3.6rem] leading-[1.05]">
              Built without the incentives
              <br />
              that erode trust.
            </h2>

            <p className="mt-8 text-lg leading-relaxed">
              Ancestorii is not funded by attention.
              There are no feeds, no advertising models,
              and no data extraction incentives.
            </p>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-2">

            <div className="space-y-6">
              <h3 className="font-serif text-2xl">
                What we do not do
              </h3>

              <ul className="space-y-4 text-lg">
                <li className="flex gap-4">
                  <span className="text-[#D4AF37]">●</span>
                  <span>No public timelines.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#D4AF37]">●</span>
                  <span>No advertising.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#D4AF37]">●</span>
                  <span>No sale of personal data.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#D4AF37]">●</span>
                  <span>No algorithmic manipulation.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="font-serif text-2xl">
                What we are built for
              </h3>

              <ul className="space-y-4 text-lg">
                <li className="flex gap-4">
                  <span className="text-[#D4AF37]">●</span>
                  <span>Private family preservation.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#D4AF37]">●</span>
                  <span>Intentional structure.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#D4AF37]">●</span>
                  <span>Long-term access.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#D4AF37]">●</span>
                  <span>Trust as a foundation, not a feature.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex justify-center items-center px-10 py-4 rounded-full border border-[#D4AF37] text-[#0F2040] font-semibold"
            >
              Learn how Ancestorii works
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}