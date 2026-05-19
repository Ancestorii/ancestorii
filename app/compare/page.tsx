import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title:
    "Ancestorii vs StoryWorth vs Remento: Which Family Memory Platform Is Right for You?",
  description:
    "An honest comparison of Ancestorii, StoryWorth, and Remento. See how a living family library with printed Memory Books compares to prompt-based book services — and decide which approach fits your family.",
  alternates: {
    canonical: "https://www.ancestorii.com/compare",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Ancestorii vs StoryWorth vs Remento | Honest Comparison",
    description:
      "Compare the three leading family memory platforms side by side. Digital library, printed books, voice recordings — see which one fits your family.",
    url: "https://www.ancestorii.com/compare",
    siteName: "Ancestorii",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ancestorii vs StoryWorth vs Remento comparison",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ancestorii vs StoryWorth vs Remento",
    description:
      "An honest comparison of the three leading family memory platforms.",
    images: ["/og-image.jpg"],
  },
};

export default function ComparePage() {
  return (
    <>
      {/* WebPage Schema */}
      <Script
        id="compare-webpage-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Ancestorii vs StoryWorth vs Remento",
          description:
            "An honest, side-by-side comparison of Ancestorii, StoryWorth, and Remento — three different approaches to preserving family stories.",
          url: "https://www.ancestorii.com/compare",
          isPartOf: {
            "@type": "WebSite",
            name: "Ancestorii",
          },
        })}
      </Script>

      {/* FAQ Schema */}
      <Script
        id="compare-faq-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is the difference between Ancestorii and StoryWorth?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "StoryWorth sends weekly email prompts to one storyteller, who writes responses over a year. Those responses are compiled into a printed book. Ancestorii is a living digital library where families build timelines, albums, voice recordings, and stories over time — and can also design and print custom hardcover Memory Books with full creative control over every page.",
              },
            },
            {
              "@type": "Question",
              name: "What is the difference between Ancestorii and Remento?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Remento focuses on voice and video recordings. A storyteller records spoken responses to prompts, and AI transcribes them into written stories compiled into a book with QR codes. Ancestorii combines a persistent digital library — timelines, albums, voice capsules, and written stories — with printed Memory Books that you design page by page.",
              },
            },
            {
              "@type": "Question",
              name: "Which platform gives the most creative control over the book?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Ancestorii. Both StoryWorth and Remento compile books automatically from your responses. Ancestorii gives you a visual page editor where you arrange photos, text, and layouts yourself — so the finished book looks exactly the way you want it to.",
              },
            },
            {
              "@type": "Question",
              name: "Do StoryWorth or Remento offer a digital library?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. Both platforms are focused on producing a single printed book. Once the book is made, the digital experience ends. Ancestorii is a living library that continues to grow after a book is printed — timelines, albums, and voice recordings remain accessible and can be added to indefinitely.",
              },
            },
            {
              "@type": "Question",
              name: "Which platform is best for preserving family history long term?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Ancestorii is designed for long-term family preservation. The digital library grows over time and is not tied to a single book project. StoryWorth and Remento are built around producing one book per subscription year, which makes them better suited for a single storytelling project rather than ongoing family history.",
              },
            },
            {
              "@type": "Question",
              name: "Is Ancestorii a good StoryWorth alternative in the UK?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Ancestorii is built in the UK and ships Memory Books worldwide with free delivery. StoryWorth is US-based, charges in dollars, and uses American-focused prompts. Ancestorii does not use a prompt-based system — families write, record, and design freely at their own pace.",
              },
            },
          ],
        })}
      </Script>

      <Nav />

      <main className="bg-[#fff9ee] text-[#0F2040]">
        {/* HERO */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-16">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
            Ancestorii vs StoryWorth vs Remento:
            <span className="block italic text-[#D4AF37]">
              Three Approaches to Preserving Family Stories
            </span>
          </h1>

          <p className="max-w-3xl text-lg text-[#0F2040]/80">
            All three platforms help families preserve memories. But they do it
            in fundamentally different ways. This page breaks down what each
            one offers, where each one is strongest, and which approach fits
            different families — so you can make the right choice.
          </p>
        </section>

        {/* THE THREE APPROACHES */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            Three platforms, three different ideas
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            StoryWorth sends one email prompt per week to a single storyteller.
            They write a response, and after a year those responses are compiled
            into a printed book. The process is simple, structured, and works
            well for people who enjoy writing to a schedule. StoryWorth has
            printed over a million books since 2013 — they pioneered this space
            and deserve credit for it.
          </p>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Remento takes a different angle. Instead of writing, the storyteller
            records voice or video responses to prompts. Remento's AI
            transcribes the recordings into polished written stories, and the
            result is a printed book with QR codes that link back to the
            original recordings. For families where the storyteller won't type
            but will talk, Remento solves a real problem.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            Ancestorii is built around a different idea entirely. It is a living
            digital library — a private space where families build timelines,
            albums, voice recordings, and written stories that grow over time.
            It is not built around a single storyteller or a single year. And
            when a family is ready, they can design and print a hardcover
            Memory Book with full creative control over every page. The book
            is one output from the library. The library keeps growing after the
            book ships.
          </p>
        </section>

        {/* COMPARISON TABLE */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-8">
            Side-by-side comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[15px]">
              <thead>
                <tr className="border-b-2 border-[#0F2040]/20">
                  <th className="py-4 pr-4 font-serif text-lg w-[30%]">Feature</th>
                  <th className="py-4 px-4 font-serif text-lg">Ancestorii</th>
                  <th className="py-4 px-4 font-serif text-lg">StoryWorth</th>
                  <th className="py-4 pl-4 font-serif text-lg">Remento</th>
                </tr>
              </thead>
              <tbody className="text-[#0F2040]/85">
                <tr className="border-b border-[#0F2040]/10">
                  <td className="py-4 pr-4 font-medium">Core concept</td>
                  <td className="py-4 px-4">Living digital library + printed books</td>
                  <td className="py-4 px-4">Weekly email prompts → printed book</td>
                  <td className="py-4 pl-4">Voice/video recordings → AI-written book</td>
                </tr>
                <tr className="border-b border-[#0F2040]/10">
                  <td className="py-4 pr-4 font-medium">Digital library</td>
                  <td className="py-4 px-4">Yes — timelines, albums, voice capsules, profiles</td>
                  <td className="py-4 px-4">No</td>
                  <td className="py-4 pl-4">No</td>
                </tr>
                <tr className="border-b border-[#0F2040]/10">
                  <td className="py-4 pr-4 font-medium">Printed book</td>
                  <td className="py-4 px-4">Yes — custom designed, hardcover</td>
                  <td className="py-4 px-4">Yes — auto-compiled, hardcover</td>
                  <td className="py-4 pl-4">Yes — auto-compiled, hardcover</td>
                </tr>
                <tr className="border-b border-[#0F2040]/10">
                  <td className="py-4 pr-4 font-medium">Book design control</td>
                  <td className="py-4 px-4">Full — visual page editor</td>
                  <td className="py-4 px-4">Minimal — choose cover, reorder chapters</td>
                  <td className="py-4 pl-4">Minimal — choose cover, reorder stories</td>
                </tr>
                <tr className="border-b border-[#0F2040]/10">
                  <td className="py-4 pr-4 font-medium">Voice recordings</td>
                  <td className="py-4 px-4">Yes — voice capsules stored in library</td>
                  <td className="py-4 px-4">Yes — phone recording, transcribed</td>
                  <td className="py-4 pl-4">Yes — video/audio, AI transcribed</td>
                </tr>
                <tr className="border-b border-[#0F2040]/10">
                  <td className="py-4 pr-4 font-medium">Timelines</td>
                  <td className="py-4 px-4">Yes</td>
                  <td className="py-4 px-4">No</td>
                  <td className="py-4 pl-4">No</td>
                </tr>
                <tr className="border-b border-[#0F2040]/10">
                  <td className="py-4 pr-4 font-medium">Photo albums</td>
                  <td className="py-4 px-4">Yes — with captions and context</td>
                  <td className="py-4 px-4">Photos attached to stories only</td>
                  <td className="py-4 pl-4">Photos attached to stories only</td>
                </tr>
                <tr className="border-b border-[#0F2040]/10">
                  <td className="py-4 pr-4 font-medium">Storyteller model</td>
                  <td className="py-4 px-4">Anyone in the family, no limit</td>
                  <td className="py-4 px-4">One storyteller per subscription</td>
                  <td className="py-4 pl-4">One storyteller per subscription</td>
                </tr>
                <tr className="border-b border-[#0F2040]/10">
                  <td className="py-4 pr-4 font-medium">Prompt system</td>
                  <td className="py-4 px-4">No prompts — write and record freely</td>
                  <td className="py-4 px-4">Weekly email prompts, 500+ library</td>
                  <td className="py-4 pl-4">Weekly prompts via email or text</td>
                </tr>
                <tr className="border-b border-[#0F2040]/10">
                  <td className="py-4 pr-4 font-medium">Continues after the book</td>
                  <td className="py-4 px-4">Yes — library keeps growing</td>
                  <td className="py-4 px-4">No — project ends with book</td>
                  <td className="py-4 pl-4">No — project ends with book</td>
                </tr>
                <tr className="border-b border-[#0F2040]/10">
                  <td className="py-4 pr-4 font-medium">Worldwide shipping</td>
                  <td className="py-4 px-4">Free worldwide delivery</td>
                  <td className="py-4 px-4">Free US, international extra</td>
                  <td className="py-4 pl-4">Free US, international extra</td>
                </tr>
                <tr className="border-b border-[#0F2040]/10">
                  <td className="py-4 pr-4 font-medium">Built in</td>
                  <td className="py-4 px-4">United Kingdom</td>
                  <td className="py-4 px-4">United States</td>
                  <td className="py-4 pl-4">United States</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* WHAT STORYWORTH DOES WELL */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            What StoryWorth does well
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            StoryWorth's strength is simplicity. A weekly email arrives,
            the storyteller replies, and the book builds itself over twelve
            months. There is no app to learn, no interface to navigate, and no
            decisions to make about design. For a grandparent who checks email
            but wouldn't download an app, that frictionless experience is
            genuinely valuable.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            Their question library is thoughtful, and the set-and-forget cadence
            keeps the storyteller engaged without overwhelming them. If your
            goal is to get one person's life story into a single book with
            minimal effort, StoryWorth is a proven option.
          </p>
        </section>

        {/* WHAT REMENTO DOES WELL */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            What Remento does well
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Remento removes the writing barrier completely. The storyteller
            speaks, and AI turns their words into a polished written narrative.
            For families where the person with the stories won't sit down and
            type — whether because of age, health, or preference — Remento
            solves a problem the others don't.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            The QR codes in the printed book are a clever touch. Scanning a
            page plays the original voice recording, which means the book
            preserves tone and personality alongside the written story. The
            founder built Remento after his mother was diagnosed with cancer,
            and that personal motivation shows in the product.
          </p>
        </section>

        {/* WHERE ANCESTORII IS DIFFERENT */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            Where Ancestorii is different
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            StoryWorth and Remento are book services. They start with a
            subscription and end with a printed book. The digital content
            exists to serve the book — and once the book is made, the project
            is over.
          </p>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Ancestorii starts from a different place. The core of the platform
            is a living digital library — a private space where a family's
            stories, photos, timelines, albums, and voice recordings are
            captured and organised over time. Not for a year. Not for one
            person. For the whole family, for as long as the family grows.
          </p>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Memory Books are built from that library. When a family wants a
            physical book, they design it page by page using a visual editor —
            choosing which stories and photos to include, arranging the layout,
            and controlling exactly how the finished book looks and feels.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            After the book ships, the library keeps growing. New stories are
            added. New voice recordings are captured. New chapters of a family's
            life unfold. And when the time is right, another book can be made
            from the new material. The library is the foundation. The book is
            one moment in time, pulled from it.
          </p>
        </section>

        {/* WHO EACH PLATFORM IS FOR */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            Who each platform is best for
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            <strong className="text-[#0F2040]">Choose StoryWorth</strong> if
            you want to gift a single storyteller a structured writing
            experience that ends with a book. It works best when the
            storyteller enjoys writing, is comfortable with email, and you want
            a hands-off process with minimal decisions.
          </p>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            <strong className="text-[#0F2040]">Choose Remento</strong> if
            the storyteller prefers speaking over writing. It works best when
            you want voice or video recordings preserved alongside a printed
            book, and you value AI handling the writing for you.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            <strong className="text-[#0F2040]">Choose Ancestorii</strong> if
            you want more than a book. If you want a private digital space
            where your entire family's history lives and grows — timelines,
            albums, voice recordings, written stories — and the ability to
            print beautiful hardcover books from that library whenever you are
            ready. If you want creative control over how your book looks. And
            if you want something that doesn't end after one year or one
            project.
          </p>
        </section>

        {/* COMMON QUESTIONS */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-10">
            Common questions
          </h2>

          <div className="space-y-10">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                What is the difference between Ancestorii and StoryWorth?
              </h3>
              <p className="text-[#0F2040]/85">
                StoryWorth is a prompt-based book service — one storyteller
                writes responses to weekly emails for a year, and those
                responses become a book. Ancestorii is a living digital library
                where families capture stories, photos, timelines, and voice
                recordings over time — and can print custom-designed hardcover
                Memory Books whenever they are ready.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                What is the difference between Ancestorii and Remento?
              </h3>
              <p className="text-[#0F2040]/85">
                Remento captures voice and video recordings and uses AI to
                transcribe them into written stories for a printed book.
                Ancestorii combines a persistent digital library with printed
                Memory Books — and gives you full creative control over every
                page of the book rather than auto-generating it.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Which platform gives the most creative control over the book?
              </h3>
              <p className="text-[#0F2040]/85">
                Ancestorii. Both StoryWorth and Remento auto-compile books from
                your content. Ancestorii gives you a visual page editor where
                you arrange photos, text, and layouts yourself — so the
                finished book looks exactly the way you want it to.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Do StoryWorth or Remento offer a digital library?
              </h3>
              <p className="text-[#0F2040]/85">
                No. Both are focused on producing a printed book. Once the book
                is made, the digital experience ends. Ancestorii's library
                continues to grow indefinitely — timelines, albums, and voice
                recordings remain accessible and can be added to at any time.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Is Ancestorii a good StoryWorth alternative in the UK?
              </h3>
              <p className="text-[#0F2040]/85">
                Yes. Ancestorii is built in the UK and ships Memory Books
                worldwide with free delivery. StoryWorth is US-based, charges
                in dollars, and its prompts have an American focus. Ancestorii
                does not use a prompt system — families write, record, and
                design freely at their own pace.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Can I use Ancestorii just for the digital library without
                printing a book?
              </h3>
              <p className="text-[#0F2040]/85">
                Absolutely. The digital library is the core of Ancestorii.
                Memory Books are optional — many families use Ancestorii purely
                as a private space to capture and organise their stories,
                timelines, and voice recordings without ever printing a book.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 pb-28 text-center">
          <h2 className="text-3xl font-serif mb-6">
            Start building your family's living library
          </h2>

          <p className="text-lg text-[#0F2040]/80 mb-8">
            A digital library that grows with your family.
            Printed books whenever you are ready. Free to begin.
          </p>

          <a
            href="/signup"
            className="inline-block px-8 py-4 rounded-xl bg-[#0F2040] text-white text-lg hover:bg-[#152a52] transition"
          >
            Get started free
          </a>
        </section>
      </main>

      <Footer />
    </>
  );
}