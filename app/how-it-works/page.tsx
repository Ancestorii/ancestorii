import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import Script from 'next/script';
import HowItWorksContent from './HowItWorksContent';

export const metadata: Metadata = {
  title: 'How It Works | Ancestorii',
  description:
    'Explore how Ancestorii structures timelines, albums, capsules and family access to preserve memory with intention, privacy and continuity.',
  alternates: {
    canonical: 'https://www.ancestorii.com/how-it-works',
  },
};

export default function HowItWorksPage() {
  return (
    <>
      <Script id="how-it-works-schema" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'How It Works | Ancestorii',
          description:
            'A detailed guide to how the Ancestorii platform works: structure, privacy, security, and continuity.',
        })}
      </Script>

      <main className="bg-[#FFFDF6] text-[#0F2040]">
        <Nav />
        <HowItWorksContent />
        <Footer />
      </main>
    </>
  );
}