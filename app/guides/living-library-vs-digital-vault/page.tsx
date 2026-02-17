import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';
import Script from "next/script";

export const metadata: Metadata = {
  title: 'Living Library vs Digital Vault | What Preserves Family Memories Best?',
  description:
    'What is the difference between a digital vault and a living library? Discover why structure, context, and connection matter when preserving family memories.',
  alternates: {
    canonical: 'https://www.ancestorii.com/guides/living-library-vs-digital-vault',
  },
};

export default function LivingLibraryVsVaultPage() {
  return (
    <>
      {/* Article Schema */}
      <Script
        id="article-schema-living-library"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Living library vs digital vault",
          description:
            "Understanding the difference between storing memories and helping them grow. Why a living library preserves meaning better than a digital vault.",
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
            "@id": "https://www.ancestorii.com/guides/living-library-vs-digital-vault"
          },
          datePublished: "2026-02-17",
          dateModified: "2026-02-17"
        })}
      </Script>

      {/* Breadcrumb Schema */}
      <Script
        id="breadcrumb-schema-living-library"
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
              name: "Living Library vs Digital Vault",
              item: "https://www.ancestorii.com/guides/living-library-vs-digital-vault"
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
                Living library vs
                <br />
                <span className="italic text-[#E5C45C]">digital vault</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl leading-relaxed">
                Not all memory platforms are built the same.
                Some store files.
                Others help stories grow.
              </p>
            </header>

            {/* CONTENT */}
            <article className="space-y-12 text-[1.05rem] sm:text-[1.15rem] leading-relaxed text-[#0F2040]/75">

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-[#0F2040]">
                  What is a digital vault
                </h2>

                <p>
                  A digital vault is built for storage.
                  It protects files.
                  It locks information away safely.
                </p>

                <p>
                  Photos.
                  Documents.
                  Passwords.
                  Legal records.
                </p>

                <p>
                  Its purpose is security.
                  It is designed to hold.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-[#0F2040]">
                  Where vaults fall short
                </h2>

                <p>
                  When it comes to memories, storage alone is not enough.
                </p>

                <p>
                  A photo without context becomes an image.
                  A recording without explanation becomes a file.
                </p>

                <p>
                  Vaults preserve data.
                  They do not preserve meaning.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-[#0F2040]">
                  What makes a living library different
                </h2>

                <p>
                  A living library is not built just to hold.
                  It is built to connect.
                </p>

                <p>
                  Memories are organised by people.
                  By timelines.
                  By relationships.
                </p>

                <p>
                  Stories link to moments.
                  Voices attach to photos.
                  Context surrounds every memory.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-[#0F2040]">
                  Growth instead of storage
                </h2>

                <p>
                  A vault stays the same once filled.
                </p>

                <p>
                  A living library grows over time.
                  New stories are added.
                  Reflections evolve.
                  Generations contribute.
                </p>

                <p>
                  It becomes something active.
                  Not something hidden.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-[#0F2040]">
                  Choosing what fits your intention
                </h2>

                <p>
                  If your goal is protection, a vault may be enough.
                </p>

                <p>
                  If your goal is connection, growth, and meaning,
                  you need more than storage.
                </p>

                <p>
                  You need a structure that keeps stories alive.
                </p>
              </section>

            </article>

            {/* SOFT CTA */}
            <section className="pt-12 sm:pt-20 text-center space-y-6">
              <p className="text-lg sm:text-xl text-[#0F2040]/65 max-w-xl mx-auto leading-relaxed">
                A family story deserves more than a locked folder.
                It deserves a place where it can be understood,
                expanded,
                and passed forward.
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
                Build your living library
              </Link>
            </section>

          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
