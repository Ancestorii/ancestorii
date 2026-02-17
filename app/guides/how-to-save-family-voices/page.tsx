import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';
import Script from "next/script";

export const metadata: Metadata = {
  title: 'How to Capture and Keep Family Voices | Ancestorii',
  description:
    'A practical guide to capturing family voices and recordings while life is happening. Learn simple ways to record tone, personality, and presence as part of a growing family library.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/how-to-save-family-voices',
  },
};

export default function SaveFamilyVoicesPage() {
  return (
    <>
      {/* Article Schema */}
      <Script
        id="article-schema-voices"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "How to capture family voices",
          description:
            "A practical guide to capturing and preserving family voices so tone, personality, and presence become part of a living family library.",
          author: {
            "@type": "Organization",
            name: "Ancestorii"
          },
          publisher: {
            "@type": "Organization",
            name: "Ancestorii",
            logo: {
              "@type": "ImageObject",
              url: "https://www.ancestorii.com/logo1.png"
            }
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://www.ancestorii.com/guides/how-to-save-family-voices"
          },
          datePublished: "2026-02-10",
          dateModified: "2026-02-10"
        })}
      </Script>

      {/* Breadcrumb Schema */}
      <Script
        id="breadcrumb-schema-voices"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://www.ancestorii.com/"
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Guides",
              item: "https://www.ancestorii.com/guides"
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "How to Capture and Keep Family Voices",
              item: "https://www.ancestorii.com/guides/how-to-save-family-voices"
            }
          ]
        })}
      </Script>

      <main className="bg-[#FFFDF6] text-[#0F2040]">
        <Nav />

        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(212,175,55,0.08),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(212,175,55,0.05),transparent_60%)]" />

          <div className="relative max-w-screen-md mx-auto px-6 pt-16 pb-24 space-y-16">

            {/* INTRO */}
            <header className="space-y-6">
              <p className="text-sm tracking-[0.25em] uppercase text-[#8F7A2A]">
                Guide
              </p>

              <h1 className="text-[2.6rem] sm:text-[3.2rem] font-semibold leading-tight">
                How to capture
                <br />
                <span className="italic text-[#E5C45C]">family voices</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl leading-relaxed">
                A voice carries more than words.
                It carries tone, humour, rhythm, and personality.
                Recording it adds depth to your family story.
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
                Voices remind us how they sound when they laugh,
                explain something,
                or tell a story in their own way.
              </p>

              <p>
                It is often the small vocal details that make a memory feel
                vivid and personal.
              </p>

              <p>
                Capturing a voice keeps personality attached to the story.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                Why we rarely record them
              </h2>

              <p>
                Conversations happen naturally.
                Voice notes feel temporary.
                Messages are sent and forgotten.
              </p>

              <p>
                Because voices feel present in everyday life,
                we assume they do not need to be captured intentionally.
              </p>

              <p>
                But a short recording today can become part of a collection
                your family returns to again and again.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                What makes a voice meaningful to keep
              </h2>

              <p>
                A recording does not need to be formal.
                It does not need a script.
                It does not need studio quality.
              </p>

              <p>
                Often, the most powerful recordings are simple.
                A short story.
                A reflection on a life lesson.
                An explanation of why something mattered.
              </p>

              <p>
                What gives a voice meaning is context and authenticity.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                A simple way to begin
              </h2>

              <p>
                Choose one person.
                Ask them to speak about a memory they enjoy revisiting.
                Let them talk naturally, without overthinking it.
              </p>

              <p>
                Add a short description while the moment is fresh.
                Place it somewhere private and structured,
                so it becomes part of a growing family collection.
              </p>

              <p>
                Capturing a voice does not require perfect timing.
                It only requires deciding that this moment is worth adding.
              </p>
            </section>
          </article>

          {/* SOFT CTA */}
          <section className="pt-12 sm:pt-20 text-center space-y-6">
            <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl mx-auto leading-relaxed">
              If someone comes to mind while reading this,
              consider recording a short voice note this week.
              Small contributions, added consistently,
              grow into a living family library over time.
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
    </>
  );
}