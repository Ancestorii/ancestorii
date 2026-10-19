import 'server-only';
import { cache } from 'react';
import { getPublicClient } from './publicClient';
import { countOf, publicMediaUrl, sortMedia, type CountRow, type MediaRow } from './publicFeed';
import type { Story, StoryComment } from './types';

// The public story page's reads. Not kept between requests (its counts and comments should be
// as fresh as the page), but shaped so the page needs three round trips instead of fifteen.

const STORY_SELECT = `
  *,
  story_media(id, file_path, file_type, display_order),
  comments:story_comments(*),
  reaction_count:story_reactions(count)
`;

const RELATED_SELECT = `
  id, slug, title,
  story_media(file_path, file_type, display_order),
  reaction_count:story_reactions(count),
  comment_count:story_comments(count)
`;

const RELATED_LIMIT = 4;

export type StoryMediaRow = MediaRow & { id: string };

export type PublicStory = Story & {
  media: StoryMediaRow[];
  /** Oldest first, straight from the table (names and photos are added by the page). */
  comments: StoryComment[];
  reaction_count: number;
};

export type RelatedStory = {
  slug: string;
  title: string;
  coverUrl: string | null;
  reactionCount: number;
  commentCount: number;
};

type StoryRow = Story & {
  story_media: StoryMediaRow[] | null;
  comments: StoryComment[] | null;
  reaction_count: CountRow[] | null;
};

type RelatedRow = {
  id: string;
  slug: string;
  title: string;
  story_media: MediaRow[] | null;
  reaction_count: CountRow[] | null;
  comment_count: CountRow[] | null;
};

/**
 * The published story at a slug with its media, its comments and its like count, in one query.
 * React's cache() shares the result between generateMetadata and the page within a request.
 * A failed query throws (a blip must never read as a missing story); no such story is null.
 */
export const getPublicStory = cache(async (slug: string): Promise<PublicStory | null> => {
  const { data, error } = await getPublicClient()
    .from('stories')
    .select(STORY_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw new Error(`Could not load story "${slug}": ${error.message}`);
  if (!data) return null;

  const { story_media, comments, reaction_count, ...story } = data as unknown as StoryRow;
  return {
    ...story,
    media: sortMedia(story_media) as StoryMediaRow[],
    comments: [...(comments ?? [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
    reaction_count: countOf(reaction_count),
  };
});

/**
 * Four more stories for the foot of the page: the same topic first, the newest stories after
 * that. Both lists are read side by side and merged, so there is no second trip to backfill.
 */
export async function loadRelatedStories(
  storyId: string,
  category: string | null
): Promise<RelatedStory[]> {
  const supabase = getPublicClient();
  const latest = () =>
    supabase
      .from('stories')
      .select(RELATED_SELECT)
      .eq('status', 'published')
      .neq('id', storyId)
      .order('published_at', { ascending: false });

  const [sameTopic, newest] = await Promise.all([
    category ? latest().eq('category', category).limit(RELATED_LIMIT) : { data: [] as RelatedRow[] },
    latest().limit(RELATED_LIMIT * 2),
  ]);

  const seen = new Set<string>();
  const rows: RelatedRow[] = [];
  for (const row of [...(sameTopic.data ?? []), ...(newest.data ?? [])] as RelatedRow[]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    rows.push(row);
    if (rows.length === RELATED_LIMIT) break;
  }

  return rows.map((row) => {
    const cover = sortMedia(row.story_media).find((m) => m.file_type?.startsWith('image/'));
    return {
      slug: row.slug,
      title: row.title,
      coverUrl: cover ? publicMediaUrl(cover.file_path) : null,
      reactionCount: countOf(row.reaction_count),
      commentCount: countOf(row.comment_count),
    };
  });
}
