import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Legacy: Capture and Grow Your Family Story Digitally",
  description:
    "Discover how to build a living digital legacy by capturing family stories, voices, and everyday moments as they happen — and growing a library your family can return to.",
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
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-16">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
            Digital Legacy:
            <span className="block italic text-[#D4AF37]">
              Build a Living Family Library
            </span>
          </h1>

          <p className="max-w-3xl text-lg text-[#0F2040]/80">
            A digital legacy is not just something you leave behind. It’s
            something you grow while life is happening — one story, one voice
            note, one small memory at a time.
          </p>
        </section>

        {/* IMAGE */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden">
            <Image
              src="/family4.jpg"
              alt="Family sharing stories across generations"
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
            A digital legacy is the growing collection of stories, photos,
            videos, reflections, and voices that shape a family’s identity.
            It’s not just about storing files — it’s about capturing meaning.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            Instead of scattered folders and forgotten albums, a digital
            legacy brings memories together in one intentional space — organised,
            revisited, and expanded over time.
          </p>
        </section>

        {/* IMAGE */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden">
            <Image
              src="/album.jpg"
              alt="Family photos and handwritten stories"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* WHY FAMILY HISTORY MATTERS */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            Why building your family story matters
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Life moves quickly. Small details disappear. A phrase someone said.
            A lesson learned. A memory that felt ordinary at the time.
          </p>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Capturing your family history digitally allows you to hold onto
            those moments while they are still fresh — in your own words, with
            your own voice.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            It’s not about preparing for absence. It’s about strengthening
            connection.
          </p>
        </section>

        {/* IMAGE */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden">
            <Image
              src="/family6.jpg"
              alt="Listening to a recorded family story together"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* COMMON QUESTIONS */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-10">
            Common questions about building a digital family legacy
          </h2>

          <div className="space-y-10">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                How can I build my family history digitally?
              </h3>
              <p className="text-[#0F2040]/85">
                Start small. Add one meaningful photo. Record a short voice
                note. Write a memory in a few sentences. Over time, those small
                contributions become chapters in a growing collection.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Are cloud storage and social media enough?
              </h3>
              <p className="text-[#0F2040]/85">
                Cloud drives store files, but they don’t organise your story.
                Social platforms prioritise feeds, not family history. Neither
                is designed to grow a connected, intentional collection over
                time.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                What types of memories should I capture?
              </h3>
              <p className="text-[#0F2040]/85">
                Photos are powerful — but so are voice notes, reflections,
                lessons, and personal stories. Often it’s the explanation behind
                a moment that gives it lasting value.
              </p>
            </div>
          </div>
        </section>

        {/* HOW ANCESTORII FITS */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden mb-10">
            <Image
              src="/family7.jpg"
              alt="Family building a shared digital memory library"
              fill
              className="object-cover"
            />
          </div>

          <h2 className="text-3xl font-serif mb-6">
            A private living library for your family
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Ancestorii is designed as a living family library — a private
            digital space where stories, albums, timelines, and voice
            recordings can be added over time.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            It feels light to contribute to, easy to return to, and always
            belongs entirely to your family.
          </p>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 pb-28 text-center">
          <h2 className="text-3xl font-serif mb-6">
            Start building your family’s living library
          </h2>

          <p className="text-lg text-[#0F2040]/80 mb-8">
            Add one memory today. Let it grow naturally over time.
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
