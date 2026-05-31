'use client';

import { useState, useEffect } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import CommentItem from '@/components/stories/comments/CommentItem';
import CommentInput from '@/components/stories/comments/CommentInput';
import type { MemoryComment } from './page';

export default function MemoryCommentSection({
  memoryId,
  familyId,
  initialComments,
  currentUserId,
  memoryAuthorId,
}: {
  memoryId: string;
  familyId: string;
  initialComments: MemoryComment[];
  currentUserId: string;
  memoryAuthorId: string;
}) {
  const [comments, setComments] = useState(initialComments);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

  const fetchComments = async () => {
    const supabase = getBrowserClient();
    const { data } = await supabase
      .from('family_memory_comments')
      .select('id, user_id, author_name, author_avatar_url, content, created_at, parent_id')
      .eq('memory_id', memoryId)
      .order('created_at');
    if (data) setComments(data);
  };

  const handleSubmit = async (content: string) => {
    const supabase = getBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('Profiles')
      .select('full_name, profile_image_url, avatar_url')
      .eq('id', user.id)
      .single();

    let avatarUrl = profile?.profile_image_url || profile?.avatar_url || null;
    if (avatarUrl && !avatarUrl.startsWith('http')) {
      const { data: signed } = await supabase.storage
        .from('user-media')
        .createSignedUrl(avatarUrl, 3600);
      avatarUrl = signed?.signedUrl || null;
    }

    const { error } = await supabase.from('family_memory_comments').insert({
      memory_id: memoryId,
      family_id: familyId,
      user_id: user.id,
      author_name: profile?.full_name || 'Family Member',
      author_avatar_url: avatarUrl,
      content,
      parent_id: replyingTo?.id || null,
    });

    if (!error) {
      // Notify memory author
      if (memoryAuthorId && memoryAuthorId !== user.id) {
        try {
          await supabase.from('notifications').insert({
            user_id: memoryAuthorId,
            type: 'memory_comment',
            actor_id: user.id,
            target_id: memoryId,
            target_type: 'family_memory',
          });
        } catch {}
      }

      await fetchComments();
      setReplyingTo(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    const supabase = getBrowserClient();
    const { error } = await supabase
      .from('family_memory_comments')
      .delete()
      .eq('id', commentId);
    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId));
    }
  };

  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesByParent = new Map<string, MemoryComment[]>();
  comments
    .filter((c) => c.parent_id)
    .forEach((c) => {
      const existing = repliesByParent.get(c.parent_id!) || [];
      existing.push(c);
      repliesByParent.set(c.parent_id!, existing);
    });

  const totalCount = comments.length;

  // Map MemoryComment to the shape CommentItem expects for replies
  const mapToStoryComment = (c: MemoryComment) => ({
    id: c.id,
    story_id: memoryId,
    user_id: c.user_id,
    author_name: c.author_name,
    author_avatar_url: c.author_avatar_url,
    author_title: null,
    content: c.content,
    created_at: c.created_at,
    updated_at: c.created_at,
    parent_id: c.parent_id,
  });

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#B8924A] mb-5">
        {totalCount > 0 ? `${totalCount} ${totalCount === 1 ? 'Comment' : 'Comments'}` : 'Comments'}
      </p>

      {topLevel.length > 0 && (
        <div className="space-y-4">
          {topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              authorName={comment.author_name}
              authorAvatarUrl={comment.author_avatar_url}
              content={comment.content}
              createdAt={comment.created_at}
              isOwn={currentUserId === comment.user_id}
              onDelete={() => handleDelete(comment.id)}
              isTopLevel
              onReply={() => setReplyingTo({ id: comment.id, name: comment.author_name })}
              replies={(repliesByParent.get(comment.id) || []).map(mapToStoryComment)}
              currentUserId={currentUserId}
              onDeleteReply={(id) => handleDelete(id)}
            />
          ))}
        </div>
      )}

      <div className={topLevel.length > 0 ? 'mt-5' : ''}>
        {replyingTo && (
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[12px] text-[#A9782F]">
              Replying to <span className="font-semibold">{replyingTo.name}</span>
            </p>
            <button onClick={() => setReplyingTo(null)} className="text-[11px] font-medium text-[#9B8E7D] hover:text-[#6F6255] transition">
              Cancel
            </button>
          </div>
        )}
        <CommentInput onSubmit={handleSubmit} isLoggedIn={true} />
      </div>
    </div>
  );
}