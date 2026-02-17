import WhyThisExists from "@/components/WhyThisExists";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Why Ancestorii Exists | A Living Family Library",
  description:
    "Discover why Ancestorii was created. A personal and private space designed to capture family stories, voices, and memories as they happen and grow them into a living collection.",
  alternates: {
    canonical: "https://www.ancestorii.com/why-this-exists",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function WhyThisExistsPage() {
  return (
    <>
      {/* About Page Schema */}
      <Script
        id="aboutpage-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "Why Ancestorii Exists",
          "description":
            "The story behind Ancestorii and why it was created as a private living family library for capturing stories, voices, and meaningful moments while life unfolds.",
          "url": "https://www.ancestorii.com/why-this-exists",
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

      <main className="bg-[#fff9ee] text-[#0F2040]">
        <Nav />
        <WhyThisExists />
        <Footer />
      </main>
    </>
  );
}
