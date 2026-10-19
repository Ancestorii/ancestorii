'use client';

import { useState, useCallback, useLayoutEffect, useRef } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import StoryFeed, { type FeedStory } from '@/components/stories/feed/StoryFeed';
import type { TrendingStory, PopularTopic } from '@/components/stories/feed/FeedSidebar';
import feed from '@/components/site/stories-browse/feed.module.css';

type MediaRow = { file_path: string; file_type: string; display_order: number };
type CountRow = { count: number };

// One query per page of stories: each comes with its media and its like and comment counts
// (PostgREST embeds), the same shape the server uses (src/lib/stories/publicFeed.ts).
const CARD_SELECT =
  'id, slug, title, body, excerpt, author_id, author_name, author_avatar_url, voice_note_path, category, published_at, ' +
  'story_media(file_path, file_type, display_order), ' +
  'reaction_count:story_reactions(count), comment_count:story_comments(count)';

type CardRow = {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string | null;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  voice_note_path: string | null;
  category: string | null;
  published_at: string | null;
  story_media: MediaRow[] | null;
  reaction_count: CountRow[] | null;
  comment_count: CountRow[] | null;
};

// Profile photos are signed for a week, as the server pages do, so the browser can keep them.
const AVATAR_TTL = 60 * 60 * 24 * 7;

export type FeaturedStory = FeedStory & { feature_type: string };

// Where the topic pills are on screen (top) and in the page (doc).
function tabsPosition(root: HTMLElement | null) {
  const tabs = root?.querySelector(`.${feed.tabs}`);
  if (!tabs) return null;
  const top = tabs.getBoundingClientRect().top;
  return { top, doc: top + window.scrollY };
}

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
  const rootRef = useRef<HTMLDivElement>(null);
  // Where the topic pills were just before a topic change re-rendered the feed; null when no
  // topic change is in flight. The hero above them changes height with the topic (and goes
  // when a topic has no stories), so the page is scrolled to keep the tapped pill under the
  // finger.
  const tabsBefore = useRef<{ top: number; doc: number } | null>(null);

 const fetchStories = useCallback(
    async (category: string, sort: string, offset: number = 0): Promise<FeedStory[]> => {
      let query = supabase.from('stories').select(CARD_SELECT).eq('status', 'published');

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      query = query.order('published_at', { ascending: false });
      query = query.range(offset, offset + pageSize - 1);

      const { data } = await query;

      if (!data) return [];
      const rows = data as unknown as CardRow[];

      // The authors' public cards (title, photo path) in one query
      const authorIds = [...new Set(rows.map((s) => s.author_id))];
      const { data: cards } = authorIds.length
        ? await supabase.from('profile_cards').select('id, profile_image_url, title').in('id', authorIds)
        : { data: [] as { id: string; profile_image_url: string | null; title: string | null }[] };

      const cardMap = new Map((cards ?? []).map((p) => [p.id, p]));

      // Every photo in one signing call
      const paths = [
        ...new Set((cards ?? []).map((p) => p.profile_image_url).filter((p): p is string => !!p)),
      ];
      const avatarByPath = new Map<string, string>();
      if (paths.length) {
        const { data: signed } = await supabase.storage
          .from('user-media')
          .createSignedUrls(paths, AVATAR_TTL);
        (signed ?? []).forEach((row, i) => {
          if (row.signedUrl) avatarByPath.set(row.path ?? paths[i], row.signedUrl);
        });
      }

      const results: FeedStory[] = rows.map((s) => {
        const storyMedia = [...(s.story_media ?? [])].sort((a, b) => a.display_order - b.display_order);
        const coverMedia = storyMedia.find((m) => m.file_type?.startsWith('image/') || m.file_type?.startsWith('video/'));
        const publicUrl = coverMedia
          ? supabase.storage.from('story-media').getPublicUrl(coverMedia.file_path).data.publicUrl
          : null;
        const coverType = coverMedia
          ? (coverMedia.file_type.startsWith('video/') ? 'video' : 'image')
          : null;
        const card = cardMap.get(s.author_id);
        const avatarPath = card?.profile_image_url;

        return {
          id: s.id,
          slug: s.slug,
          title: s.title,
          body: s.body,
          excerpt: s.excerpt ?? null,
          author_name: s.author_name,
          author_avatar_url: (avatarPath && avatarByPath.get(avatarPath)) || s.author_avatar_url,
          author_title: card?.title || null,
          cover_url: publicUrl,
          cover_type: coverType as 'image' | 'video' | null,
          voice_note_path: s.voice_note_path ?? null,
          voice_note_duration: null as string | null,
          media_count: storyMedia.length,
          category: s.category ?? null,
          reaction_count: s.reaction_count?.[0]?.count ?? 0,
          comment_count: s.comment_count?.[0]?.count ?? 0,
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
      // Touch screens only: the tapped pill stays under the finger. With a mouse the page
      // behaves as it always has.
      const keepPill = window.matchMedia('(hover: none), (pointer: coarse)').matches;
      tabsBefore.current = keepPill ? tabsPosition(rootRef.current) : null;
      setActiveCategory(key);
      setIsFiltering(true);
      const data = await fetchStories(key, sortBy, 0);
      // The reader may have scrolled while the stories loaded: start from where the pills are now.
      if (keepPill) tabsBefore.current = tabsPosition(rootRef.current);
      setStories(data);
      setHasMore(data.length >= pageSize);
      setIsFiltering(false);
    },
    [fetchStories, sortBy, pageSize]
  );

  // After the new hero renders, and again when the new stories arrive: if the pills moved in
  // the page (scrolling never does that, so the reader's own scroll is left alone), scroll by
  // how far they moved on screen, which allows for any scroll anchoring the browser did.
  // Before paint, and instant: html's scroll-behavior is auto (globals.css).
  useLayoutEffect(() => {
    const before = tabsBefore.current;
    if (!before) return;
    const now = tabsPosition(rootRef.current);
    if (now && Math.abs(now.doc - before.doc) >= 1 && now.top !== before.top) {
      window.scrollBy(0, now.top - before.top);
    }
    if (!isFiltering) tabsBefore.current = null;
  }, [activeCategory, stories, isFiltering]);

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
    <div ref={rootRef} className={isFiltering ? feed.filtering : ''}>
      {/* The topic pills sit under the hero, inside StoryFeed (onCategoryChange below). */}
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