import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How to Save Family Voices | Ancestorii',
  description:
    'A calm, practical guide on how to save family voices and recordings. Preserve the sound, tone, and presence of loved ones before they are lost.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/how-to-save-family-voices',
  },
};


export default function SaveFamilyVoicesPage() {
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
              How to save
              <br />
              <span className="italic text-[#E5C45C]">family voices</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl leading-relaxed">
              A voice carries more than words.
              It carries tone, warmth, humour, and presence.
              Often, it is the first thing we realise we miss.
            </p>
          </header>

          {/* CONTENT */}
          <article className="space-y-12 text-[1.05rem] sm:text-[1.15rem] leading-relaxed text-[#0F2040]/75">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                Why voices matter so deeply
              </h2>

              <p>
                Photos show us how someone looked.
                Stories tell us what they did.
                But voices remind us who they were.
              </p>

              <p>
                The way someone laughed.
                The pauses they took between words.
                The way they said your name.
                These details live in sound, not images.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                Why voices are so easily lost
              </h2>

              <p>
                Most families do not think to record voices.
                Conversations happen naturally.
                Messages are deleted.
                Old voicemails disappear when phones are replaced.
              </p>

              <p>
                We assume there will always be another call.
                Another message.
                Another chance to hear that familiar tone again.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                What makes a voice worth keeping
              </h2>

              <p>
                A saved voice does not need to be formal.
                It does not need a script.
                Often, the most meaningful recordings are simple.
              </p>

              <p>
                A short story.
                A message to the future.
                An explanation of why a moment mattered.
              </p>

              <p>
                What matters is not perfection.
                What matters is presence.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                A simple way to begin
              </h2>

              <p>
                Start with one person.
                Ask them to speak about a memory they enjoy returning to.
                Let them speak in their own words.
              </p>

              <p>
                Keep the recording private.
                Store it somewhere intentional.
                Label it clearly, while the context is still fresh.
              </p>

              <p>
                Saving a voice does not require a perfect setup.
                It only requires the decision to listen and record.
              </p>
            </section>
          </article>

          {/* SOFT CTA */}
          <section className="pt-12 sm:pt-20 text-center space-y-6">
            <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl mx-auto leading-relaxed">
              If this guide brings someone to mind, you do not need to wait.
              Voices fade quietly, often without warning.
              Preserving one now can mean hearing it again when it matters most.
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
