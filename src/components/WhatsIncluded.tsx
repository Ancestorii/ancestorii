'use client';

import { Button } from '@/components/ui/button';

export default function EverythingYouCanDo() {
  return (
    <section className="relative bg-[#F6F1E4] text-[#0F2040] overflow-hidden px-6 py-20">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-4xl sm:text-5xl font-serif leading-tight mb-6">
            Build your
            <br />
            <span className="italic text-[#C9AE4A]">
              living collection
            </span>
          </h2>

          <p className="text-lg text-[#0F2040]/65">
            Add stories, voices, and moments as life unfolds.
            Over time, they form something you can return to.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* TIMELINES */}
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-[#E5C45C]/30">
            <h3 className="text-2xl font-semibold mb-4">
              Timelines
            </h3>
            <p className="text-[#0F2040]/70 leading-relaxed">
              Capture moments as they happen.
              Watch your story unfold naturally across time.
            </p>
          </div>

          {/* ALBUMS */}
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-[#E5C45C]/30">
            <h3 className="text-2xl font-semibold mb-4">
              Albums with context
            </h3>
            <p className="text-[#0F2040]/70 leading-relaxed">
              Pair photos with meaning.
              Add the details that make each image personal.
            </p>
          </div>

          {/* STORIES */}
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-[#E5C45C]/30">
            <h3 className="text-2xl font-semibold mb-4">
              Stories and voices
            </h3>
            <p className="text-[#0F2040]/70 leading-relaxed">
              Record reflections, lessons, and voice notes.
              Keep personality attached to the memory.
            </p>
          </div>

          {/* PRIVACY */}
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-[#E5C45C]/30">
            <h3 className="text-2xl font-semibold mb-4">
              Private and secure
            </h3>
            <p className="text-[#0F2040]/70 leading-relaxed">
              Everything remains private.
              Built with encryption and designed for long term care.
            </p>
          </div>

        </div>

        {/* CTA */}
        <div className="text-center mt-24">
          <h3 className="text-3xl font-serif mb-6">
            Start with one memory.
          </h3>

          <Button
            onClick={() => (window.location.href = '/signup')}
            className="
              bg-[#E3B341]
              hover:bg-[#F0CF7A]
              text-[#0F2040]
              px-12 py-6
              rounded-full
              text-lg
              font-semibold
              shadow-lg
            "
          >
            Begin building your library
          </Button>
        </div>

      </div>
    </section>
  );
}
