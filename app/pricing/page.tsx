import SiteShell from '@/components/site/SiteShell';
import type { Metadata } from 'next';
import JsonLd from '@/components/site/seo/JsonLd';
import PricingContent from './PricingContent';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Start building your private family library for free. Upgrade to Premium monthly membership to preserve more memories, stories and legacy.',
  alternates: {
    canonical: 'https://www.ancestorii.com/pricing',
  },
};

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Ancestorii',
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'iOS, Android, Web',
          url: 'https://www.ancestorii.com',
          description:
            'Ancestorii is a private family library where you can build timelines, albums and capsules to preserve memories for future generations.',
          offers: [
            {
              '@type': 'Offer',
              url: 'https://www.ancestorii.com/pricing',
              priceCurrency: 'GBP',
              price: '3.99',
              availability: 'https://schema.org/InStock',
              category: 'Premium monthly membership',
              name: 'Ancestorii Premium - GBP',
            },
            {
              '@type': 'Offer',
              url: 'https://www.ancestorii.com/pricing',
              priceCurrency: 'EUR',
              price: '4.99',
              availability: 'https://schema.org/InStock',
              category: 'Premium monthly membership',
              name: 'Ancestorii Premium - EUR',
            },
            {
              '@type': 'Offer',
              url: 'https://www.ancestorii.com/pricing',
              priceCurrency: 'USD',
              price: '5.99',
              availability: 'https://schema.org/InStock',
              category: 'Premium monthly membership',
              name: 'Ancestorii Premium - USD',
            },
          ],
        }}
      />

      <SiteShell>
        <PricingContent />
      </SiteShell>
    </>
  );
}