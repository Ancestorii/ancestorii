import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How to Preserve Family Memories | Ancestorii',
  description:
    'A thoughtful guide on how to preserve family memories before they fade. Learn simple ways to keep photos, voices, and stories safe for future generations.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/how-to-preserve-family-memories',
  },
};


export default function PreserveFamilyMemoriesPage() {
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
              How to preserve
              <br />
              <span className="italic text-[#E5C45C]">family memories</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl leading-relaxed">
              Most families do not lose their memories in a single moment.
              They fade quietly, through time, distraction, and good intentions
              that never quite become action.
            </p>
          </header>

          {/* CONTENT */}
          <article className="space-y-12 text-[1.05rem] sm:text-[1.15rem] leading-relaxed text-[#0F2040]/75">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                Why memories fade faster than we expect
              </h2>

              <p>
                We often assume that the important things will stay with us.
                The stories we have heard a hundred times.
                The voices we recognise instantly.
                The moments that feel too vivid to disappear.
              </p>

              <p>
                But memory is fragile.
                Details are usually the first to go.
                Not the events themselves, but the context around them.
                The tone of a voice.
                The reason a photo mattered.
                The feeling of being there.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                What most people try first
              </h2>

              <p>
                When people think about preserving memories, they often start
                with storage.
                Photos saved to a phone.
                Files backed up to a hard drive.
                Videos uploaded to the cloud.
              </p>

              <p>
                These things help, but they are incomplete.
                They preserve data, not meaning.
                Without context, a photo becomes just an image.
                A recording becomes just a file.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                What actually helps memories last
              </h2>

              <p>
                Memories last longer when they are intentional.
                When they are given a place.
                When they are explained in the words of the person who lived
                them.
              </p>

              <p>
                A preserved memory usually has three parts.
                The moment itself.
                The story behind it.
                And the voice of someone who can say why it mattered.
              </p>

              <p>
                This does not require doing everything at once.
                It only requires beginning.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                A simple place to start
              </h2>

              <p>
                Choose one memory.
                A photo you return to often.
                A story you tell without thinking.
                A voice you would miss hearing again.
              </p>

              <p>
                Write a few sentences.
                Record a short message.
                Keep it somewhere safe and private.
              </p>

              <p>
                Preservation does not happen all at once.
                It happens through small, deliberate acts of care.
              </p>
            </section>
          </article>

          {/* SOFT CTA */}
          <section className="pt-12 sm:pt-20 text-center space-y-6">
            <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl mx-auto leading-relaxed">
              If this guide feels close to something you have been thinking
              about, you do not need to wait for the right time.
              Most memories are preserved by people who simply decided to begin.
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
