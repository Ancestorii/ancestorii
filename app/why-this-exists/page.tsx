import WhyThisExists from "@/components/WhyThisExists";
import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Our Roots — Why Ancestorii Exists",
  description:
    "The personal story behind Ancestorii. Built by one person who could not stop thinking about how much families lose when nobody writes things down.",
  alternates: {
    canonical: "https://www.ancestorii.com/why-this-exists",
  },
  openGraph: {
    title: "Our Roots — Why Ancestorii Exists",
    description:
      "The personal story behind Ancestorii. Built by one person who could not stop thinking about how much families lose when nobody writes things down.",
    url: "https://www.ancestorii.com/why-this-exists",
    siteName: "Ancestorii",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ancestorii — Our Roots",
      },
    ],
    locale: "en_GB",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Roots — Why Ancestorii Exists",
    description:
      "The personal story behind Ancestorii. Built by one person who could not stop thinking about how much families lose when nobody writes things down.",
    images: ["/og-image.jpg"],
    creator: "@ancestorii",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function WhyThisExistsPage() {
  return (
    <>
      <Script
        id="aboutpage-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "Our Roots — Why Ancestorii Exists",
          "description":
            "The personal story behind Ancestorii — built because every family has moments worth sharing, and most of them are never written down.",
          "url": "https://www.ancestorii.com/why-this-exists",
          "author": {
            "@type": "Person",
            "name": "Dante Leon",
            "jobTitle": "Founder",
            "worksFor": {
              "@type": "Organization",
              "name": "Ancestorii"
            }
          },
          "about": {
            "@type": "Organization",
            "name": "Ancestorii"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Ancestorii"
          }
        })}
      </Script>

      <main className="bg-[#FFFDF8] text-[#0F2040]">
        <PublicNav />
        <WhyThisExists />
        <PublicFooter />
      </main>
    </>
  );
}