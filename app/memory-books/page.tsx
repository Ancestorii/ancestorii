import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Image from "next/image";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Memory Books: Turn Your Family Stories Into a Printed Hardcover",
  description:
    "Design and print a custom hardcover Memory Book filled with your family's stories, photos, and voices. Full creative control — no templates, no generic layouts. Built to last generations.",
  alternates: {
    canonical: "https://www.ancestorii.com/memory-books",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Memory Books | Ancestorii",
    description:
      "Turn your family's stories and photos into a beautifully printed hardcover book you design yourself.",
    url: "https://www.ancestorii.com/memory-books",
    siteName: "Ancestorii",
    images: [
      {
        url: "/og-memory-books.jpg",
        width: 1200,
        height: 630,
        alt: "Ancestorii Memory Books — custom printed family story books",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memory Books | Ancestorii",
    description:
      "Design and print a hardcover book of your family's stories, photos, and memories.",
    images: ["/og-memory-books.jpg"],
  },
};

export default function MemoryBooksPage() {
  return (
    <>
      {/* WebPage Schema */}
      <Script
        id="memory-books-webpage-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Memory Books | Ancestorii",
          description:
            "Design and print a custom hardcover Memory Book filled with your family's stories, photos, and voices — with full creative control over every page.",
          url: "https://www.ancestorii.com/memory-books",
          isPartOf: {
            "@type": "WebSite",
            name: "Ancestorii",
          },
        })}
      </Script>

      {/* Product Schema */}
      <Script
        id="memory-books-product-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Ancestorii Memory Book",
          description:
            "A custom-designed, professionally printed hardcover book containing your family's stories, photos, and memories. Designed page-by-page using a visual editor with full creative control.",
          brand: {
            "@type": "Brand",
            name: "Ancestorii",
          },
          url: "https://www.ancestorii.com/memory-books",
          category: "Books > Custom & Personalised Books",
          offers: {
            "@type": "Offer",
            priceCurrency: "GBP",
            availability: "https://schema.org/InStock",
            url: "https://www.ancestorii.com/memory-books",
          },
        })}
      </Script>

      {/* FAQ Schema */}
      <Script
        id="memory-books-faq-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is an Ancestorii Memory Book?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "A Memory Book is a professionally printed hardcover book containing your family's stories, photos, and memories. You design every page using a visual editor — no rigid templates or generic layouts.",
              },
            },
            {
              "@type": "Question",
              name: "How is this different from a regular photo book?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Photo books display images. Memory Books preserve stories. Each page can combine photographs with written context, personal reflections, and the meaning behind a moment — not just the image itself.",
              },
            },
            {
              "@type": "Question",
              name: "Do I need design experience?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. The visual editor is built so anyone can arrange pages naturally. Drag photos, add text, adjust layouts — the design stays clean without needing professional skills.",
              },
            },
            {
              "@type": "Question",
              name: "How are Memory Books printed and delivered?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Memory Books are professionally printed as hardcover books and shipped directly to your door. Print quality is handled by a specialist fulfilment partner to ensure every book feels like a keepsake.",
              },
            },
            {
              "@type": "Question",
              name: "Can I order multiple copies?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Once your Memory Book is designed, you can order as many copies as you need — perfect for sharing with family members or giving as gifts.",
              },
            },
            {
              "@type": "Question",
              name: "What makes this different from StoryWorth or other memory book services?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Most services use a question-and-answer template to generate a book automatically. Ancestorii gives you full creative control over every page. You decide the layout, the stories, the photos, and the structure — your book looks exactly the way you want it to.",
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
            Memory Books:
            <span className="block italic text-[#D4AF37]">
              Your Family's Stories, Printed and Preserved
            </span>
          </h1>

          <p className="max-w-3xl text-lg text-[#0F2040]/80">
            Design a hardcover book filled with your family's stories, photos,
            and memories — page by page, in your own words. No templates. No
            generic layouts. A book that looks and feels exactly the way you
            want it to.
          </p>
        </section>

        {/* BOOK IMAGE */}
        <section className="max-w-6xl mx-auto px-6 mb-20">
          <div className="relative w-full rounded-2xl overflow-hidden">
            <Image
  src="/book-preview.png"
  alt="Ancestorii Memory Book — a custom printed hardcover family story book"
  width={1200}
  height={800}
  className="w-full h-auto"
  priority
/>
          </div>
        </section>

        {/* WHAT IS A MEMORY BOOK */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            What is a Memory Book?
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            A Memory Book is a professionally printed hardcover book containing
            your family's stories, photographs, and reflections. Every page is
            designed by you using a visual editor — so the finished book feels
            personal, not mass-produced.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            It is not a photo album. It is not a scrapbook. It is a designed,
            intentional collection of the moments and stories that matter most
            to your family — printed and bound to last.
          </p>
        </section>

        {/* WHY NOT JUST A PHOTO BOOK */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            Why a Memory Book instead of a photo book?
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            A photograph captures a moment. But it rarely explains why that
            moment mattered. Who was there. What was said. What it meant to
            the people in the frame.
          </p>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Memory Books combine photographs with written stories, personal
            reflections, and the context that turns an image into something
            meaningful decades from now.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            The result is a book your family can open in ten, twenty, or fifty
            years and still understand the life behind every page.
          </p>
        </section>

        {/* FULL CREATIVE CONTROL */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            Full creative control over every page
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Most memory book services use rigid question-and-answer templates
            or auto-generated layouts. Ancestorii works differently. You design
            each page yourself using a visual editor — arranging photos, adding
            text, choosing layouts, and deciding exactly what goes where.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            Your book reflects your family's story the way you want to tell it
            — not the way a template decides for you.
          </p>

          <p className="text-lg text-[#0F2040]/85 mt-6">
            See how Ancestorii compares to other family memory book services like{" "}
            <a href="/compare" className="underline underline-offset-2 hover:text-[#D4AF37] transition">
              StoryWorth and Remento
            </a>.
          </p>
        </section>

        {/* HOW IT WORKS */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            How it works
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Start by creating a new Memory Book inside your Ancestorii library.
            Add pages, arrange your photos and stories using the visual editor,
            and preview everything before you order.
          </p>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            When you are ready, place your order and receive a professionally
            printed hardcover book delivered to your door. Every book is printed
            on quality stock and bound to feel like a keepsake — not a novelty.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            Order as many copies as you need. One for yourself, one for your
            parents, one for a sibling. The same book, shared across the people
            who matter.
          </p>
        </section>

        {/* A GIFT THAT MEANS SOMETHING */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-6">
            A gift that means something
          </h2>

          <p className="text-lg text-[#0F2040]/85 mb-6">
            Most gifts get forgotten. A Memory Book does not. It is a printed
            collection of real family stories, designed by someone who lived
            them — handed to someone who needs to hold them.
          </p>

          <p className="text-lg text-[#0F2040]/85">
            For a birthday, an anniversary, Father's Day, Mother's Day, or
            simply because the stories deserve to exist somewhere other than
            your phone.
          </p>
        </section>

        {/* COMMON QUESTIONS */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <h2 className="text-3xl font-serif mb-10">
            Common questions about Memory Books
          </h2>

          <div className="space-y-10">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                How is this different from a regular photo book?
              </h3>
              <p className="text-[#0F2040]/85">
                Photo books display images. Memory Books preserve stories. Each
                page can combine photographs with written context, personal
                reflections, and the meaning behind a moment — not just the
                image itself.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Do I need design experience?
              </h3>
              <p className="text-[#0F2040]/85">
                No. The visual editor is built so anyone can arrange pages
                naturally. Drag photos, add text, adjust layouts — the design
                stays clean without needing professional skills.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                How are Memory Books printed and delivered?
              </h3>
              <p className="text-[#0F2040]/85">
                Memory Books are professionally printed as hardcover books and
                shipped directly to your door. Print quality is handled by a
                specialist fulfilment partner to ensure every book feels like a
                keepsake.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Can I order multiple copies?
              </h3>
              <p className="text-[#0F2040]/85">
                Yes. Once your book is designed, order as many copies as you
                need — for family members, as gifts, or to keep for different
                branches of your family.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                What makes this different from StoryWorth or other services?
              </h3>
              <p className="text-[#0F2040]/85">
                Most services use a question-and-answer format to auto-generate
                a book from responses. Ancestorii gives you full creative
                control. You decide the layout, the stories, the photos, and
                the structure — your book looks exactly the way you want it to.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">
                Is a Memory Book a good gift?
              </h3>
              <p className="text-[#0F2040]/85">
                It is one of the most personal gifts you can give. A printed
                collection of family stories, designed by someone who was there
                — for a birthday, anniversary, Father's Day, Mother's Day, or
                simply because the stories deserve to exist on a shelf.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 pb-28 text-center">
          <h2 className="text-3xl font-serif mb-6">
            Start designing your family's Memory Book
          </h2>

          <p className="text-lg text-[#0F2040]/80 mb-8">
            Your stories deserve more than a phone screen.
            Turn them into something your family can hold.
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