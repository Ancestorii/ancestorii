import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import Script from 'next/script';
import PricingContent from './PricingContent';

export const metadata: Metadata = {
  title: 'Pricing | Ancestorii',
  description:
    'Start building your private family library for free. Upgrade to Premium yearly membership to preserve more memories, stories and legacy.',
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
            'Ancestorii is a private family library where you can build timelines, albums and capsules to preserve memories for future generations.',
          offers: [
            {
              '@type': 'Offer',
              url: 'https://www.ancestorii.com/pricing',
              priceCurrency: 'GBP',
              price: '49',
              availability: 'https://schema.org/InStock',
              category: 'Premium yearly membership',
              name: 'Ancestorii Premium - GBP',
            },
            {
              '@type': 'Offer',
              url: 'https://www.ancestorii.com/pricing',
              priceCurrency: 'EUR',
              price: '59',
              availability: 'https://schema.org/InStock',
              category: 'Premium yearly membership',
              name: 'Ancestorii Premium - EUR',
            },
            {
              '@type': 'Offer',
              url: 'https://www.ancestorii.com/pricing',
              priceCurrency: 'USD',
              price: '69',
              availability: 'https://schema.org/InStock',
              category: 'Premium yearly membership',
              name: 'Ancestorii Premium - USD',
            },
          ],
        })}
      </Script>

      <main className="min-h-screen bg-[#FFFDF6] text-[#0F2040]">
        <Nav />
        <PricingContent />
        <Footer />
      </main>
    </>
  );
}