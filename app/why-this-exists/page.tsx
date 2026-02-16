import WhyThisExists from "@/components/WhyThisExists";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

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
    <main className="bg-[#fff9ee] text-[#0F2040]">
      <Nav />
      <WhyThisExists />
      <Footer />
    </main>
  );
}
