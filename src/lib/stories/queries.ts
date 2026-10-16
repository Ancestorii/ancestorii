import { SupabaseClient } from '@supabase/supabase-js';
import type { StoryComment, Notification } from './types';

/**
 * Fetch comments for a story.
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

  const { data: profiles } = await supabase
    .from('Profiles')
    .select('id, full_name, profile_image_url, title')
    .in('id', userIds);

  if (!profiles) return comments;

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const enriched = await Promise.all(
    comments.map(async (comment) => {
      const profile = profileMap.get(comment.user_id);
      if (!profile) return { ...comment, author_title: null };

      let avatarUrl = comment.author_avatar_url;
      if (profile.profile_image_url) {
        const { data: signed } = await supabase.storage
          .from('user-media')
          .createSignedUrl(profile.profile_image_url, 3600);
        if (signed?.signedUrl) avatarUrl = signed.signedUrl;
      }

      return {
        ...comment,
        author_name: profile.full_name || comment.author_name,
        author_avatar_url: avatarUrl,
        author_title: profile.title || null,
      };
    })
  );

  return enriched;
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

  // Enrich memory notifications with memory titles
  const memoryTypes = ['memory_reaction', 'memory_comment', 'memory_addition', 'prompt_answered'];
  const memoryNotifs = (data as any[]).filter(
    (n) => memoryTypes.includes(n.type) && n.target_id && n.target_type === 'family_memory'
  );
  const memoryIds = [...new Set(memoryNotifs.map((n) => n.target_id))];

  const memoryTitleMap = new Map<string, string>();
  if (memoryIds.length > 0) {
    const { data: memories } = await supabase
      .from('family_memories')
      .select('id, title')
      .in('id', memoryIds);
    if (memories) {
      (memories as any[]).forEach((m) => memoryTitleMap.set(m.id, m.title));
    }
  }

  return (data as any[]).map((n) => ({
    ...n,
    story_title: n.stories?.title ?? memoryTitleMap.get(n.target_id) ?? null,
    stories: undefined,
  }));
}