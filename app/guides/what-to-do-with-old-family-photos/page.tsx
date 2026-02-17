import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Script from "next/script";

export default function OldFamilyPhotosPage() {
  return (
    <>
      {/* Article Schema */}
      <Script
        id="article-schema-old-photos"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": "https://www.ancestorii.com/guides/what-to-do-with-old-family-photos",
          headline: "What to do with old family photos",
          description:
            "A practical guide on how to preserve old family photos by adding context, stories, and meaning so each image becomes part of a living family library.",
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
            "@id": "https://www.ancestorii.com/guides/what-to-do-with-old-family-photos"
          },
          datePublished: "2026-02-10",
          dateModified: "2026-02-10"
        })}
      </Script>

      {/* Breadcrumb Schema */}
      <Script
        id="breadcrumb-schema-old-photos"
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
              name: "What to do with old family photos",
              item: "https://www.ancestorii.com/guides/what-to-do-with-old-family-photos"
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
                What to do with
                <br />
                <span className="italic text-[#E5C45C]">old family photos</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl leading-relaxed">
                Photos can last for decades.
                What makes them meaningful is the story around them.
                Names, places, emotions, and the reason the moment mattered.
              </p>
            </header>

          {/* CONTENT */}
          <article className="space-y-12 text-[1.05rem] sm:text-[1.15rem] leading-relaxed text-[#0F2040]/75">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                Start by bringing them together
              </h2>

              <p>
                The first step is simple.
                Gather your photos into one intentional place.
                Loose prints in drawers, boxes, or lofts often become
                disconnected from the rest of the family story.
              </p>

              <p>
                You do not need to organise everything perfectly at once.
                You only need to stop the slow drift of memories becoming scattered.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                Add context while it is still close
              </h2>

              <p>
                A photo on its own shows a moment.
                Context turns it into a chapter.
              </p>

              <p>
                Add who is in the image.
                Where it was taken.
                What was happening in that season of life.
                Why you still return to it.
              </p>

              <p>
                Even a few sentences can transform an image into part of a growing collection.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                Ask the question that unlocks stories
              </h2>

              <p>
                If someone recognises the people in the photo, ask one simple question.
                What was happening here.
              </p>

              <p>
                That question often brings out details you would not think to ask for directly.
                How they felt.
                What changed around that time.
                Why that day stands out.
              </p>

              <p>
                It is the difference between owning an image and expanding your family library.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-[#0F2040]">
                A gentle way to begin
              </h2>

              <p>
                Choose five photos.
                Not necessarily the most perfect ones.
                The ones that make you pause.
              </p>

              <p>
                Add a sentence or two to each.
                Record a short voice note if possible.
                Keep them together in one structured, private place.
              </p>

              <p>
                A living family library grows through small additions.
                You do not need to organise everything.
                You only need to add one memory today.
              </p>
            </section>
          </article>

           {/* SOFT CTA */}
            <section className="pt-12 sm:pt-20 text-center space-y-6">
              <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl mx-auto leading-relaxed">
                If there is a photo you return to often,
                consider adding its story this week.
                A few sentences now can turn an image into a lasting chapter.
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