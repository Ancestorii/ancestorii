import 'server-only';
import { unstable_cache } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FeedStory } from '@/components/stories/feed/StoryFeed';
import type { PopularTopic, TrendingStory } from '@/components/stories/feed/FeedSidebar';
import { getTopicByKey } from './topics';
import { getPublicClient } from './publicClient';

// The public lists of Our Stories (the feed, a topic's stories, the topic counts), read once and
// shared by every visitor for a minute. Each list is one query: a story comes with its media and
// its like and comment counts (PostgREST embeds), so a page no longer runs three follow-up
// queries per list. Pages add the reader's own bits (name, own like) beside these.

export const FEED_PAGE_SIZE = 7;
export const TOPIC_PAGE_SIZE = 24;
const TRENDING_POOL = 50;
const REVALIDATE = 60;
/** The cache tag behind every list here; app/stories/revalidate.ts drops it after a publish or delete. */
export const STORIES_TAG = 'stories';

export const CARD_SELECT = `
  id, slug, title, body, excerpt, author_id, author_name, author_avatar_url, voice_note_path, category, published_at,
  story_media(file_path, file_type, display_order),
  reaction_count:story_reactions(count),
  comment_count:story_comments(count)
`;

const TRENDING_SELECT = `
  id, slug, title,
  story_media(file_path, file_type, display_order),
  reaction_count:story_reactions(count),
  comment_count:story_comments(count)
`;

export type MediaRow = { file_path: string; file_type: string; display_order: number };
export type CountRow = { count: number };

export type CardRow = {
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

type TrendingRow = Pick<
  CardRow,
  'id' | 'slug' | 'title' | 'story_media' | 'reaction_count' | 'comment_count'
>;

type FeaturedRow = { feature_type: string; story: CardRow | null };

/** A row of the public profile_cards view (the parts of a profile other people may see). */
export type ProfileCard = {
  id: string;
  full_name: string | null;
  title: string | null;
  bio: string | null;
  location: string | null;
  profile_image_url: string | null;
};

/** A feed card whose author photo is still a storage path (`avatar_path`); the page signs it. */
export type PublicCard = FeedStory & { avatar_path: string | null };

export type PublicFeed = {
  stories: PublicCard[];
  featured: (PublicCard & { feature_type: string })[];
  trending: TrendingStory[];
  popularTopics: PopularTopic[];
};

export function countOf(rows: CountRow[] | null | undefined): number {
  return rows?.[0]?.count ?? 0;
}

export function sortMedia(media: MediaRow[] | null | undefined): MediaRow[] {
  return [...(media ?? [])].sort((a, b) => a.display_order - b.display_order);
}

/** story-media is a public bucket by design: a plain URL, no network call. */
export function publicMediaUrl(path: string): string {
  return getPublicClient().storage.from('story-media').getPublicUrl(path).data.publicUrl;
}

export function coverOf(media: MediaRow[]): { url: string; type: 'image' | 'video' } | null {
  const cover = media.find(
    (m) => m.file_type?.startsWith('image/') || m.file_type?.startsWith('video/')
  );
  if (!cover) return null;
  return {
    url: publicMediaUrl(cover.file_path),
    type: cover.file_type.startsWith('video/') ? 'video' : 'image',
  };
}

/** The public cards (name, title, photo path) of a set of people, in one query. */
export async function loadProfileCards(
  supabase: SupabaseClient,
  ids: Iterable<string | null | undefined>
): Promise<Map<string, ProfileCard>> {
  const unique = [...new Set([...ids].filter((id): id is string => !!id))];
  const map = new Map<string, ProfileCard>();
  if (!unique.length) return map;
  const { data } = await supabase
    .from('profile_cards')
    .select('id, full_name, title, bio, location, profile_image_url')
    .in('id', unique);
  ((data ?? []) as ProfileCard[]).forEach((p) => map.set(p.id, p));
  return map;
}

export function toCard(row: CardRow, cards: Map<string, ProfileCard>): PublicCard {
  const media = sortMedia(row.story_media);
  const cover = coverOf(media);
  const card = cards.get(row.author_id);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    body: row.body,
    excerpt: row.excerpt ?? null,
    author_name: row.author_name,
    // The snapshot taken when the story was written; the page swaps in the signed photo.
    author_avatar_url: row.author_avatar_url,
    author_title: card?.title || null,
    cover_url: cover?.url ?? null,
    cover_type: cover?.type ?? null,
    voice_note_path: row.voice_note_path ?? null,
    voice_note_duration: null,
    media_count: media.length,
    category: row.category ?? null,
    reaction_count: countOf(row.reaction_count),
    comment_count: countOf(row.comment_count),
    published_at: row.published_at,
    avatar_path: card?.profile_image_url ?? null,
  };
}

