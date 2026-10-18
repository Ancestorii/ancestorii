import SiteShell from '@/components/site/SiteShell';
import MemoryBooksContent from '@/components/MemoryBookSection';
import type { Metadata } from "next";
import JsonLd from '@/components/site/seo/JsonLd';
import { MEMORY_BOOK_FAQS } from '@/components/site/memory-books/faqs';

export const metadata: Metadata = {
  title: "Memory Books: Turn Your Family Stories Into a Printed Hardcover",
  description:
    "Design and print a custom hardcover Memory Book filled with your family's stories, photos, and voices. Full creative control. No templates, no generic layouts. Built to last generations.",
  alternates: {
    canonical: "https://www.ancestorii.com/memory-books",
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Memory Books | Ancestorii",
    description: "Turn your family's stories and photos into a beautifully printed hardcover book you design yourself.",
    url: "https://www.ancestorii.com/memory-books",
    siteName: "Ancestorii",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Ancestorii Memory Books" }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memory Books | Ancestorii",
    description: "Design and print a hardcover book of your family's stories, photos, and memories.",
    images: ["/og-default.jpg"],
  },
};

export default function MemoryBooksPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org", "@type": "WebPage",
          name: "Memory Books | Ancestorii",
          description: "Design and print a custom hardcover Memory Book filled with your family's stories, photos, and voices, with full creative control over every page.",
          url: "https://www.ancestorii.com/memory-books",
          isPartOf: { "@id": "https://www.ancestorii.com/#website" },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org", "@type": "Product",
          name: "Ancestorii Memory Book",
          description: "A custom-designed, professionally printed hardcover book containing your family's stories, photos, and memories.",
          brand: { "@type": "Brand", name: "Ancestorii" },
          url: "https://www.ancestorii.com/memory-books",
          category: "Books > Custom & Personalised Books",
          offers: { "@type": "AggregateOffer", priceCurrency: "GBP", lowPrice: "44.99", highPrice: "64.99", offerCount: 3, availability: "https://schema.org/InStock", url: "https://www.ancestorii.com/memory-books" },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org", "@type": "FAQPage",
          mainEntity: MEMORY_BOOK_FAQS.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />

      <SiteShell>
        <MemoryBooksContent />
      </SiteShell>
    </>
  );
}