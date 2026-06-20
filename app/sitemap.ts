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

  return [...staticPages, ...topicPages, ...storyPages];
}