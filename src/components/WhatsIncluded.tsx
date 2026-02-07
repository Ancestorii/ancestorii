'use client';

import { Button } from '@/components/ui/button';

export default function EverythingYouCanDo() {
  return (
    <section className="relative bg-[#F6F1E4] text-[#0F2040] overflow-hidden px-6 pt-12 pb-20">
      
      {/* layered archival depth */}
      <div className="pointer-events-none absolute inset-0">
        {/* warm gold wash */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(227,179,65,0.28),transparent_55%)]" />
        {/* deeper gold shadow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_85%,rgba(180,140,40,0.18),transparent_60%)]" />
        {/* subtle paper depth */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.04),transparent_25%,transparent_75%,rgba(0,0,0,0.05))]" />
      </div>

      <div className="relative max-w-3xl mx-auto">

        {/* Title */}
        <h2 className="text-3xl font-serif mb-3 text-[#0F2040]">
          Everything you can do
        </h2>

        {/* Subheading */}
        <p className="text-base text-[#0F2040]/70 mb-10">
          A quiet place to capture, organise, and return to what matters most.
        </p>

        {/* List */}
        <ul className="space-y-6 text-base leading-relaxed list-none mb-16">
          
          {[
            {
              title: 'Personal timelines',
              desc: 'Capture life moments as they happened and return to them anytime',
            },
            {
              title: 'Photo albums',
              desc: 'Organise photos alongside the memories behind them',
            },
            {
              title: 'Written memories',
              desc: 'Record stories, reflections, and details that photos cannot explain',
            },
            {
              title: 'Voice notes',
              desc: 'Preserve voices and emotion, not just text',
            },
            {
              title: 'Memory capsules',
              desc: 'Create memories intended to be opened in the future',
            },
            {
              title: 'Private by default',
              desc: 'Nothing is public and nothing is sold',
            },
            {
              title: 'Secure storage',
              desc: 'Built to protect your memories long term',
            },
            {
              title: 'Access anytime',
              desc: 'Available whenever you are ready to return to your story',
            },
          ].map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[#C9AE4A] mt-1">✓</span>
              <div className="text-[#0F2040]/80">
                <span className="block font-medium text-[#B8942E]">
                  {item.title}
                </span>
                {item.desc}
              </div>
            </li>
          ))}

        </ul>

        {/* CTA */}
        <div className="text-center space-y-6">
          <p className="text-lg text-[#0F2040]/65 max-w-md mx-auto">
            One day, someone will look for you here.
          </p>

          <h3 className="text-2xl sm:text-3xl font-serif text-[#0F2040]">
            Give them something to find.
          </h3>

          <Button
            onClick={() => (window.location.href = '/signup')}
            className="
              mt-4
              bg-[#E3B341]
              hover:bg-[#F0CF7A]
              text-[#0F2040]
              px-10 py-6
              rounded-full
              text-lg
              font-semibold
              shadow-lg
            "
          >
            Begin preserving your story
          </Button>
        </div>

      </div>
    </section>
  );
}
