import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display, DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import DeferredTags from "@/components/DeferredTags";

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
        <Script
          id="org-schema"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
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
            founder: { "@type": "Person", name: "Dante Leon" },
            email: "support@ancestorii.com",
            sameAs: [
              "https://www.instagram.com/ancestorii_official/",
              "https://www.facebook.com/profile.php?id=61586259749930",
              // Add Wikidata, LinkedIn, Crunchbase, Product Hunt, G2, Capterra,
              // and Trustpilot profile URLs here as you create them — each verified
              // sameAs link strengthens how AI engines recognise Ancestorii as one
              // distinct entity. See SEO-GROWTH-PLAYBOOK.md.
            ],
          })}
        </Script>

        {/* 🟢 WEBSITE SCHEMA (linked to the Organization entity) */}
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://www.ancestorii.com/#website",
            name: "Ancestorii",
            url: "https://www.ancestorii.com",
            inLanguage: "en-GB",
            publisher: { "@id": "https://www.ancestorii.com/#organization" },
          })}
        </Script>
      </head>

      <body
        className={`${inter.variable} ${playfair.variable} ${dmSans.variable} antialiased text-gray-900 bg-transparent min-h-screen`}
      >
        {/* 🟡 GOOGLE TAG MANAGER (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PWNN6NGL"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

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

        {/* Marketing pixels (GTM, Reddit, Meta, Spotify): DeferredTags decides when they load. */}
        <DeferredTags />
      </body>
    </html>
  );
}
