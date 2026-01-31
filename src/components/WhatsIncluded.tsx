'use client';

import { Button } from '@/components/ui/button';

export default function EverythingYouCanDo() {
  return (
    <section className="relative bg-[#FFFDF6] text-[#0F2040] overflow-hidden px-6 py-20">
      
      {/* soft archival glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(212,175,55,0.10),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(212,175,55,0.06),transparent_60%)]" />

      <div className="relative max-w-3xl mx-auto">

        {/* Title */}
        <h2 className="text-3xl font-serif mb-3">
          Everything you can do
        </h2>

        {/* Subheading */}
        <p className="text-base text-[#0F2040]/70 mb-10">
          A quiet place to capture, organise, and return to what matters most.
        </p>

        {/* List */}
        <ul className="space-y-6 text-base leading-relaxed list-none mb-16">
          
          <li className="flex gap-3">
            <span className="text-[#C9AE4A] mt-1">✓</span>
            <div>
              <span className="block font-medium text-[#C9AE4A]">
                Personal timelines
              </span>
              Capture life moments as they happened and return to them anytime
            </div>
          </li>

          <li className="flex gap-3">
            <span className="text-[#C9AE4A] mt-1">✓</span>
            <div>
              <span className="block font-medium text-[#C9AE4A]">
                Photo albums
              </span>
              Organise photos alongside the memories behind them
            </div>
          </li>

          <li className="flex gap-3">
            <span className="text-[#C9AE4A] mt-1">✓</span>
            <div>
              <span className="block font-medium text-[#C9AE4A]">
                Written memories
              </span>
              Record stories, reflections, and details that photos cannot explain
            </div>
          </li>

          <li className="flex gap-3">
            <span className="text-[#C9AE4A] mt-1">✓</span>
            <div>
              <span className="block font-medium text-[#C9AE4A]">
                Voice notes
              </span>
              Preserve voices and emotion, not just text
            </div>
          </li>

          <li className="flex gap-3">
            <span className="text-[#C9AE4A] mt-1">✓</span>
            <div>
              <span className="block font-medium text-[#C9AE4A]">
                Memory capsules
              </span>
              Create memories intended to be opened in the future
            </div>
          </li>

          <li className="flex gap-3">
            <span className="text-[#C9AE4A] mt-1">✓</span>
            <div>
              <span className="block font-medium text-[#C9AE4A]">
                Private by default
              </span>
              Nothing is public and nothing is sold
            </div>
          </li>

          <li className="flex gap-3">
            <span className="text-[#C9AE4A] mt-1">✓</span>
            <div>
              <span className="block font-medium text-[#C9AE4A]">
                Secure storage
              </span>
              Built to protect your memories long term
            </div>
          </li>

          <li className="flex gap-3">
            <span className="text-[#C9AE4A] mt-1">✓</span>
            <div>
              <span className="block font-medium text-[#C9AE4A]">
                Access anytime
              </span>
              Available whenever you are ready to return to your story
            </div>
          </li>

        </ul>

        {/* CTA */}
        <div className="text-center space-y-6">
          <p className="text-lg text-[#0F2040]/60 max-w-md mx-auto">
            One day, someone will look for you here.
          </p>

          <h3 className="text-2xl sm:text-3xl font-serif">
            Give them something to find.
          </h3>

          <Button
            onClick={() => (window.location.href = '/signup')}
            className="
              mt-4
              bg-[#E6C26E]
              hover:bg-[#F3D99B]
              text-[#1F2837]
              px-10 py-6
              rounded-full
              text-lg
              font-semibold
              shadow-lg
            "
          >
            Begin preserving
          </Button>
        </div>

      </div>
    </section>
  );
}
