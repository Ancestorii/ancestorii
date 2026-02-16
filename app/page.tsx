
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
          {/* 🟢 SOFTWARE APPLICATION SCHEMA */}
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
            "Ancestorii is a private digital legacy platform that helps families preserve stories, voices, and memories for future generations.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "GBP",
          },
        })}
      </Script>
      <main className="bg-[#fff9ee] text-[#0F2040]">
        <Nav />
        <Hero />
        <FeaturedBy />
        <Founder />
        <PodcastPreview />
        <HowItWorks />
        <WhatsIncluded/>
        <GuidesPreview />
        <Faq />
        <Contact />
        <Footer />
      </main>
    </>
  );
}

