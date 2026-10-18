import WhyThisExists from "@/components/WhyThisExists";
import SiteShell from '@/components/site/SiteShell';
import type { Metadata } from "next";
import JsonLd from '@/components/site/seo/JsonLd';
import { FOUNDER_ID, ORG_ID } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: { absolute: "Our Roots: Why Ancestorii Exists" },
  description:
    "The personal story behind Ancestorii. Built by one person who could not stop thinking about how much families lose when nobody writes things down.",
  alternates: {
    canonical: "https://www.ancestorii.com/why-this-exists",
  },
  openGraph: {
    title: "Our Roots: Why Ancestorii Exists",
    description:
      "The personal story behind Ancestorii. Built by one person who could not stop thinking about how much families lose when nobody writes things down.",
    url: "https://www.ancestorii.com/why-this-exists",
    siteName: "Ancestorii",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Ancestorii: Our Roots",
      },
    ],
    locale: "en_GB",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Roots: Why Ancestorii Exists",
    description:
      "The personal story behind Ancestorii. Built by one person who could not stop thinking about how much families lose when nobody writes things down.",
    images: ["/og-default.jpg"],
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "Our Roots: Why Ancestorii Exists",
          "description":
            "The personal story behind Ancestorii, built because every family has moments worth sharing, and most of them are never written down.",
          "url": "https://www.ancestorii.com/why-this-exists",
          "author": { "@id": FOUNDER_ID },
          "about": { "@id": ORG_ID },
          "publisher": { "@id": ORG_ID }
        }}
      />

      <SiteShell>
        <WhyThisExists />
      </SiteShell>
    </>
  );
}