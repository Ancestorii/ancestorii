import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { TOPICS } from '@/lib/stories/topics';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.ancestorii.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/stories`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}/memory-books`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides/living-library-vs-digital-vault`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/how-to-preserve-family-memories`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/how-to-save-family-voices`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/how-to-record-family-stories`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/what-to-do-with-old-family-photos`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/questions-to-ask-your-parents-about-their-life`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guides/what-to-write-in-a-memory-book`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/why-this-exists`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}/digital-legacy`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}/living-library`,
      lastModified: new Date(),
      priority: 0.6,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/compare/storyworth-alternative`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/stories/topics`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      priority: 0.3,
    },
  ];

  // Feature, print, comparison and guide pages, checked monthly
  const monthly = (path: string, priority: number) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority,
  });

  const featurePages: MetadataRoute.Sitemap = [
    monthly('/features', 0.8),
    ...[
      'private-family-feed',
      'family-questions',
      'loved-ones',
      'family-photo-albums',
      'family-timeline',
      'digital-time-capsule',
      'family-library',
      'voice-notes',
      'invite-family',
      'writing-help',
      'our-stories',
    ].map((slug) => monthly(`/features/${slug}`, 0.7)),
  ];

  const printPages: MetadataRoute.Sitemap = [monthly('/canvas-prints', 0.8), monthly('/acrylic-prints', 0.8)];

  const comparePages: MetadataRoute.Sitemap = [
    'ancestorii-vs-ancestry',
    'ancestorii-vs-facebook-groups',
    'ancestorii-vs-google-photos',
    'ancestorii-vs-icloud-shared-albums',
    'ancestorii-vs-tinybeans',
    'ancestorii-vs-whatsapp',
    'best-family-memory-apps',
    'remento-alternative',
  ].map((slug) => monthly(`/compare/${slug}`, 0.7));

  // The guides added after the first seven (those are listed above)
  const guidePages: MetadataRoute.Sitemap = [
    '80th-birthday-ideas',
    'anniversary-gift-ideas-by-year',
    'family-history-vs-family-tree',
    'family-traditions-ideas',
    'gifts-for-grandparents',
    'how-long-do-photos-last',
    'how-to-back-up-family-photos',
    'how-to-create-a-family-archive',
    'how-to-digitize-cassette-tapes',
    'how-to-digitize-home-videos',
    'how-to-digitize-old-photos',
    'how-to-digitize-slides-and-negatives',
    'how-to-get-family-to-share-memories',
    'how-to-interview-your-grandparents',
    'how-to-keep-memories-of-a-loved-one-alive',
    'how-to-label-old-photos',
    'how-to-make-a-memorial-book',
    'how-to-organize-family-photos',
    'how-to-preserve-family-recipes',
    'how-to-preserve-old-letters-and-documents',
    'how-to-save-text-messages-from-a-loved-one',
    'how-to-save-voicemails-from-a-loved-one',
    'how-to-scan-photos-with-your-phone',
    'how-to-start-researching-your-family-history',
    'how-to-store-old-photos',
    'how-to-write-a-eulogy',
    'how-to-write-a-legacy-letter',
    'how-to-write-a-life-story',
    'questions-to-ask-your-dad',
    'questions-to-ask-your-grandparents',
    'questions-to-ask-your-mum',
    'what-happens-to-your-photos-when-you-die',
    'what-to-put-in-a-time-capsule',
  ].map((slug) => monthly(`/guides/${slug}`, 0.6));

  // Topic hub pages
  const topicPages: MetadataRoute.Sitemap = TOPICS.map((t) => ({
    url: `${baseUrl}/stories/topics/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic story pages
  let storyPages: MetadataRoute.Sitemap = [];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: stories } = await supabase
      .from('stories')
      .select('slug, published_at, updated_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1000);

    storyPages = (stories ?? []).map((story) => ({
      url: `${baseUrl}/stories/${story.slug}`,
      lastModified: new Date(story.updated_at ?? story.published_at),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
  } catch (error) {
    console.error('Sitemap: failed to fetch stories', error);
  }

  return [
    ...staticPages,
    ...featurePages,
    ...printPages,
    ...comparePages,
    ...guidePages,
    ...topicPages,
    ...storyPages,
  ];
}