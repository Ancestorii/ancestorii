import { SupabaseClient } from '@supabase/supabase-js';
import { uniqueSlug } from './slugify';
import type { Story } from './types';

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
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;

  const { data: profile } = await supabase
    .from('Profiles')
    .select('full_name, avatar_url')
    .eq('id', auth.user.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from('stories')
    .insert({
      author_id: auth.user.id,
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

  if (error) return null;
  return data as Story;
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
  const { error } = await supabase
    .from('stories')
    .update(updates)
    .eq('id', storyId);

  return !error;
}

/**
 * Publish a draft story.
 */
export async function publishStory(
  supabase: SupabaseClient,
  storyId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('stories')
    .update({ status: 'published' })
    .eq('id', storyId);

  return !error;
}

/**
 * Delete a story.
 */
export async function deleteStory(
  supabase: SupabaseClient,
  storyId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', storyId);

  return !error;
}

/**
 * Toggle a reaction (like/unlike).
 */
export async function toggleReaction(
  supabase: SupabaseClient,
  storyId: string
): Promise<{ reacted: boolean }> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { reacted: false };

  const { data: existing } = await supabase
    .from('story_reactions')
    .select('id')
    .eq('story_id', storyId)
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('story_reactions')
      .delete()
      .eq('id', existing.id);
    return { reacted: false };
  }

  await supabase
    .from('story_reactions')
    .insert({
      story_id: storyId,
      user_id: auth.user.id,
      reaction_type: 'like',
    });

  return { reacted: true };
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
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return false;

  const { data: profile } = await supabase
    .from('Profiles')
    .select('full_name, avatar_url')
    .eq('id', auth.user.id)
    .maybeSingle();

  const { error } = await supabase
    .from('story_comments')
    .insert({
      story_id: storyId,
      user_id: auth.user.id,
      author_name: profile?.full_name || 'Anonymous',
      author_avatar_url: profile?.avatar_url || null,
      content,
      parent_id: parentId || null,
    });

  return !error;
}

/**
 * Delete a comment.
 */
export async function deleteComment(
  supabase: SupabaseClient,
  commentId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('story_comments')
    .delete()
    .eq('id', commentId);

  return !error;
}

/**
 * Log a share event.
 */
export async function logShare(
  supabase: SupabaseClient,
  storyId: string,
  platform: string
): Promise<boolean> {
  const { data: auth } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('story_shares')
    .insert({
      story_id: storyId,
      user_id: auth?.user?.id || null,
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
 * Upload story media file to storage.
 */
export async function uploadStoryMedia(
  supabase: SupabaseClient,
  storyId: string,
  file: File,
  displayOrder: number
): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;

  const ext = file.name.split('.').pop();
  const path = `${auth.user.id}/${storyId}/${displayOrder}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('story-media')
    .upload(path, file, { upsert: true });

  if (uploadError) return null;

  const { error: insertError } = await supabase
    .from('story_media')
    .insert({
      story_id: storyId,
      file_path: path,
      file_type: file.type,
      display_order: displayOrder,
    });

  if (insertError) return null;
  return path;
}

/**
 * Upload a voice note to storage and return the path.
 */
export async function uploadVoiceNote(
  supabase: SupabaseClient,
  storyId: string,
  file: File
): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;

  const ext = file.name.split('.').pop() || 'webm';
  const path = `${auth.user.id}/${storyId}/voice-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('story-media')
    .upload(path, file, { upsert: true });

  if (error) return null;
  return path;
}