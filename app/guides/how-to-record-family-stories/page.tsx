import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';
import Script from "next/script";

export const metadata: Metadata = {
  title: 'How to Record Family Stories and Voices | Ancestorii',
  description:
    'Learn how to record family stories and voices in a simple, meaningful way. Capture personal memories while life is happening and grow a living family collection over time.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/how-to-record-family-stories',
  },
};

export default function RecordFamilyStoriesPage() {
  return (
    <>
      {/* Article Schema */}
      <Script
        id="article-schema-record-stories"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "How to record family stories and voices",
          description:
            "A practical guide to recording family stories and voices while life is happening, helping you build a living family library over time.",
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
            "@id": "https://www.ancestorii.com/guides/how-to-record-family-stories"
          },
          datePublished: "2026-02-10",
          dateModified: "2026-02-10"
        })}
      </Script>

      {/* Breadcrumb Schema */}
      <Script
        id="breadcrumb-schema-record-stories"
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
              name: "How to Record Family Stories and Voices",
              item: "https://www.ancestorii.com/guides/how-to-record-family-stories"
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
                How to record
                <br />
                <span className="italic text-[#E5C45C]">family voices</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl leading-relaxed">
                A voice carries more than words.
                It carries tone, personality, humour, and presence.
                Capturing it while life is unfolding keeps that presence alive.
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
                But voices remind us who they are.
              </p>

              <p>
                The way someone laughs.
                The pauses between their words.
                The way they say your name.
                These details live in sound, not images.
              </p>

              <p>
                Recording a voice adds dimension to your family story.
                It makes memories feel present, not distant.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                Why we rarely think to record them
              </h2>

              <p>
                Conversations happen naturally.
                Voice messages feel temporary.
                Calls come and go throughout the week.
              </p>

              <p>
                Because voices feel ordinary in the moment,
                we assume they will always be there.
                We rarely think to capture them intentionally.
              </p>

              <p>
                But one short recording today can become something meaningful
                years from now.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                What makes a voice worth keeping
              </h2>

              <p>
                A recording does not need to be formal.
                It does not need a script.
                It does not need perfect sound quality.
              </p>

              <p>
                Often, the most powerful recordings are simple.
                A short story.
                A memory explained in their own words.
                A message meant for someone they love.
              </p>

              <p>
                What matters is not perfection.
                What matters is authenticity.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                A simple way to begin
              </h2>

              <p>
                Start with one person.
                Ask them to speak about a moment they enjoy returning to.
                Let them speak naturally, without overthinking it.
              </p>

              <p>
                Keep the recording private.
                Add a short description while the context is fresh.
                Place it somewhere designed to grow over time.
              </p>

              <p>
                Recording a voice does not require a perfect setup.
                It only requires deciding that this moment is worth keeping.
              </p>
            </section>
          </article>

           {/* SOFT CTA */}
            <section className="pt-12 sm:pt-20 text-center space-y-6">
              <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl mx-auto leading-relaxed">
                If someone comes to mind while reading this,
                consider capturing a short voice note this week.
                Small recordings, added consistently, become a powerful
                part of a living family library.
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