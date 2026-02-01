
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Faq from '@/components/Faq';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import HowItWorks from '@/components/HowItWorks';
import Founder from '@/components/Founder';
import WhatsIncluded from '@/components/WhatsIncluded';

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
      <main className="bg-[#fff9ee] text-[#0F2040]">
        <Nav />
        <Hero />
        <HowItWorks />
        <Founder />
        <WhatsIncluded/>
        <Faq />
        <Contact />
        <Footer />
      </main>
    </>
  );
}

