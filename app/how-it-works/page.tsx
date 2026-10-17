import type { Metadata } from 'next';
import JsonLd from '@/components/site/seo/JsonLd';
import SiteShell from '@/components/site/SiteShell';
import HowItWorksContent from './HowItWorksContent';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Explore how Ancestorii structures timelines, albums, capsules and family access to preserve memory with intention, privacy and continuity.',
  alternates: {
    canonical: 'https://www.ancestorii.com/how-it-works',
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