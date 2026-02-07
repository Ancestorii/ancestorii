import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Legacy: How to Preserve Your Family History Digitally",
  description:
    "Learn how to preserve your family history digitally — from photos and stories to voices and memories — and why digital legacy matters for future generations.",
  alternates: {
    canonical: "https://www.ancestorii.com/digital-legacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function DigitalLegacyPage() {
  return (
    <>
      <Nav />

      <main className="bg-[#fff9ee] text-[#0F2040]">
        {/* HERO */}
        <section className="max-w-6xl mx-auto px-6 pt-44 pb-16">

          <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
            Digital Legacy:  
            <span className="block italic text-[#D4AF37]">
              Preserving Family History for the Future
            </span>
          </h1>

          <p className="max-w-3xl text-lg text-[#0F2040]/80">
            Preserving your family history digitally isn’t about technology —
            it’s about making sure the stories, voices, and moments that define
            your family don’t disappear with time.
          </p>
        </section>

        {/* IMAGE */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden">
            <Image
              src="/family4.jpg"
              alt="Family memories across generations"
              fill
              className="object-cover"
              priority
            />
          </div>
        </section>

        {/* WHAT IS DIGITAL LEGACY */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            What is a digital legacy?
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            A digital legacy is the collection of memories, stories, photos,
            videos, and voices that represent a person’s life — stored securely
            so they can be accessed by future generations.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            Unlike physical albums or scattered cloud folders, a digital legacy
            brings everything together in one intentional place, preserving not
            just what happened — but why it mattered.
          </p>
        </section>

        {/* IMAGE */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden">
            <Image
              src="/album.jpg"
              alt="Old photo albums and family records"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* WHY PRESERVING FAMILY HISTORY MATTERS */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            Why preserving family history matters
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Over time, details fade. Names are forgotten. Voices are lost.
            Stories become fragments passed down imperfectly.
          </p>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Preserving your family history digitally ensures that future
            generations can understand who their family was — in your own
            words, not second-hand summaries.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            It’s not about nostalgia. It’s about continuity.
          </p>
        </section>

        {/* IMAGE */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden">
            <Image
              src="/family6.jpg"
              alt="Listening to recorded family stories"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* COMMON QUESTIONS */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-10">
            Common questions about preserving family history digitally
          </h2>

          <div className="space-y-10">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                How can I preserve my family history digitally?
              </h3>
              <p className="text-[#0F2040]/85">
                Start by collecting meaningful photos, stories, and recordings.
                Organise them intentionally, add context in your own words, and
                store them somewhere private, secure, and designed for long-term
                preservation.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Are cloud storage and social media enough?
              </h3>
              <p className="text-[#0F2040]/85">
                Cloud drives store files, but they don’t preserve meaning.
                Social media platforms change, compress data, or disappear.
                Neither is designed for generational memory.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                What types of memories should be preserved?
              </h3>
              <p className="text-[#0F2040]/85">
                Photos matter — but voices, stories, explanations, and personal
                reflections often matter more. The context behind a memory is
                what future generations value most.
              </p>
            </div>
          </div>
        </section>

        {/* HOW ANCESTORII FITS */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden mb-10">
            <Image
              src="/family7.jpg"
              alt="Preserving memories digitally for future generations"
              fill
              className="object-cover"
            />
          </div>

          <h2 className="text-3xl font-serif mb-6">
            A private place to preserve your family’s story
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Ancestorii was built for families who want more than storage.
            It’s a private, digital space designed to preserve memories with
            intention — timelines, albums, voice recordings, and future messages.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            So one day, someone can understand not just what your life looked
            like — but who you were.
          </p>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 pb-28 text-center">
          <h2 className="text-3xl font-serif mb-6">
            Start preserving your family history
          </h2>

          <p className="text-lg text-[#0F2040]/80 mb-8">
            Create a digital legacy for the people who come after you.
            Free to begin.
          </p>

          <a
            href="/signup"
            className="inline-block px-8 py-4 rounded-xl bg-[#0F2040] text-white text-lg hover:bg-[#152a52] transition"
          >
            Get started
          </a>
        </section>
      </main>

      <Footer />
    </>
  );
}
