import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display, DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import DeferredTags from "@/components/DeferredTags";
import CookieConsent from "@/components/CookieConsent";
import JsonLd from "@/components/site/seo/JsonLd";
import { FOUNDER, FOUNDER_ID } from "@/lib/seo/schema";

// Keep: this registers the global "Inter" face that the dashboard's font-[Inter] classes and the
// 800-weight Memory Book cover titles (editor and print export) rely on.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-dmsans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ancestorii.com"),

  other: {
    "facebook-domain-verification": "cpoupazob2etm1uodfyrzd1a52sf5",
  },

  title: {
    default: "A Living Family Library | Ancestorii",
    template: "%s | Ancestorii",
  },

  description:
    "Ancestorii is a private digital space where families capture stories, voices, and everyday moments as they happen. Build a living family library through timelines, albums, and memory capsules that grow over time.",

  keywords: [
    "Ancestorii",
    "digital legacy",
    "family memories",
    "family library",
    "timeline builder",
    "digital time capsule",
    "photo albums",
    "memory collection",
    "private family platform",
  ],

  authors: [{ name: "Ancestorii" }],
  creator: "Ancestorii",
  publisher: "Ancestorii",

  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://www.ancestorii.com",
    siteName: "Ancestorii",
    title: "Ancestorii — Your Family Library",
    description:
      "Capture stories, voices, and meaningful moments in a private space designed to grow with your family over time.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Ancestorii — Your family's greatest stories. Told together.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Ancestorii — Your Family Library",
    description:
      "A private space to capture and grow your family story in real time.",
    images: ["/og-default.jpg"],
    creator: "@ancestorii",
  },

  // Icons come from app/favicon.ico, app/icon.png and app/apple-icon.png (see scripts/brand).

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
  <link rel="help" href="/llms.txt" type="text/plain" />

        {/* 🟢 ORGANIZATION SCHEMA (entity node) */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://www.ancestorii.com/#organization",
            name: "Ancestorii",
            legalName: "Ancestorii",
            url: "https://www.ancestorii.com",
            description:
              "Ancestorii is a place where families capture and keep memories together — stories, voices, photos, and timelines — and turn them into printed heirlooms.",
            logo: {
              "@type": "ImageObject",
              url: "https://www.ancestorii.com/logo.png",
            },
            founder: { "@id": FOUNDER_ID },
            email: "support@ancestorii.com",
            sameAs: [
              "https://www.instagram.com/ancestorii_official/",
              "https://www.facebook.com/profile.php?id=61586259749930",
              // Add Wikidata, LinkedIn, Crunchbase, Product Hunt, G2, Capterra,
              // and Trustpilot profile URLs here as you create them — each verified
              // sameAs link strengthens how AI engines recognise Ancestorii as one
              // distinct entity. See SEO-GROWTH-PLAYBOOK.md.
            ],
          }}
        />

        {/* FOUNDER SCHEMA (the Person node the Organization's founder points to) */}
        <JsonLd data={{ "@context": "https://schema.org", ...FOUNDER }} />

        {/* 🟢 WEBSITE SCHEMA (linked to the Organization entity) */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://www.ancestorii.com/#website",
            name: "Ancestorii",
            url: "https://www.ancestorii.com",
            inLanguage: "en-GB",
            publisher: { "@id": "https://www.ancestorii.com/#organization" },
          }}
        />
      </head>

      <body
        className={`${inter.variable} ${playfair.variable} ${dmSans.variable} antialiased text-gray-900 bg-transparent min-h-screen`}
      >
        {/* No GTM <noscript> fallback: without JavaScript the cookie banner can't ask, so nothing loads. */}
        {children}

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 7000,
            style: {
              background: "#0A0A0F",
              color: "#FFFFFF",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "14px",
              padding: "12px 18px",
              fontSize: "15.5px",
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: "#12D3AC",
                secondary: "#0A0A0F",
              },
            },
            error: {
              iconTheme: {
                primary: "#FF2D87",
                secondary: "#FFFFFF",
              },
            },
          }}
        />

        {/* Marketing pixels (GTM with GA4, Google Ads and Reddit; Meta; Spotify): they load only after
            the visitor accepts in the cookie banner, and DeferredTags then decides when. */}
        <DeferredTags />
        <CookieConsent />
      </body>
    </html>
  );
}
