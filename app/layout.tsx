import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ancestorii.com"), // your domain
  title: {
    default: "Ancestorii – Preserve Your Family's Legacy Forever",
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
    title: "Ancestorii – Preserve Your Family's Legacy Forever",
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
    title: "Ancestorii – Preserve Your Family's Legacy Forever",
    description:
      "Capture, organize, and protect your family's most meaningful moments with Ancestorii.",
    images: ["/og-image.jpg"],
    creator: "@ancestorii", // optional if you make a Twitter/X account
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://www.ancestorii.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased text-gray-900 bg-transparent min-h-screen`}
      >
        {children}

        <Toaster
  position="top-right"
  toastOptions={{
    duration: 7000, // 7 seconds = smoother pacing
    style: {
      background: "#0F2040",  // deep navy
      color: "#FFFFFF",       // clean white text
      border: "1px solid #D4AF37", // gold outline = premium
      borderRadius: "12px",
      padding: "12px 18px",
      fontSize: "15.5px",  // slightly bigger, not childish
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
