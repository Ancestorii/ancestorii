import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display, DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import LenisProvider from "./providers/LenisProvider";

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
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ancestorii Living Family Library",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Ancestorii — Your Family Library",
    description:
      "A private space to capture and grow your family story in real time.",
    images: ["/og-image.jpg"],
    creator: "@ancestorii",
  },

  icons: {
    icon: "/favicon.ico",
  },

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

  {/* 🟡 GOOGLE TAG MANAGER */}
        <Script id="gtm-head" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id=GTM-PWNN6NGL'+dl;
            f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PWNN6NGL');
          `}
        </Script>

        {/* 🔴 REDDIT PIXEL */}
        <Script id="reddit-pixel" strategy="afterInteractive">
          {`
!function(w,d){
  if(!w.rdt){
    var p=w.rdt=function(){
      p.sendEvent ? p.sendEvent.apply(p,arguments) : p.callQueue.push(arguments)
    };
    p.callQueue=[];
    var t=d.createElement("script");
    t.src="https://www.redditstatic.com/ads/pixel.js";
    t.async=!0;
    var s=d.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(t,s);
  }
}(window,document);
rdt('init','a2_ibovuqrsg8y0');
rdt('track','PageVisit');
          `}
        </Script>

        {/* 🔵 META PIXEL */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2096190511177765');
            fbq('track', 'PageView');
          `}
        </Script>

        {/* 🟢 SPOTIFY PIXEL */}
        <Script id="spotify-pixel" strategy="afterInteractive">
          {`
            (function(w, d){
              var id='spdt-capture', n='script';
              if (!d.getElementById(id)) {
                w.spdt =
                  w.spdt ||
                  function() {
                    (w.spdt.q = w.spdt.q || []).push(arguments);
                  };
                var e = d.createElement(n); e.id = id; e.async=1;
                e.src = 'https://pixel.byspotify.com/ping.min.js';
                var s = d.getElementsByTagName(n)[0];
                s.parentNode.insertBefore(e, s);
              }
              w.spdt('conf', { key: '21575df569e94d379a6107e35a8d3553' });
              w.spdt('view');
            })(window, document);
          `}
        </Script>

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
              url: "https://www.ancestorii.com/favicon.ico",
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

        <LenisProvider>
          {children}
        </LenisProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 7000,
            style: {
              background: "#0F2040",
              color: "#FFFFFF",
              border: "1px solid #D4AF37",
              borderRadius: "12px",
              padding: "12px 18px",
              fontSize: "15.5px",
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: "#D4AF37",
                secondary: "#FFFFFF",
              },
            },
            error: {
              iconTheme: {
                primary: "#D64545",
                secondary: "#FFFFFF",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
