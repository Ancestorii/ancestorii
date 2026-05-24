import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import MemoryBooksContent from '@/components/MemoryBookSection';
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
  robots: { index: true, follow: true },
  openGraph: {
    title: "Memory Books | Ancestorii",
    description: "Turn your family's stories and photos into a beautifully printed hardcover book you design yourself.",
    url: "https://www.ancestorii.com/memory-books",
    siteName: "Ancestorii",
    images: [{ url: "/og-memory-books.jpg", width: 1200, height: 630, alt: "Ancestorii Memory Books" }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memory Books | Ancestorii",
    description: "Design and print a hardcover book of your family's stories, photos, and memories.",
    images: ["/og-memory-books.jpg"],
  },
};

export default function MemoryBooksPage() {
  return (
    <>
      <Script id="memory-books-webpage-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org", "@type": "WebPage",
          name: "Memory Books | Ancestorii",
          description: "Design and print a custom hardcover Memory Book filled with your family's stories, photos, and voices — with full creative control over every page.",
          url: "https://www.ancestorii.com/memory-books",
          isPartOf: { "@type": "WebSite", name: "Ancestorii" },
        })}
      </Script>
      <Script id="memory-books-product-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org", "@type": "Product",
          name: "Ancestorii Memory Book",
          description: "A custom-designed, professionally printed hardcover book containing your family's stories, photos, and memories.",
          brand: { "@type": "Brand", name: "Ancestorii" },
          url: "https://www.ancestorii.com/memory-books",
          category: "Books > Custom & Personalised Books",
          offers: { "@type": "Offer", priceCurrency: "GBP", availability: "https://schema.org/InStock", url: "https://www.ancestorii.com/memory-books" },
        })}
      </Script>
      <Script id="memory-books-faq-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org", "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "What is an Ancestorii Memory Book?", acceptedAnswer: { "@type": "Answer", text: "A Memory Book is a professionally printed hardcover book containing your family's stories, photos, and memories. You design every page using a visual editor — no rigid templates or generic layouts." } },
            { "@type": "Question", name: "How is this different from a regular photo book?", acceptedAnswer: { "@type": "Answer", text: "Photo books display images. Memory Books preserve stories. Each page can combine photographs with written context, personal reflections, and the meaning behind a moment." } },
            { "@type": "Question", name: "Do I need design experience?", acceptedAnswer: { "@type": "Answer", text: "No. The visual editor is built so anyone can arrange pages naturally. Drag photos, add text, adjust layouts — the design stays clean without needing professional skills." } },
            { "@type": "Question", name: "How are Memory Books printed and delivered?", acceptedAnswer: { "@type": "Answer", text: "Memory Books are professionally printed as hardcover books and shipped directly to your door." } },
            { "@type": "Question", name: "Can I order multiple copies?", acceptedAnswer: { "@type": "Answer", text: "Yes. Once your Memory Book is designed, you can order as many copies as you need." } },
            { "@type": "Question", name: "What makes this different from StoryWorth or other services?", acceptedAnswer: { "@type": "Answer", text: "Most services use a question-and-answer template. Ancestorii gives you full creative control over every page." } },
          ],
        })}
      </Script>

      <main className="bg-[#FFFDF8]">
        <PublicNav />
        <MemoryBooksContent />
        <PublicFooter />
      </main>
    </>
  );
}