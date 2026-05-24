'use client';

import { useState, useCallback } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import CategoryTabs from '@/components/stories/feed/CategoryTabs';
import StoryFeed, { type FeedStory } from '@/components/stories/feed/StoryFeed';
import type { TrendingStory, PopularTopic } from '@/components/stories/feed/FeedSidebar';

type StoryMediaRow = {
  story_id: string;
  file_path: string;
  file_type: string;
  display_order: number;
};

export type FeaturedStory = FeedStory & { feature_type: string };

export default function ExploreFeed({
  initialStories,
  featuredStories,
  trendingStories,
  popularTopics,
  isLoggedIn,
  pageSize,
  userName,
}: {
  initialStories: FeedStory[];
  featuredStories: FeaturedStory[];
  trendingStories: TrendingStory[];
  popularTopics: PopularTopic[];
  isLoggedIn: boolean;
  pageSize: number;
  userName?: string | null;
}) {
  const supabase = getBrowserClient();
  const [stories, setStories] = useState<FeedStory[]>(initialStories);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [hasMore, setHasMore] = useState(initialStories.length >= pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

 const fetchStories = useCallback(
    async (category: string, sort: string, offset: number = 0) => {
      let query = supabase
        .from('stories')
        .select('id, slug, title, body, excerpt, author_id, author_name, author_avatar_url, voice_note_path, category, published_at')
        .eq('status', 'published');

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      query = query.order('published_at', { ascending: false });
      query = query.range(offset, offset + pageSize - 1);

      const { data } = await query;

      if (!data) return [];

      const ids = data.map((s) => s.id);

      // Fetch media, reactions, and comments in parallel
      const [{ data: media }, { data: reactionRows }, { data: commentRows }] = await Promise.all([
        ids.length
          ? supabase
              .from('story_media')
              .select('story_id, file_path, file_type, display_order')
              .in('story_id', ids)
              .order('display_order', { ascending: true })
          : { data: [] },
        ids.length
          ? supabase
              .from('story_reactions')
              .select('story_id')
              .in('story_id', ids)
          : { data: [] },
        ids.length
          ? supabase
              .from('story_comments')
              .select('story_id')
              .in('story_id', ids)
          : { data: [] },
      ]);

      const mediaByStory = new Map<string, StoryMediaRow[]>();
      ((media ?? []) as StoryMediaRow[]).forEach((m) => {
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

      // Batch-fetch profiles for avatar + title
      const authorIds = [...new Set(data.map((s) => s.author_id))];
      const { data: profiles } = authorIds.length
        ? await supabase
            .from('Profiles')
            .select('id, full_name, profile_image_url, title')
            .in('id', authorIds)
        : { data: [] };

      const profileMap = new Map<string, { profile_image_url: string | null; title: string | null }>();
      const signedUrlMap = new Map<string, string>();

      if (profiles) {
        const signPromises = profiles
          .filter((p) => p.profile_image_url)
          .map(async (p) => {
            const { data: signed } = await supabase.storage
              .from('user-media')
              .createSignedUrl(p.profile_image_url!, 3600);
            if (signed?.signedUrl) signedUrlMap.set(p.id, signed.signedUrl);
          });
        await Promise.all(signPromises);

        profiles.forEach((p) => {
          profileMap.set(p.id, { profile_image_url: p.profile_image_url, title: p.title });
        });
      }

      let results = data.map((s) => {
        const storyMedia = mediaByStory.get(s.id) ?? [];
        const coverMedia = storyMedia.find((m) => m.file_type?.startsWith('image/') || m.file_type?.startsWith('video/'));
        const publicUrl = coverMedia
          ? supabase.storage.from('story-media').getPublicUrl(coverMedia.file_path).data.publicUrl
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
          author_avatar_url: signedUrlMap.get(s.author_id) || s.author_avatar_url,
          author_title: profileMap.get(s.author_id)?.title || null,
          cover_url: publicUrl,
          cover_type: coverType as 'image' | 'video' | null,
          voice_note_path: s.voice_note_path ?? null,
          voice_note_duration: null as string | null,
          media_count: storyMedia.length,
          category: s.category ?? null,
          reaction_count: reactionMap.get(s.id) ?? 0,
          comment_count: commentMap.get(s.id) ?? 0,
          published_at: s.published_at,
        };
      });

      // Sort client-side for popular/discussed
      if (sort === 'popular') {
        results.sort((a, b) => b.reaction_count - a.reaction_count);
      } else if (sort === 'discussed') {
        results.sort((a, b) => b.comment_count - a.comment_count);
      }

      return results;
    },
    [supabase, pageSize]
  );

  const handleCategoryChange = useCallback(
    async (key: string) => {
      setActiveCategory(key);
      setIsFiltering(true);
      const data = await fetchStories(key, sortBy, 0);
      setStories(data);
      setHasMore(data.length >= pageSize);
      setIsFiltering(false);
    },
    [fetchStories, sortBy, pageSize]
  );

  const handleSortChange = useCallback(
    async (value: string) => {
      setSortBy(value);
      setIsFiltering(true);
      const data = await fetchStories(activeCategory, value, 0);
      setStories(data);
      setHasMore(data.length >= pageSize);
      setIsFiltering(false);
    },
    [fetchStories, activeCategory, pageSize]
  );

  const handleLoadMore = useCallback(async () => {
    setIsLoadingMore(true);
    const data = await fetchStories(activeCategory, sortBy, stories.length);
    setStories((prev) => [...prev, ...data]);
    setHasMore(data.length >= pageSize);
    setIsLoadingMore(false);
  }, [fetchStories, activeCategory, sortBy, stories.length, pageSize]);

  return (
    <div className={isFiltering ? 'opacity-60 transition-opacity pointer-events-none' : ''}>
      <CategoryTabs active={activeCategory} onChange={handleCategoryChange} />
      <StoryFeed
        stories={stories}
        featuredStories={featuredStories}
        trendingStories={trendingStories}
        popularTopics={popularTopics}
        isLoggedIn={isLoggedIn}
        sortBy={sortBy}
        activeCategory={activeCategory}
        onSortChange={handleSortChange}
        onCategoryChange={handleCategoryChange}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
        userName={userName}
      />
    </div>
  );
}