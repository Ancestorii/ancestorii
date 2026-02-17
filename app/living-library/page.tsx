import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What Is a Living Library? | A New Way to Preserve Family Stories",
  description:
    "Discover what a living library is and how it differs from simple digital storage. Learn how stories, voices, and memories can grow over time in one intentional space.",
  alternates: {
    canonical: "https://www.ancestorii.com/living-library",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LivingLibraryPage() {
  return (
    <>
      <Nav />

      <main className="bg-[#fff9ee] text-[#0F2040]">

        {/* HERO */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-16">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
            What Is a Living Library?
            <span className="block italic text-[#D4AF37]">
              A Space Where Family Stories Grow
            </span>
          </h1>

          <p className="max-w-3xl text-lg text-[#0F2040]/80">
            A living library is not a vault. It is not just storage.
            It is an intentional space where stories, voices, photos,
            and reflections connect over time.
          </p>
        </section>

        {/* IMAGE */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden">
            <Image
              src="/family5.jpg"
              alt="Family sharing stories together"
              fill
              className="object-cover"
              priority
            />
          </div>
        </section>

        {/* WHAT IS A LIVING LIBRARY */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            A living library explained
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            A living library is a private digital space designed to grow.
            Instead of locking memories away, it connects them.
            Stories link to people.
            Voices attach to moments.
            Photos gain context.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            Over time, it becomes a structured collection that feels
            natural to return to — not a folder you forget exists.
          </p>
        </section>

        {/* IMAGE */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden">
            <Image
              src="/album.jpg"
              alt="Family album with written stories"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* HOW IT DIFFERS */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            How a living library differs from digital storage
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Storage protects files.
            A living library preserves meaning.
          </p>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Cloud drives hold data.
            Social media organises attention.
            A living library organises connection.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            It is structured around people and relationships —
            not just folders.
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

        {/* WHY IT MATTERS */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            Why it matters
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Small details disappear first.
            The tone of someone’s voice.
            The explanation behind a photograph.
            The reason a moment mattered.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            A living library makes it easier to capture those details
            while they are still fresh.
            Not out of fear.
            But out of care.
          </p>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 pb-28 text-center">
          <h2 className="text-3xl font-serif mb-6">
            Begin your family’s living library
          </h2>

          <p className="text-lg text-[#0F2040]/80 mb-8">
            Add one memory today.
            Let it grow naturally over time.
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
