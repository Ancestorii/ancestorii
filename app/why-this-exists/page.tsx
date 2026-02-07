import WhyThisExists from "@/components/WhyThisExists";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why Ancestorii Exists | Preserving Family Memories",
  description:
    "Why Ancestorii was created — a personal, private platform built to preserve family memories, voices, and stories for future generations.",
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
