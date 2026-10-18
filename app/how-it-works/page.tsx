import type { Metadata } from 'next';
import JsonLd from '@/components/site/seo/JsonLd';
import SiteShell from '@/components/site/SiteShell';
import HowItWorksContent from './HowItWorksContent';

const DESCRIPTION =
  'Explore how Ancestorii structures timelines, albums, capsules and family access to preserve memory with intention, privacy and continuity.';

export const metadata: Metadata = {
  title: 'How It Works',
  description: DESCRIPTION,
  alternates: {
    canonical: 'https://www.ancestorii.com/how-it-works',
  },
  openGraph: {
    title: 'How It Works | Ancestorii',
    description: DESCRIPTION,
    url: 'https://www.ancestorii.com/how-it-works',
    siteName: 'Ancestorii',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'How Ancestorii works' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works | Ancestorii',
    description: DESCRIPTION,
    images: ['/og-default.jpg'],
  },
};

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'How It Works | Ancestorii',
          description:
            'A detailed guide to how the Ancestorii platform works: structure, privacy, security, and continuity.',
        }}
      />

      <SiteShell>
        <HowItWorksContent />
      </SiteShell>
    </>
  );
}