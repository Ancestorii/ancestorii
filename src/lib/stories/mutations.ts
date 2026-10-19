import { SupabaseClient } from '@supabase/supabase-js';
import { uniqueSlug } from './slugify';
import type { Story } from './types';

// These run in the browser. The signed-in user's id comes from the local session (no round trip
// to Auth); RLS is what decides whether a write is allowed.
async function sessionUserId(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

/**
 * Create a new story (always starts as draft, immediately published by the editor).
 */
export async function createStory(
  supabase: SupabaseClient,
  {
    title,
    body,
    voiceNotePath,
    category,
    excerpt,
  }: {
    title: string;
    body: string;
    voiceNotePath?: string;
    category?: string | null;
    excerpt?: string | null;
  }
): Promise<Story | null> {
  const userId = await sessionUserId(supabase);
  if (!userId) return null;

  const { data: profile } = await supabase
    .from('Profiles')
    .select('full_name, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  // Two goes: a slug clash (one chance in two billion) gets a fresh suffix.
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, error } = await supabase
      .from('stories')
      .insert({
        author_id: userId,
        author_name: profile?.full_name || 'Anonymous',
        author_avatar_url: profile?.avatar_url || null,
        title,
        body,
        slug: uniqueSlug(title),
        voice_note_path: voiceNotePath || null,
        category: category || null,
        excerpt: excerpt || null,
        status: 'draft',
      })
      .select()
      .single();

    if (!error) return data as Story;
    if (error.code !== '23505') return null;
  }
  return null;
}

/**
 * Update an existing story.
 */
export async function updateStory(
  supabase: SupabaseClient,
  storyId: string,
  updates: {
    title?: string;
    body?: string;
    voice_note_path?: string | null;
    category?: string | null;
    excerpt?: string | null;
  }
): Promise<boolean> {
  const { data, error } = await supabase
    .from('stories')
    .update(updates)
    .eq('id', storyId)
    .select('id');

  // RLS turns a write by anyone but the author into 0 rows, not an error.
  return !error && (data?.length ?? 0) > 0;
}

/**
 * Delete a story. True only if a row really went (RLS blocks silently otherwise).
 */
export async function deleteStory(
  supabase: SupabaseClient,
  storyId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('stories')
    .delete()
    .eq('id', storyId)
    .select('id');

  return !error && (data?.length ?? 0) > 0;
}

/**
 * Toggle a reaction (like/unlike). Reports the state the row is really in afterwards.
 */
export async function toggleReaction(
  supabase: SupabaseClient,
  storyId: string
): Promise<{ reacted: boolean }> {
  const userId = await sessionUserId(supabase);
  if (!userId) return { reacted: false };

  const { data: existing } = await supabase
    .from('story_reactions')
    .select('id')
    .eq('story_id', storyId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    const { data: removed, error } = await supabase
      .from('story_reactions')
      .delete()
      .eq('id', existing.id)
      .select('id');
    // Still liked if the row could not be removed.
    return { reacted: !!error || (removed?.length ?? 0) === 0 };
  }

  const { error } = await supabase
    .from('story_reactions')
    .insert({
      story_id: storyId,
      user_id: userId,
      reaction_type: 'like',
    });

  // A second click that raced the first finds the row already there: liked all the same.
  return { reacted: !error || error.code === '23505' };
}

/**
 * Add a comment to a story.
 */
export async function addComment(
  supabase: SupabaseClient,
  storyId: string,
  content: string,
  parentId?: string | null
): Promise<boolean> {
  const userId = await sessionUserId(supabase);
  if (!userId) return false;

  const { data: profile } = await supabase
    .from('Profiles')
    .select('full_name, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  const { error } = await supabase
    .from('story_comments')
    .insert({
      story_id: storyId,
      user_id: userId,
      author_name: profile?.full_name || 'Anonymous',
      author_avatar_url: profile?.avatar_url || null,
      content,
      parent_id: parentId || null,
    });

  return !error;
}

/**
 * Delete a comment. True only if a row really went (RLS blocks silently otherwise).
 */
export async function deleteComment(
  supabase: SupabaseClient,
  commentId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('story_comments')
    .delete()
    .eq('id', commentId)
    .select('id');

  return !error && (data?.length ?? 0) > 0;
}

/**
 * Log a share event.
 */
export async function logShare(
  supabase: SupabaseClient,
  storyId: string,
  platform: string
): Promise<boolean> {
  const userId = await sessionUserId(supabase);

  const { error } = await supabase
    .from('story_shares')
    .insert({
      story_id: storyId,
      user_id: userId,
      platform,
    });

  return !error;
}

/**
 * Mark a notification as read.
 */
export async function markNotificationRead(
  supabase: SupabaseClient,
  notificationId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  return !error;
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsRead(
  supabase: SupabaseClient
): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);

  return !error;
}

/**
 * Upload a story photo or video to storage and record it. Returns the new story_media row's id
 * and the storage path, or null if either step failed (an uploaded file nobody points at is
 * removed again).
 */
export async function uploadStoryMedia(
  supabase: SupabaseClient,
  storyId: string,
  file: File,
  displayOrder: number
): Promise<{ id: string; path: string } | null> {
  const userId = await sessionUserId(supabase);
  if (!userId) return null;

  const ext = file.name.split('.').pop();
  const path = `${userId}/${storyId}/${displayOrder}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('story-media')
    .upload(path, file, { upsert: true });

  if (uploadError) return null;

  const { data: row, error: insertError } = await supabase
    .from('story_media')
    .insert({
      story_id: storyId,
      file_path: path,
      file_type: file.type,
      display_order: displayOrder,
    })
    .select('id')
    .single();

  if (insertError || !row) {
    await supabase.storage.from('story-media').remove([path]);
    return null;
  }
  return { id: row.id as string, path };
}

/**
 * Upload a voice note to storage and return the path.
 */
export async function uploadVoiceNote(
  supabase: SupabaseClient,
  storyId: string,
  file: File
): Promise<string | null> {
  const userId = await sessionUserId(supabase);
  if (!userId) return null;

  const ext = file.name.split('.').pop() || 'webm';
  const path = `${userId}/${storyId}/voice-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('story-media')
    .upload(path, file, { upsert: true });

  if (error) return null;
  return path;
}
