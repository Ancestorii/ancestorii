import { SupabaseClient } from '@supabase/supabase-js';
import type { StoryComment, Notification } from './types';

// Profile photos are signed for a week, as the server pages do, so a browser can keep them.
const AVATAR_TTL = 60 * 60 * 24 * 7;

/**
 * Fetch comments for a story, with each writer's current name, title and photo. Three round
 * trips: the comments, the writers' public cards, one signing call for every photo.
 */
export async function getStoryComments(
  supabase: SupabaseClient,
  storyId: string
): Promise<StoryComment[]> {
  const { data, error } = await supabase
    .from('story_comments')
    .select('*')
    .eq('story_id', storyId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  const comments = data as StoryComment[];
  const userIds = [...new Set(comments.map((c) => c.user_id))];

  if (userIds.length === 0) return comments;

  const { data: cards } = await supabase
    .from('profile_cards')
    .select('id, full_name, profile_image_url, title')
    .in('id', userIds);

  if (!cards) return comments;

  const cardMap = new Map(cards.map((p) => [p.id, p]));

  const paths = [
    ...new Set(cards.map((p) => p.profile_image_url).filter((p): p is string => !!p)),
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

  return comments.map((comment) => {
    const card = cardMap.get(comment.user_id);
    if (!card) return { ...comment, author_title: null };
    return {
      ...comment,
      author_name: card.full_name || comment.author_name,
      author_avatar_url:
        (card.profile_image_url && avatarByPath.get(card.profile_image_url)) ||
        comment.author_avatar_url,
      author_title: card.title || null,
    };
  });
}

/**
 * Fetch unread notification count.
 */
export async function getUnreadNotificationCount(
  supabase: SupabaseClient
): Promise<number> {
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  return count || 0;
}

/**
 * Fetch recent notifications.
 */
export async function getRecentNotifications(
  supabase: SupabaseClient,
  limit = 20
): Promise<(Notification & { story_title?: string | null })[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, stories(title)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  // Enrich memory and capsule notifications with their titles (side by side)
  const memoryTypes = ['memory_reaction', 'memory_comment', 'memory_addition', 'prompt_answered'];
  const rows = data as unknown as (Notification & { stories: { title: string | null } | null })[];
  const memoryIds = [
    ...new Set(
      rows
        .filter((n) => memoryTypes.includes(n.type) && n.target_id && n.target_type === 'family_memory')
        .map((n) => n.target_id as string)
    ),
  ];
  const capsuleIds = [
    ...new Set(
      rows.filter((n) => n.type === 'capsule_unlocked' && n.target_id).map((n) => n.target_id as string)
    ),
  ];

  const [{ data: memories }, { data: capsules }] = await Promise.all([
    memoryIds.length
      ? supabase.from('family_memories').select('id, title').in('id', memoryIds)
      : { data: [] as { id: string; title: string }[] },
    capsuleIds.length
      ? supabase.from('memory_capsules').select('id, title').in('id', capsuleIds)
      : { data: [] as { id: string; title: string }[] },
  ]);

  const titleMap = new Map<string, string>();
  ((memories ?? []) as { id: string; title: string }[]).forEach((m) => titleMap.set(m.id, m.title));
  ((capsules ?? []) as { id: string; title: string }[]).forEach((c) => titleMap.set(c.id, c.title));

  return rows.map(({ stories, ...n }) => ({
    ...n,
    story_title: stories?.title ?? (n.target_id ? titleMap.get(n.target_id) : null) ?? null,
  }));
}
