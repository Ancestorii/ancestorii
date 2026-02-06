import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import LenisProvider from "./providers/LenisProvider";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ancestorii.com"),

  other: {
    "facebook-domain-verification": "cpoupazob2etm1uodfyrzd1a52sf5",
  },

  title: {
    default: "Ancestorii Preserve Your Family Legacy Forever",
    template: "%s | Ancestorii",
  },

  description:
    "Capture, protect, and pass down your family's memories through digital timelines, albums, and legacy capsules. Ancestorii keeps your story alive for generations.",
  keywords: [
    "Ancestorii",
    "digital legacy",
    "family memories",
    "memory preservation",
    "timeline builder",
    "digital time capsule",
    "family tree",
    "photo albums",
    "secure cloud storage",
    "legacy platform",
  ],
  authors: [{ name: "Ancestorii" }],
  creator: "Ancestorii",
  publisher: "Ancestorii",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://www.ancestorii.com",
    siteName: "Ancestorii",
    title: "Ancestorii Preserve Your Family Legacy Forever",
    description:
      "Your family's story, preserved through timelines, albums, and legacy capsules — secure, private, and beautifully designed.",
    images: [
      {
        url: "/og-image.jpg", // replace with your real OG image
        width: 1200,
        height: 630,
        alt: "Ancestorii – Digital Legacy Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ancestorii Preserve Your Family Legacy Forever",
    description:
      "Capture, organize, and protect your family's most meaningful moments with Ancestorii.",
    images: ["/og-image.jpg"],
    creator: "@ancestorii", // optional if you make a Twitter/X account
  },
  icons: {
     icon: "/favicon1.png",
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
        {/* 🟢 ORGANIZATION SCHEMA */}
    <Script
      id="org-schema"
      type="application/ld+json"
      strategy="afterInteractive"
    >
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Ancestorii",
        url: "https://www.ancestorii.com",
        logo: "https://www.ancestorii.com/favicon1.png",
        sameAs: [
          "https://www.instagram.com/ancestorii",
          "https://www.facebook.com/ancestorii"
        ],
      })}
    </Script>
  </head>

      <body
        className={`${inter.variable} antialiased text-gray-900 bg-transparent min-h-screen`}
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
