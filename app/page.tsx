
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

/* ---------------- SEO Metadata ---------------- */
export const metadata: Metadata = {
  title: "Ancestorii Preserve Your Family Legacy Forever",
  description:
    "Ancestorii is a digital legacy platform where you can capture, protect, and pass down your family's story through timelines, albums, and future-dated capsules. Preserve your memories for generations to come.",
  keywords: [
    "Ancestorii",
    "family legacy",
    "digital memories",
    "timeline builder",
    "photo albums",
    "digital time capsule",
    "memory preservation",
    "secure family storage",
    "digital legacy platform",
  ],
  openGraph: {
    title: "Ancestorii Preserve Your Family Legacy Forever",
    description:
      "Create and protect your family's digital story through timelines, albums, and legacy capsules. Secure, private, and beautifully designed.",
    url: "https://www.ancestorii.com",
    siteName: "Ancestorii",
    images: [
      {
        url: "/og-image.jpg", // change to your OG image
        width: 1200,
        height: 630,
        alt: "Ancestorii – Digital Legacy Platform",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ancestorii Preserve Your Family Legacy Forever",
    description:
      "Capture, organize, and pass down your family's memories securely with Ancestorii.",
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
        <HowItWorks />
        <WhatsIncluded/>
        <Faq />
        <Contact />
        <Footer />
      </main>
    </>
  );
}

