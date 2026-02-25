import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Faq from '@/components/Faq';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import CoreValueSnapshot from '@/components/CoreValueSnapshot';
import Founder from '@/components/Founder';
import Script from "next/script";
import FeaturedBy from '@/components/FeaturedBy';
import PodcastPreview from '@/components/PodcastPreview';
import Security from '@/components/Security';
import PlatformComparison from '@/components/PlatformComparison';

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
        "name": "Who is Ancestorii really for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For families who do not want their history scattered across phones or lost when someone upgrades a device. Parents, grandparents, and anyone who understands that stories disappear quietly if they are not preserved properly."
        }
      },
      {
        "@type": "Question",
        "name": "How is this different from Google Photos or cloud storage?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Cloud storage keeps files. Ancestorii gives those files meaning. Timelines follow a life. Albums organise chapters. Voice capsules preserve tone and personality. This is a structured living library, not a storage folder."
        }
      },
      {
        "@type": "Question",
        "name": "How do people usually begin?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most start small. One person. One milestone. One memory explained properly. The library grows naturally from there. It is not about uploading everything at once. It is about protecting meaning while it still exists."
        }
      },
      {
        "@type": "Question",
        "name": "Is my family library private?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Everything is private by default. There are no public feeds, no searchable profiles, and nothing visible outside the people you personally invite."
        }
      },
      {
        "@type": "Question",
        "name": "Who owns the content I upload?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You do. Always. Your memories, recordings, and photographs remain yours. Ancestorii simply provides the structure and protection to preserve them."
        }
      },
      {
        "@type": "Question",
        "name": "What happens if I stop paying?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nothing is deleted. Your library remains accessible. If you exceed free plan limits, new creation pauses until you upgrade again. Your archive stays intact."
        }
      },
      {
        "@type": "Question",
        "name": "Can other family members contribute?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Shared contributions are coming soon. For now, each library is owned and managed by one account to maintain simplicity and privacy."
        }
      },
      {
        "@type": "Question",
        "name": "Why include voice recordings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Because voice carries presence. Tone, humour, warmth. The things photographs cannot hold. Years from now, hearing someone speak matters more than seeing another picture."
        }
      },
      {
        "@type": "Question",
        "name": "Is this built for long term preservation?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The structure, privacy model, and continuity approach are designed so your family library remains accessible and meaningful across generations."
        }
      }
    ]
  })}
</Script>


      <main className="bg-[#fff9ee] text-[#0F2040]">
        <Nav />
        <Hero />
        <CoreValueSnapshot />
        <PlatformComparison />
        <FeaturedBy />
        <Security />
        <Founder />
        <PodcastPreview />
        <Faq />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
