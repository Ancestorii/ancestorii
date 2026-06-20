import { getServerClient } from '@/lib/supabase/server';
import PublicNav from '@/components/stories/layout/PublicNav';
import PublicFooter from '@/components/stories/layout/PublicFooter';
import ExploreFeed from '@/components/stories/feed/ExploreFeed';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ancestorii — Stories from Real Families',
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
    title: 'Ancestorii — Stories from Real Families',
    description:
      'Real memories from real families. Read their stories, share your own, and be part of something that lasts.',
    url: 'https://www.ancestorii.com',
    siteName: 'Ancestorii',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ancestorii — Stories from Real Families',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ancestorii — Stories from Real Families',
    description:
      'Real memories from real families. Read their stories, share your own, and be part of something that lasts.',
    images: ['/og-image.jpg'],
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

const PAGE_SIZE = 7;

export default async function HomePage() {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  let userName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('Profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();
    userName = profile?.full_name ?? user.user_metadata?.full_name ?? null;
  }

  // Fetch published stories
  const { data: stories } = await supabase
    .from('stories')
    .select(
     'id, slug, title, body, excerpt, author_id, author_name, author_avatar_url, voice_note_path, category, status, published_at'
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(PAGE_SIZE);

  // Fetch cover images
  const storyIds = (stories ?? []).map((s) => s.id);
  const { data: allMedia } = storyIds.length
    ? await supabase
        .from('story_media')
        .select('story_id, file_path, file_type, display_order')
        .in('story_id', storyIds)
        .order('display_order', { ascending: true })
    : { data: [] };

  // Fetch reaction counts
  const { data: reactionRows } = storyIds.length
    ? await supabase
        .from('story_reactions')
        .select('story_id')
        .in('story_id', storyIds)
    : { data: [] };

  // Fetch comment counts
  const { data: commentRows } = storyIds.length
    ? await supabase
        .from('story_comments')
        .select('story_id')
        .in('story_id', storyIds)
    : { data: [] };

  // Batch-fetch author profiles for avatar + title
  const authorIds = [...new Set((stories ?? []).map((s) => s.author_id))];
  const { data: authorProfiles } = authorIds.length
    ? await supabase
        .from('Profiles')
        .select('id, profile_image_url, title')
        .in('id', authorIds)
    : { data: [] };

  const authorProfileMap = new Map<string, { profile_image_url: string | null; title: string | null }>();
  const authorAvatarMap = new Map<string, string>();

  if (authorProfiles) {
    authorProfiles.forEach((p) => {
      authorProfileMap.set(p.id, { profile_image_url: p.profile_image_url, title: p.title });
    });

    await Promise.all(
      authorProfiles
        .filter((p) => p.profile_image_url)
        .map(async (p) => {
          const { data: signed } = await supabase.storage
            .from('user-media')
            .createSignedUrl(p.profile_image_url!, 3600);
          if (signed?.signedUrl) authorAvatarMap.set(p.id, signed.signedUrl);
        })
    );
  }

  // Build lookup maps
  type MediaRow = {
    story_id: string;
    file_path: string;
    file_type: string;
    display_order: number;
  };
  const mediaByStory = new Map<string, MediaRow[]>();
  ((allMedia ?? []) as MediaRow[]).forEach((m) => {
    if (!mediaByStory.has(m.story_id)) mediaByStory.set(m.story_id, []);
    mediaByStory.get(m.story_id)!.push(m);
  });

  const reactionMap = new Map<string, number>();
  ((reactionRows ?? []) as { story_id: string }[]).forEach((r) => {
    reactionMap.set(r.story_id, (reactionMap.get(r.story_id) ?? 0) + 1);
  });

  const commentMap = new Map<string, number>();
  ((commentRows ?? []) as { story_id: string }[]).forEach((c) => {
    commentMap.set(c.story_id, (commentMap.get(c.story_id) ?? 0) + 1);
  });

  // Fetch featured stories
  const { data: featuredRows } = await supabase
    .from('featured_stories')
    .select('feature_type, story_id, stories(id, slug, title, body, excerpt, author_id, author_name, author_avatar_url, voice_note_path, category, published_at)')
    .order('featured_at', { ascending: false });

  const featuredStoryIds = (featuredRows ?? []).map((f: any) => f.stories?.id).filter(Boolean);

  const { data: featuredMedia } = featuredStoryIds.length
    ? await supabase
        .from('story_media')
        .select('story_id, file_path, file_type, display_order')
        .in('story_id', featuredStoryIds)
        .order('display_order', { ascending: true })
    : { data: [] };

  const { data: featuredReactionRows } = featuredStoryIds.length
    ? await supabase.from('story_reactions').select('story_id').in('story_id', featuredStoryIds)
    : { data: [] };

  const { data: featuredCommentRows } = featuredStoryIds.length
    ? await supabase.from('story_comments').select('story_id').in('story_id', featuredStoryIds)
    : { data: [] };

  const featuredAuthorIds = [...new Set((featuredRows ?? []).map((f: any) => f.stories?.author_id).filter(Boolean))];
  const { data: featuredAuthorProfiles } = featuredAuthorIds.length
    ? await supabase.from('Profiles').select('id, profile_image_url, title').in('id', featuredAuthorIds)
    : { data: [] };

  const featuredAuthorAvatarMap = new Map<string, string>();
  const featuredAuthorProfileMap = new Map<string, { title: string | null }>();
  if (featuredAuthorProfiles) {
    featuredAuthorProfiles.forEach((p) => {
      featuredAuthorProfileMap.set(p.id, { title: p.title });
    });

    await Promise.all(
      featuredAuthorProfiles
        .filter((p) => p.profile_image_url)
        .map(async (p) => {
          if (authorAvatarMap.has(p.id)) {
            featuredAuthorAvatarMap.set(p.id, authorAvatarMap.get(p.id)!);
          } else {
            const { data: signed } = await supabase.storage.from('user-media').createSignedUrl(p.profile_image_url!, 3600);
            if (signed?.signedUrl) featuredAuthorAvatarMap.set(p.id, signed.signedUrl);
          }
        })
    );
  }

  const featuredMediaMap = new Map<string, MediaRow[]>();
  ((featuredMedia ?? []) as MediaRow[]).forEach((m) => {
    if (!featuredMediaMap.has(m.story_id)) featuredMediaMap.set(m.story_id, []);
    featuredMediaMap.get(m.story_id)!.push(m);
  });

  const featuredReactionMap = new Map<string, number>();
  ((featuredReactionRows ?? []) as { story_id: string }[]).forEach((r) => {
    featuredReactionMap.set(r.story_id, (featuredReactionMap.get(r.story_id) ?? 0) + 1);
  });

  const featuredCommentMap = new Map<string, number>();
  ((featuredCommentRows ?? []) as { story_id: string }[]).forEach((c) => {
    featuredCommentMap.set(c.story_id, (featuredCommentMap.get(c.story_id) ?? 0) + 1);
  });

  const featuredStories = (featuredRows ?? []).filter((f: any) => f.stories).map((f: any) => {
    const s = f.stories;
    const media = featuredMediaMap.get(s.id) ?? [];
    const coverMedia = media.find((m: MediaRow) => m.file_type?.startsWith('image/') || m.file_type?.startsWith('video/'));
    const publicUrl = coverMedia
      ? supabase.storage.from('story-media').getPublicUrl(coverMedia.file_path).data.publicUrl
      : null;
    const coverType = coverMedia
      ? (coverMedia.file_type.startsWith('video/') ? 'video' : 'image')
      : null;

    return {
      feature_type: f.feature_type,
      id: s.id,
      slug: s.slug,
      title: s.title,
      body: s.body,
      excerpt: s.excerpt ?? null,
      author_name: s.author_name,
      author_avatar_url: featuredAuthorAvatarMap.get(s.author_id) || s.author_avatar_url,
      author_title: featuredAuthorProfileMap.get(s.author_id)?.title || null,
      cover_url: publicUrl,
      cover_type: coverType as 'image' | 'video' | null,
      voice_note_path: s.voice_note_path ?? null,
      voice_note_duration: null as string | null,
      media_count: media.length,
      category: s.category ?? null,
      reaction_count: featuredReactionMap.get(s.id) ?? 0,
      comment_count: featuredCommentMap.get(s.id) ?? 0,
      published_at: s.published_at,
    };
  });

  // Assemble feed data
  const feedStories = (stories ?? []).map((s) => {
    const media = mediaByStory.get(s.id) ?? [];
    const coverMedia = media.find((m) => m.file_type?.startsWith('image/') || m.file_type?.startsWith('video/'));
    const publicUrl = coverMedia
      ? supabase.storage
          .from('story-media')
          .getPublicUrl(coverMedia.file_path).data.publicUrl
      : null;
    const coverType = coverMedia
      ? (coverMedia.file_type.startsWith('video/') ? 'video' : 'image')
      : null;

    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      body: s.body,
      excerpt: s.excerpt ?? null,
      author_name: s.author_name,
      author_avatar_url: authorAvatarMap.get(s.author_id) || s.author_avatar_url,
      author_title: authorProfileMap.get(s.author_id)?.title || null,
      cover_url: publicUrl,
      cover_type: coverType as 'image' | 'video' | null,
      voice_note_path: s.voice_note_path ?? null,
      voice_note_duration: null as string | null,
      media_count: media.length,
      category: s.category ?? null,
      reaction_count: reactionMap.get(s.id) ?? 0,
      comment_count: commentMap.get(s.id) ?? 0,
      published_at: s.published_at,
    };
  });

 // Trending — top 5 stories by reaction count (bounded to recent 50)
  const { data: trendingCandidates } = await supabase
    .from('stories')
    .select('id, slug, title')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50);

  const candidateIds = (trendingCandidates ?? []).map((s) => s.id);

  const { data: candidateReactionRows } = candidateIds.length
    ? await supabase
        .from('story_reactions')
        .select('story_id')
        .in('story_id', candidateIds)
    : { data: [] };

  const reactionRank = new Map<string, number>();
  ((candidateReactionRows ?? []) as { story_id: string }[]).forEach((r) => {
    reactionRank.set(r.story_id, (reactionRank.get(r.story_id) ?? 0) + 1);
  });

  const rankedStories = (trendingCandidates ?? [])
    .map((s) => ({ ...s, rCount: reactionRank.get(s.id) ?? 0 }))
    .sort((a, b) => b.rCount - a.rCount)
    .slice(0, 5);

  // Fetch covers + comment counts for trending
  const trendingIds = rankedStories.map((s) => s.id);

  const { data: trendingMedia } = trendingIds.length
    ? await supabase
        .from('story_media')
        .select('story_id, file_path, file_type, display_order')
        .in('story_id', trendingIds)
        .order('display_order', { ascending: true })
    : { data: [] };

  const { data: trendingCommentRows } = trendingIds.length
    ? await supabase
        .from('story_comments')
        .select('story_id')
        .in('story_id', trendingIds)
    : { data: [] };

  const trendingCoverMap = new Map<string, { url: string; type: 'image' | 'video' }>();
  ((trendingMedia ?? []) as MediaRow[]).forEach((m) => {
    if (!trendingCoverMap.has(m.story_id) && (m.file_type?.startsWith('image/') || m.file_type?.startsWith('video/'))) {
      trendingCoverMap.set(m.story_id, {
        url: supabase.storage.from('story-media').getPublicUrl(m.file_path).data.publicUrl,
        type: m.file_type.startsWith('video/') ? 'video' : 'image',
      });
    }
  });

  const trendingCommentMap = new Map<string, number>();
  ((trendingCommentRows ?? []) as { story_id: string }[]).forEach((c) => {
    trendingCommentMap.set(c.story_id, (trendingCommentMap.get(c.story_id) ?? 0) + 1);
  });

  const trendingStories = rankedStories.map((s) => {
    const cover = trendingCoverMap.get(s.id);
    return {
      slug: s.slug,
      title: s.title,
      coverUrl: cover?.url ?? null,
      coverType: (cover?.type ?? null) as 'image' | 'video' | null,
      reactionCount: s.rCount,
      commentCount: trendingCommentMap.get(s.id) ?? 0,
    };
  });

  // Popular topics
  const { data: topicCounts } = await supabase
    .from('stories')
    .select('category')
    .eq('status', 'published')
    .not('category', 'is', null);

  const topicMap = new Map<string, number>();
  (topicCounts ?? []).forEach((s) => {
    if (s.category) {
      topicMap.set(s.category, (topicMap.get(s.category) ?? 0) + 1);
    }
  });

  const TOPIC_LABELS: Record<string, string> = {
    family: 'Family',
    food_and_recipes: 'Recipes',
    childhood: 'Childhood',
    love: 'Love',
    life_lessons: 'Life Lessons',
    traditions: 'Traditions',
    travel: 'Travel',
  };

  const popularTopics = Array.from(topicMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => ({
      key,
      label: TOPIC_LABELS[key] ?? key,
      storyCount: count,
    }));

  return (
    <>
      {/* WebPage schema (WebSite + Organization entity nodes live in the root layout) */}
      <Script
        id="webpage-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Ancestorii — Stories from Real Families',
          description:
            'Browse real family memories — stories, voices, and moments shared by families around the world.',
          url: 'https://www.ancestorii.com/',
          isPartOf: { '@id': 'https://www.ancestorii.com/#website' },
        })}
      </Script>

      <div className="min-h-screen flex flex-col bg-white">
        <PublicNav />
        <main className="flex-1">
          <ExploreFeed
            initialStories={feedStories}
            featuredStories={featuredStories}
            trendingStories={trendingStories}
            popularTopics={popularTopics}
            isLoggedIn={isLoggedIn}
            pageSize={PAGE_SIZE}
            userName={userName}
          />
        </main>
        <PublicFooter />
      </div>
    </>
  );
}