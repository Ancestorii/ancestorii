import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function OldFamilyPhotosPage() {
  return (
    <main className="bg-[#FFFDF6] text-[#0F2040]">
      <Nav />

      <section className="relative overflow-hidden">
        {/* soft archival glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(212,175,55,0.08),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(212,175,55,0.05),transparent_60%)]" />

        <div className="relative max-w-screen-md mx-auto px-6 pt-28 pb-24 space-y-16">
          {/* INTRO */}
          <header className="space-y-6">
            <p className="text-sm tracking-[0.25em] uppercase text-[#8F7A2A]">
              Guide
            </p>

            <h1 className="text-[2.6rem] sm:text-[3.2rem] font-semibold leading-tight">
              What to do with
              <br />
              <span className="italic text-[#E5C45C]">old family photos</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl leading-relaxed">
              Photos can survive for decades.
              What often disappears is everything around them.
              Names, places, dates, and the stories that made the moment matter.
            </p>
          </header>

          {/* CONTENT */}
          <article className="space-y-12 text-[1.05rem] sm:text-[1.15rem] leading-relaxed text-[#0F2040]/75">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                Start by keeping them safe
              </h2>

              <p>
                The first step is simple.
                Keep your photos in one place, protected from loss and damage.
                Loose prints in drawers, boxes, or lofts are easy to misplace,
                and easy to forget.
              </p>

              <p>
                You do not need to organise everything perfectly on day one.
                You only need to stop the slow drift of memories becoming
                scattered.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                Do not just store them, add meaning
              </h2>

              <p>
                A photo without context becomes a mystery.
                Even within one generation, names can slip.
                Two generations later, an important face can become unknown.
              </p>

              <p>
                The most valuable thing you can do is attach meaning while it is
                still close.
                Who is in the photo.
                Where it was taken.
                Why it mattered.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                Ask the one question that changes everything
              </h2>

              <p>
                If you have someone who recognises the people in the photo,
                ask one question.
                What is happening here.
              </p>

              <p>
                That question often unlocks stories you would never think to ask
                for directly.
                How they felt in that moment.
                What was happening in their life.
                Why that day is remembered.
              </p>

              <p>
                It is the difference between owning an image and preserving a
                memory.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                A gentle way to begin
              </h2>

              <p>
                Choose five photos.
                Not the most perfect ones.
                The ones you feel drawn to.
                The ones that make you pause.
              </p>

              <p>
                Add a sentence or two to each.
                Record a short note if you can.
                Keep them together, in one private place, so they do not get
                lost again.
              </p>

              <p>
                You do not need to preserve everything to preserve something
                meaningful.
                You only need to begin.
              </p>
            </section>
          </article>

          {/* SOFT CTA */}
          <section className="pt-12 sm:pt-20 text-center space-y-6">
            <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl mx-auto leading-relaxed">
              If there is a photo you would not want to lose the story behind,
              it may be worth saving it properly now.
              A small note today can keep a memory alive for decades.
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
