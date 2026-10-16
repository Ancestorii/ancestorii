'use client';

import { useState, useEffect } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { getStoryComments } from '@/lib/stories/queries';
import { addComment } from '@/lib/stories/mutations';
import type { StoryComment } from '@/lib/stories/types';
import StoryCommentItem from './StoryCommentItem';
import StoryCommentInput from './StoryCommentInput';
import styles from './storyComments.module.css';

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
      {/* The story page's comment count jumps here (scrolls and moves focus), hence the id and tabIndex */}
      <h2 id="comments" tabIndex={-1} className={styles.heading}>
        {totalCount > 0 ? `${totalCount} ${totalCount === 1 ? 'Comment' : 'Comments'}` : 'Comments'}
      </h2>

      {topLevel.length > 0 && (
        <div className={styles.list}>
          {topLevel.map((comment) => (
            <StoryCommentItem
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

      <div className={topLevel.length > 0 ? styles.composerSpaced : styles.composer}>
        {replyingTo && (
          <div className={styles.replying}>
            <p className={styles.replyingText}>
              Replying to <span className={styles.replyingName}>{replyingTo.name}</span>
            </p>
            <button onClick={() => setReplyingTo(null)} className={styles.textBtn}>
              Cancel
            </button>
          </div>
        )}
        <StoryCommentInput onSubmit={handleSubmit} isLoggedIn={isLoggedIn} onLoginPrompt={onLoginPrompt} />
      </div>
    </div>
  );
}