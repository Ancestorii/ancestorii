import { createClient } from '@supabase/supabase-js';
import { getLandingStories } from '@/lib/stories/landing';
import LandingPage from '@/components/landing/LandingPage';
import JsonLd from '@/components/site/seo/JsonLd';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  // `absolute`: the root layout's "%s | Ancestorii" template would name the brand twice.
  title: { absolute: 'Ancestorii: Stories from Real Families' },
  description:
    'Every family has a story worth sharing. Share your family’s stories, photos and voices with the people who matter, read real stories from real families, and turn them into printed Memory Books. Free to start.',
  keywords: [
    'Ancestorii',
    'family stories',
    'family memories',
    'memory preservation',
    'family library',
    'share family stories',
    'real family memories',
    'digital legacy',
  ],
  openGraph: {
    title: 'Ancestorii: Stories from Real Families',
    description:
      'Every family has a story worth sharing. Share the stories, photos and voices that matter, and turn them into printed Memory Books.',
    url: 'https://www.ancestorii.com',
    siteName: 'Ancestorii',
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Ancestorii: Stories from Real Families',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ancestorii: Stories from Real Families',
    description:
      'Every family has a story worth sharing. Share the stories, photos and voices that matter, and turn them into printed Memory Books.',
    images: ['/og-home.jpg'],
    creator: '@ancestorii',
  },
  alternates: {
    canonical: 'https://www.ancestorii.com/',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Static HTML, rebuilt in the background at most once a minute: the page comes straight from the
// CDN instead of waiting on a server render and its database queries on every visit. Nothing here
// reads cookies. Who is signed in only decides where the nav and the story buttons point, and they
// work that out in the browser (SiteNav, StoryCta), as on every other public page.
export const revalidate = 60;

export default async function HomePage() {
  // Published stories only, read as the public does (RLS), so no cookie-bound client is needed.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const stories = await getLandingStories(supabase);

  return (
    <>
      {/* WebPage schema (WebSite + Organization entity nodes live in the root layout) */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Ancestorii: Stories from Real Families',
          description:
            'Every family has a story worth sharing. Families share their stories, photos and voices, and turn them into printed Memory Books.',
          url: 'https://www.ancestorii.com/',
          isPartOf: { '@id': 'https://www.ancestorii.com/#website' },
        }}
      />

      <LandingPage stories={stories} />
    </>
  );
}
