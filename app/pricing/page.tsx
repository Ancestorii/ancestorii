import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import Script from 'next/script';
import PricingContent from './PricingContent';

export const metadata: Metadata = {
  title: 'Pricing | Ancestorii',
  description:
    'Start building your private living family library for free. Transparent plans designed to grow with your memories, stories and legacy.',
  alternates: {
    canonical: 'https://www.ancestorii.com/pricing',
  },
};

export default function PricingPage() {
  return (
    <>
      <Script id="pricing-schema" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Ancestorii',
          applicationCategory: 'WebApplication',
          operatingSystem: 'All',
          url: 'https://www.ancestorii.com',
          description:
            'Ancestorii is a private living family library where you can build timelines, albums and capsules to preserve memories for future generations.',
          offers: {
            '@type': 'AggregateOffer',
            url: 'https://www.ancestorii.com/pricing',
            priceCurrency: 'GBP',
            lowPrice: '0',
            highPrice: '9.99',
            offerCount: '2',
            availability: 'https://schema.org/InStock',
          },
        })}
      </Script>

      <main className="bg-[#FFFDF6] text-[#0F2040] min-h-screen">
        <Nav />
        <PricingContent />
        <Footer />
      </main>
    </>
  );
}