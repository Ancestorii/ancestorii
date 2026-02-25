'use client';

import Link from 'next/link';
import {
  Infinity,
  BookOpen,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function Security() {

  return (
    <section className="relative bg-[#FBF8F2] text-[#0F172A] py-16 sm:py-24 overflow-hidden">

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(200,165,87,0.08),transparent_50%),radial-gradient(circle_at_80%_90%,rgba(200,165,87,0.06),transparent_50%)]" />

      <div className="relative max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <div className="max-w-3xl mb-14 sm:mb-20">
          <span className="text-xs tracking-[0.4em] uppercase font-bold text-[#C8A557] block mb-4">
            Security & Continuity
          </span>

          <h2 className="font-serif text-4xl sm:text-6xl leading-tight">
            Your family history is not
            <span className="italic text-[#C8A557]"> a rented space.</span>
          </h2>

          <p className="mt-6 text-lg sm:text-xl leading-relaxed font-medium">
            Memories should not disappear because a plan changes.
            What belongs to your family stays with your family.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-8 lg:grid-cols-12 mb-20 sm:mb-28">

          {/* LARGE PROMISE CARD */}
          <div
            
            className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-12 shadow-[0_25px_60px_-20px_rgba(15,23,42,0.18)] border border-[#C8A557]/25 flex flex-col justify-between"
          >
            <div>
              <h3 className="font-serif text-3xl sm:text-4xl mb-6 text-[#C8A557]">
                If your plan changes, your memories do not.
              </h3>

              <p className="text-lg leading-relaxed font-medium mb-8">
                You should never have to keep paying just to hold onto your own history.
                Your existing library remains accessible even if you stop your subscription.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 border-t border-[#C8A557]/40 pt-8">
              <div>
                <h4 className="font-semibold text-lg text-[#C8A557] mb-2">
                  Permanent Access
                </h4>
                <p className="text-sm font-medium">
                  Stop creating if you wish. What you have already built remains safe and viewable.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-lg text-[#C8A557] mb-2">
                  No Deletion Policy
                </h4>
                <p className="text-sm font-medium">
                  We do not remove your memories. Creation simply pauses if limits are exceeded.
                </p>
              </div>
            </div>
          </div>

          {/* SUPPORTING CARDS */}
          <div className="lg:col-span-5 grid gap-6">

            <div
              className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200"
            >
              <Infinity className="w-6 h-6 text-[#C8A557] mb-4" />
              <h4 className="font-serif text-2xl font-semibold mb-2 text-[#C8A557]">
                Built for generations
              </h4>
              <p className="text-sm leading-relaxed font-medium">
                Designed with longevity in mind so your files remain accessible as technology evolves over time.
              </p>
            </div>

            <div
              className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200"
            >
              <BookOpen className="w-6 h-6 text-[#C8A557] mb-4" />
              <h4 className="font-serif text-2xl font-semibold mb-2 text-[#C8A557]">
                Physical archive option
              </h4>
              <p className="text-sm leading-relaxed font-medium">
                We are developing optional physical archives so your digital library can also live on a real shelf.
              </p>
            </div>

          </div>
        </div>

        {/* PRIVACY SECTION */}
<div className="pt-14 sm:pt-20 border-t-2 border-[#C8A557]">

  <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-start">

    <div>
      <span className="text-xs tracking-[0.4em] uppercase font-bold text-[#C8A557] block mb-4">
        Privacy
      </span>

      <h2 className="font-serif text-3xl sm:text-5xl leading-tight">
        Trust should not depend on hidden incentives.
      </h2>

      <p className="mt-6 text-lg leading-relaxed font-medium">
         We are funded by families, not advertisers.
         Your legacy is never treated as a data source.
      </p>
    </div>

    {/* Lists */}
    <div
      
      className="grid grid-cols-2 gap-8 sm:gap-12"
    >

      {/* We Will Never */}
      <div>
        <h4 className="font-serif text-lg sm:text-2xl text-[#C8A557] mb-6 underline underline-offset-8 decoration-2 decoration-[#C8A557]">
          We will never
        </h4>

        <ul className="space-y-4 font-semibold text-[#0F172A]">
          <li className="flex items-start gap-3">
            <span className="text-red-500 text-lg leading-none">×</span>
            Sell your data
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-500 text-lg leading-none">×</span>
            Show advertisements
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-500 text-lg leading-none">×</span>
            Use public feeds
          </li>
        </ul>
      </div>

      {/* Built For */}
      <div>
        <h4 className="font-serif text-lg sm:text-2xl text-[#C8A557] mb-6 underline underline-offset-8 decoration-2 decoration-[#C8A557]">
          Built for
        </h4>

        <ul className="space-y-4 font-semibold text-[#0F172A]">
          <li className="flex items-start gap-3">
            <span className="text-[#C8A557] text-lg leading-none">✓</span>
            Private libraries
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#C8A557] text-lg leading-none">✓</span>
            Family control
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#C8A557] text-lg leading-none">✓</span>
            Long term continuity
          </li>
        </ul>
      </div>

    </div>
  </div>

          {/* CTA */}
          <div className="mt-16 sm:mt-24 text-center">
            <Link
              href="/how-it-works"
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-full bg-white border-2 border-[#C8A557] text-[#0F172A] font-semibold transition-all hover:bg-[#C8A557] hover:text-white shadow-sm"
            >
              Discover how it works
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}