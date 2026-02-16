import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How to Capture and Grow Family Memories | Ancestorii',
  description:
    'A practical guide to capturing family memories while life is happening. Learn simple ways to record stories, voices, and moments and grow a living family library over time.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/how-to-preserve-family-memories',
  },
};

export default function PreserveFamilyMemoriesPage() {
  return (
    <main className="bg-[#FFFDF6] text-[#0F2040]">
      <Nav />

      <section className="relative overflow-hidden">
        {/* soft glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(212,175,55,0.08),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(212,175,55,0.05),transparent_60%)]" />

        <div className="relative max-w-screen-md mx-auto px-6 pt-16 pb-24 space-y-16">
          {/* INTRO */}
          <header className="space-y-6">
            <p className="text-sm tracking-[0.25em] uppercase text-[#8F7A2A]">
              Guide
            </p>

            <h1 className="text-[2.6rem] sm:text-[3.2rem] font-semibold leading-tight">
              How to capture and grow
              <br />
              <span className="italic text-[#E5C45C]">family memories</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl leading-relaxed">
              Most families do not lose their memories in a single moment.
              They simply move on to the next day.
              The next task.
              The next season of life.
              And small stories get left behind.
            </p>
          </header>

          {/* CONTENT */}
          <article className="space-y-12 text-[1.05rem] sm:text-[1.15rem] leading-relaxed text-[#0F2040]/75">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                Why small moments matter more than we think
              </h2>

              <p>
                We assume the important things will stay with us.
                The stories we have heard a hundred times.
                The voice we recognise instantly.
                The moments that feel too ordinary to record.
              </p>

              <p>
                But what often disappears are the details.
                The reason a photo mattered.
                The lesson inside a story.
                The personality behind a memory.
              </p>

              <p>
                Capturing memories while they are fresh allows them to stay alive,
                not just remembered.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                Why storage alone is not enough
              </h2>

              <p>
                Many people begin with storage.
                Photos saved to a phone.
                Files backed up to a hard drive.
                Videos uploaded to the cloud.
              </p>

              <p>
                These tools are useful, but they only hold data.
                They do not organise meaning.
                They do not connect stories together.
                They do not show how one memory relates to another.
              </p>

              <p>
                A growing family collection needs more than space.
                It needs structure and intention.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                What helps memories grow over time
              </h2>

              <p>
                Memories become lasting when they are given context.
                When someone explains what was happening.
                Why it mattered.
                What they were thinking at the time.
              </p>

              <p>
                A strong memory usually has three parts.
                The moment itself.
                The story behind it.
                And the voice of someone who lived it.
              </p>

              <p>
                You do not need to organise your entire history at once.
                You only need to begin with one.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                A simple way to begin
              </h2>

              <p>
                Choose one moment from today or this week.
                A photo you keep returning to.
                A story you tell often.
                A lesson you would want remembered.
              </p>

              <p>
                Write a few sentences.
                Record a short voice note.
                Add it somewhere intentional and private.
              </p>

              <p>
                A living family library is not built in a day.
                It grows through small, consistent contributions.
              </p>
            </section>
          </article>

          {/* SOFT CTA */}
          <section className="pt-12 sm:pt-20 text-center space-y-6">
            <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl mx-auto leading-relaxed">
              If this feels like something you have been meaning to do,
              you do not need a perfect system.
              You only need a place to begin.
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
              Start building your living library
            </Link>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}
