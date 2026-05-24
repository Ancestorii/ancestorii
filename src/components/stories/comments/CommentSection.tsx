'use client';

import { useState, useEffect } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { getStoryComments } from '@/lib/stories/queries';
import { addComment } from '@/lib/stories/mutations';
import type { StoryComment } from '@/lib/stories/types';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';

export default function CommentSection({
  storyId,
  initialComments,
  isLoggedIn,
  onLoginPrompt,
}: {
  storyId: string;
  initialComments: StoryComment[];
  isLoggedIn: boolean;
  onLoginPrompt?: () => void;
}) {
  const [comments, setComments] = useState<StoryComment[]>(initialComments);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data?.user?.id ?? null);
    });
    getStoryComments(supabase, storyId).then(setComments);
  }, [storyId]);

  const handleSubmit = async (content: string) => {
    const supabase = getBrowserClient();
    const success = await addComment(supabase, storyId, content, replyingTo?.id);
    if (success) {
      const updated = await getStoryComments(supabase, storyId);
      setComments(updated);
      setReplyingTo(null);

      // Notify story author (in-app + email)
      fetch('/api/story-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_id: storyId, type: 'story_comment', comment_content: content }),
      }).catch(() => {});
    }
  };

  const handleDelete = async (commentId: string) => {
    const supabase = getBrowserClient();
    const { error } = await supabase.from('story_comments').delete().eq('id', commentId);
    if (!error) setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId));
  };

  const handleDeleteReply = async (replyId: string) => {
    const supabase = getBrowserClient();
    const { error } = await supabase.from('story_comments').delete().eq('id', replyId);
    if (!error) setComments((prev) => prev.filter((c) => c.id !== replyId));
  };

  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesByParent = new Map<string, StoryComment[]>();
  comments.filter((c) => c.parent_id).forEach((c) => {
    const existing = repliesByParent.get(c.parent_id!) || [];
    existing.push(c);
    repliesByParent.set(c.parent_id!, existing);
  });

  const totalCount = comments.length;

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
              authorTitle={comment.author_title}
              content={comment.content}
              createdAt={comment.created_at}
              isOwn={currentUserId === comment.user_id}
              onDelete={() => handleDelete(comment.id)}
              isTopLevel
              onReply={() => setReplyingTo({ id: comment.id, name: comment.author_name })}
              replies={repliesByParent.get(comment.id) || []}
              currentUserId={currentUserId}
              onDeleteReply={handleDeleteReply}
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
        <CommentInput onSubmit={handleSubmit} isLoggedIn={isLoggedIn} onLoginPrompt={onLoginPrompt} />
      </div>
    </div>
  );
}