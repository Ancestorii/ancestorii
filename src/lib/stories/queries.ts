import { SupabaseClient } from '@supabase/supabase-js';
import type { Story, StoryMedia, StoryWithCounts, StoryComment, Notification } from './types';

/**
 * Fetch published stories for the feed, newest first.
 * Includes reaction/comment/share counts and first media item.
 */
export async function getPublishedStories(
  supabase: SupabaseClient,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}
): Promise<StoryWithCounts[]> {
  const { data: stories, error } = await supabase
    .from('stories')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !stories) return [];

  const enriched = await Promise.all(
    stories.map(async (story: Story) => {
      const [
        { data: media },
        { count: reactionCount },
        { count: commentCount },
        { count: shareCount },
      ] = await Promise.all([
        supabase
          .from('story_media')
          .select('*')
          .eq('story_id', story.id)
          .order('display_order', { ascending: true })
          .limit(3),
        supabase
          .from('story_reactions')
          .select('*', { count: 'exact', head: true })
          .eq('story_id', story.id),
        supabase
          .from('story_comments')
          .select('*', { count: 'exact', head: true })
          .eq('story_id', story.id),
        supabase
          .from('story_shares')
          .select('*', { count: 'exact', head: true })
          .eq('story_id', story.id),
      ]);

      return {
        ...story,
        media: (media as StoryMedia[]) || [],
        reaction_count: reactionCount || 0,
        comment_count: commentCount || 0,
        share_count: shareCount || 0,
      };
    })
  );

  return enriched;
}

/**
 * Fetch a single story by slug, with full media and counts.
 */
export async function getStoryBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<(StoryWithCounts & { user_has_reacted?: boolean }) | null> {
  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !story) return null;

  const [
    { data: media },
    { count: reactionCount },
    { count: commentCount },
    { count: shareCount },
  ] = await Promise.all([
    supabase
      .from('story_media')
      .select('*')
      .eq('story_id', story.id)
      .order('display_order', { ascending: true }),
    supabase
      .from('story_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('story_id', story.id),
    supabase
      .from('story_comments')
      .select('*', { count: 'exact', head: true })
      .eq('story_id', story.id),
    supabase
      .from('story_shares')
      .select('*', { count: 'exact', head: true })
      .eq('story_id', story.id),
  ]);

  return {
    ...story,
    media: (media as StoryMedia[]) || [],
    reaction_count: reactionCount || 0,
    comment_count: commentCount || 0,
    share_count: shareCount || 0,
  };
}

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
 * Check if the current user has reacted to a story.
 */
export async function hasUserReacted(
  supabase: SupabaseClient,
  storyId: string,
  userId: string
): Promise<boolean> {
  const { count } = await supabase
    .from('story_reactions')
    .select('*', { count: 'exact', head: true })
    .eq('story_id', storyId)
    .eq('user_id', userId);

  return (count || 0) > 0;
}

/**
 * Fetch user's drafts.
 */
export async function getMyDrafts(
  supabase: SupabaseClient
): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('status', 'draft')
    .order('updated_at', { ascending: false });

  if (error || !data) return [];
  return data as Story[];
}

/**
 * Fetch user's published stories.
 */
export async function getMyPublishedStories(
  supabase: SupabaseClient
): Promise<Story[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return [];

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('author_id', auth.user.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error || !data) return [];
  return data as Story[];
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

  return (data as any[]).map((n) => ({
    ...n,
    story_title: n.stories?.title ?? null,
    stories: undefined,
  }));
}