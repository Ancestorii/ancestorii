import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Faq from '@/components/Faq';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import HowItWorks from '@/components/HowItWorks';
import Founder from '@/components/Founder';
import WhatsIncluded from '@/components/WhatsIncluded';
import Script from "next/script";
import FeaturedBy from '@/components/FeaturedBy';
import GuidesPreview from '@/components/GuidesPreview';
import PodcastPreview from '@/components/PodcastPreview';

/* ---------------- SEO Metadata ---------------- */
export const metadata: Metadata = {
  title: "Ancestorii A Living Family Library",
  description:
    "Ancestorii is a private digital space where families capture stories, voices, and everyday moments as they happen. Build a living family library through timelines, albums, and memory capsules that grow over time.",
  keywords: [
    "Ancestorii",
    "family legacy",
    "digital memories",
    "timeline builder",
    "photo albums",
    "digital time capsule",
    "family library",
    "memory collection",
    "private family platform",
  ],
  openGraph: {
    title: "Ancestorii A Living Family Library",
    description:
      "Capture stories, voices, and meaningful moments in a private space designed to grow with your family over time.",
    url: "https://www.ancestorii.com",
    siteName: "Ancestorii",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ancestorii Living Family Library",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ancestorii A Living Family Library",
    description:
      "A private space to capture and grow your family story in real time.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://www.ancestorii.com/",
  },
  robots: {
    index: true,
    follow: true,
  },
};


/* ---------------- Main Page ---------------- */
export default function HomePage() {
  return (
    <>
      {/* WebSite Schema */}
      <Script
        id="website-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Ancestorii",
          url: "https://www.ancestorii.com",
          description:
            "Ancestorii is a private living family library where stories, voices, and everyday moments are captured while life is happening.",
        })}
      </Script>

      {/* WebPage Schema */}
      <Script
        id="webpage-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Ancestorii A Living Family Library",
          description:
            "Build a living family library by capturing stories, voices, and meaningful moments in a private space designed to grow over time.",
          url: "https://www.ancestorii.com/",
          isPartOf: {
            "@type": "WebSite",
            name: "Ancestorii",
          },
        })}
      </Script>

      {/* Organization Schema */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Ancestorii",
          url: "https://www.ancestorii.com",
          logo: "https://www.ancestorii.com/logo1.png",
        })}
      </Script>

      {/* Software Application Schema */}
      <Script
        id="software-app-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Ancestorii",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Web",
          url: "https://www.ancestorii.com",
          description:
            "A private web platform that helps families build a living library of stories, voices, and moments as life unfolds.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "GBP",
          },
        })}
      </Script>

            {/* FAQ Schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": "https://www.ancestorii.com/#faq",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Who was Ancestorii made for?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Ancestorii was created for families who want to capture stories, voices, and meaningful moments while life is happening. It is designed for parents, grandparents, and anyone who wants their family story to remain personal and clear over time."
              }
            },
            {
              "@type": "Question",
              "name": "How do I start?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Start with one memory. Add a photo and write a few sentences about why it matters. Record a short voice note. The library grows naturally, one entry at a time."
              }
            },
            {
              "@type": "Question",
              "name": "Is everything private?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. Everything is private by default. Only you and anyone you choose to invite can access your collection."
              }
            },
            {
              "@type": "Question",
              "name": "What makes Ancestorii different from cloud storage?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Cloud storage keeps files. Ancestorii helps you build a living family library with timelines, albums, written memories, and voice notes that connect stories together over time."
              }
            },
            {
              "@type": "Question",
              "name": "Can I cancel anytime?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. You can cancel whenever you choose. Your access remains active until the end of your billing period. There are no contracts and no hidden fees."
              }
            }
          ]
        })}
      </Script>


      <main className="bg-[#fff9ee] text-[#0F2040]">
        <Nav />
        <Hero />
        <FeaturedBy />
        <Founder />
        <PodcastPreview />
        <HowItWorks />
        <WhatsIncluded />
        <GuidesPreview />
        <Faq />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
