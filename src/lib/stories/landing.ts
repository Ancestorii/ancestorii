import type { SupabaseClient } from '@supabase/supabase-js';

export type LandingStory = {
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  authorTitle: string | null;
  category: string | null;
  coverUrl: string | null;
  badge: 'Featured story' | 'Latest story' | 'Our Stories';
};

type StoryRow = {
  id: string;
  slug: string;
  title: string;
  body: string | null;
  excerpt: string | null;
  author_id: string;
  author_name: string | null;
  category: string | null;
};

type MediaRow = {
  story_id: string;
  file_path: string;
  file_type: string | null;
  display_order: number | null;
};

const STORY_FIELDS = 'id, slug, title, body, excerpt, author_id, author_name, category';

function plainText(html: string) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

function shorten(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

/**
 * Real published stories for the landing page's Our Stories section.
 * The lead is the most recently featured story (or, failing that, the newest story
 * with a photo); the rest are the newest stories, photo stories first.
 */
export async function getLandingStories(
  supabase: SupabaseClient,
  count = 5
): Promise<LandingStory[]> {
  const [{ data: featuredRows }, { data: latestRows }] = await Promise.all([
    supabase
      .from('featured_stories')
      .select('story_id')
      .order('featured_at', { ascending: false })
      .limit(1),
    supabase
      .from('stories')
      .select(STORY_FIELDS)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(12),
  ]);

  const latest = (latestRows ?? []) as StoryRow[];
  const featuredId: string | null = featuredRows?.[0]?.story_id ?? null;

  let featured: StoryRow | null = latest.find((s) => s.id === featuredId) ?? null;
  if (featuredId && !featured) {
    const { data } = await supabase
      .from('stories')
      .select(STORY_FIELDS)
      .eq('id', featuredId)
      .eq('status', 'published')
      .maybeSingle();
    featured = (data as StoryRow | null) ?? null;
  }

  const pool = featured ? [featured, ...latest.filter((s) => s.id !== featured!.id)] : latest;
  if (!pool.length) return [];

  const ids = pool.map((s) => s.id);
  const authorIds = [...new Set(pool.map((s) => s.author_id).filter(Boolean))];

  const [{ data: mediaRows }, { data: profileRows }] = await Promise.all([
    supabase
      .from('story_media')
      .select('story_id, file_path, file_type, display_order')
      .in('story_id', ids)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true }),
    authorIds.length
      ? supabase.from('profile_cards').select('id, title').in('id', authorIds)
      : Promise.resolve({ data: [] as { id: string; title: string | null }[] }),
  ]);

  const coverByStory = new Map<string, string>();
  ((mediaRows ?? []) as MediaRow[]).forEach((m) => {
    if (coverByStory.has(m.story_id) || !m.file_type?.startsWith('image/')) return;
    const { data } = supabase.storage.from('story-media').getPublicUrl(m.file_path);
    coverByStory.set(m.story_id, data.publicUrl);
  });

  const titleByAuthor = new Map<string, string>();
  ((profileRows ?? []) as { id: string; title: string | null }[]).forEach((p) => {
    const title = p.title?.trim();
    if (title) titleByAuthor.set(p.id, title);
  });

  const withCover = (s: StoryRow) => coverByStory.has(s.id);
  const lead =
    featured && withCover(featured) ? featured : pool.find(withCover) ?? pool[0];
  const rest = pool.filter((s) => s.id !== lead.id);
  const ordered = [lead, ...rest.filter(withCover), ...rest.filter((s) => !withCover(s))].slice(
    0,
    count
  );

  return ordered.map((s, i) => {
    // A one-line subtitle ("My special birthday") sells nothing: use the story's opening instead.
    const own = s.excerpt?.trim() ?? '';
    const excerpt = own.length >= 40 ? shorten(own, 140) : shorten(plainText(s.body ?? ''), 140) || own;
    let badge: LandingStory['badge'] = 'Our Stories';
    if (i === 0) {
      if (featured && s.id === featured.id) badge = 'Featured story';
      else if (s.id === latest[0]?.id) badge = 'Latest story';
    }
    return {
      slug: s.slug,
      title: s.title?.trim() || 'Untitled story',
      excerpt,
      authorName: s.author_name?.trim() || 'A family member',
      authorTitle: titleByAuthor.get(s.author_id) ?? null,
      category: s.category,
      coverUrl: coverByStory.get(s.id) ?? null,
      badge,
    };
  });
}