/** Puts each card's signed author photo in place of its path (see avatars.ts for the signing). */
export function applyAvatars<T extends PublicCard>(
  cards: T[],
  avatars: Map<string, string>
): Omit<T, 'avatar_path'>[] {
  return cards.map(({ avatar_path, ...card }) => ({
    ...card,
    author_avatar_url: (avatar_path && avatars.get(avatar_path)) || card.author_avatar_url,
  }));
}

/**
 * The /stories page's lists: the newest stories, the featured stories, the five most loved of
 * the last fifty, and the busiest topics. Two round trips on a miss (the lists, then the
 * authors' cards); none for the next minute.
 */
export const getPublicFeed = unstable_cache(
  async (): Promise<PublicFeed> => {
    const supabase = getPublicClient();

    const [latestRes, featuredRes, poolRes, topicRes] = await Promise.all([
      supabase
        .from('stories')
        .select(CARD_SELECT)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(FEED_PAGE_SIZE),
      supabase
        .from('featured_stories')
        .select(`feature_type, story:stories(${CARD_SELECT})`)
        .order('featured_at', { ascending: false }),
      supabase
        .from('stories')
        .select(TRENDING_SELECT)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(TRENDING_POOL),
      supabase.from('stories').select('category').eq('status', 'published').not('category', 'is', null),
    ]);

    // A failed main list is thrown, not kept as an empty feed for a minute.
    if (latestRes.error) throw new Error(`Could not load the stories: ${latestRes.error.message}`);

    const latest = (latestRes.data ?? []) as unknown as CardRow[];
    // A featured story that is no longer published comes back without its story.
    const featuredRows = ((featuredRes.data ?? []) as unknown as FeaturedRow[]).filter(
      (f): f is FeaturedRow & { story: CardRow } => !!f.story
    );

    const cards = await loadProfileCards(
      supabase,
      [...latest, ...featuredRows.map((f) => f.story)].map((s) => s.author_id)
    );

    const trending: TrendingStory[] = ((poolRes.data ?? []) as unknown as TrendingRow[])
      .map((s) => ({ s, likes: countOf(s.reaction_count) }))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5)
      .map(({ s, likes }) => {
        const cover = coverOf(sortMedia(s.story_media));
        return {
          slug: s.slug,
          title: s.title,
          coverUrl: cover?.url ?? null,
          coverType: cover?.type ?? null,
          reactionCount: likes,
          commentCount: countOf(s.comment_count),
        };
      });

    const topicMap = new Map<string, number>();
    ((topicRes.data ?? []) as { category: string | null }[]).forEach((s) => {
      if (s.category) topicMap.set(s.category, (topicMap.get(s.category) ?? 0) + 1);
    });
    const popularTopics: PopularTopic[] = [...topicMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => ({
        key,
        label: getTopicByKey(key)?.navLabel ?? key,
        storyCount: count,
      }));

    return {
      stories: latest.map((row) => toCard(row, cards)),
      featured: featuredRows.map((f) => ({ ...toCard(f.story, cards), feature_type: f.feature_type })),
      trending,
      popularTopics,
    };
  },
  ['stories-public-feed'],
  { revalidate: REVALIDATE, tags: [STORIES_TAG] }
);

/** A topic page's stories (stories.category = topicKey), newest first. */
export const getTopicFeed = unstable_cache(
  async (topicKey: string): Promise<{ stories: PublicCard[] }> => {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from('stories')
      .select(CARD_SELECT)
      .eq('status', 'published')
      .eq('category', topicKey)
      .order('published_at', { ascending: false })
      .limit(TOPIC_PAGE_SIZE);
    if (error) throw new Error(`Could not load the ${topicKey} stories: ${error.message}`);

    const rows = (data ?? []) as unknown as CardRow[];
    const cards = await loadProfileCards(supabase, rows.map((r) => r.author_id));
    return { stories: rows.map((row) => toCard(row, cards)) };
  },
  ['stories-topic-feed'],
  { revalidate: REVALIDATE, tags: [STORIES_TAG] }
);

/** How many published stories each topic has, for the topics index. */
export const getTopicCounts = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const { data } = await getPublicClient()
      .from('stories')
      .select('category')
      .eq('status', 'published')
      .not('category', 'is', null);
    const counts: Record<string, number> = {};
    ((data ?? []) as { category: string | null }[]).forEach((r) => {
      if (r.category) counts[r.category] = (counts[r.category] ?? 0) + 1;
    });
    return counts;
  },
  ['stories-topic-counts'],
  { revalidate: REVALIDATE, tags: [STORIES_TAG] }
);
