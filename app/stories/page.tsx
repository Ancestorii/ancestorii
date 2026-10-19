import { getServerClient } from '@/lib/supabase/server';
import SiteShell from '@/components/site/SiteShell';
import ExploreFeed from '@/components/stories/feed/ExploreFeed';
import JsonLd from '@/components/site/seo/JsonLd';
import { FEED_PAGE_SIZE, applyAvatars, getPublicFeed } from '@/lib/stories/publicFeed';
import { signAvatarUrls } from '@/lib/stories/avatars';
import type { Metadata } from 'next';

// The full "Our Stories" feed. It used to be the homepage; the homepage is now the landing page.
export const metadata: Metadata = {
  title: { absolute: 'Our Stories: Real Stories from Real Families | Ancestorii' },
  description:
    'Real memories from real families. Read their stories, share your own, and be part of something that lasts. A living family library where every voice matters.',
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
    title: 'Our Stories: Real Stories from Real Families',
    description:
      'Real memories from real families. Read their stories, share your own, and be part of something that lasts.',
    url: 'https://www.ancestorii.com/stories',
    siteName: 'Ancestorii',
    images: [
      {
        url: '/og-default.jpg',
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
    title: 'Our Stories: Real Stories from Real Families',
    description:
      'Real memories from real families. Read their stories, share your own, and be part of something that lasts.',
    images: ['/og-default.jpg'],
    creator: '@ancestorii',
  },
  alternates: {
    canonical: 'https://www.ancestorii.com/stories',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function StoriesPage() {
  const supabase = await getServerClient();

  // The reader and the public lists (kept for a minute, shared by every visitor), side by side.
  const [
    {
      data: { user },
    },
    feed,
  ] = await Promise.all([supabase.auth.getUser(), getPublicFeed()]);
  const isLoggedIn = !!user;

  // Then the reader's own name and the authors' photos (one signed URL a day per photo, see
  // src/lib/stories/avatars.ts), side by side.
  const [ownProfile, avatars] = await Promise.all([
    user ? supabase.from('Profiles').select('full_name').eq('id', user.id).maybeSingle() : null,
    signAvatarUrls([...feed.stories, ...feed.featured].map((s) => s.avatar_path)),
  ]);
  const userName = user
    ? ownProfile?.data?.full_name ?? user.user_metadata?.full_name ?? null
    : null;

  const feedStories = applyAvatars(feed.stories, avatars);
  const featuredStories = applyAvatars(feed.featured, avatars);

  return (
    <>
      {/* WebPage schema (WebSite + Organization entity nodes live in the root layout) */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Our Stories: Real Stories from Real Families',
          description:
            'Browse real family memories: stories, voices and moments shared by families around the world.',
          url: 'https://www.ancestorii.com/stories',
          isPartOf: { '@id': 'https://www.ancestorii.com/#website' },
        }}
      />

      <SiteShell isLoggedIn={isLoggedIn} storiesBar>
        <ExploreFeed
          initialStories={feedStories}
          featuredStories={featuredStories}
          trendingStories={feed.trending}
          popularTopics={feed.popularTopics}
          isLoggedIn={isLoggedIn}
          pageSize={FEED_PAGE_SIZE}
          userName={userName}
        />
      </SiteShell>
    </>
  );
}
