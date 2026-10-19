'use client';

import { useState, useEffect } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getBrowserClient } from '@/lib/supabase/browser';
import { getStoryComments } from '@/lib/stories/queries';
import { addComment } from '@/lib/stories/mutations';
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';
import { safeToast } from '@/lib/safeToast';
import type { StoryComment } from '@/lib/stories/types';
import StoryCommentItem from './StoryCommentItem';
import StoryCommentInput from './StoryCommentInput';
import styles from './storyComments.module.css';

export default function CommentSection({
  storyId,
  initialComments,
  isLoggedIn,
  onLoginPrompt,
  currentUserId: knownUserId,
  now,
}: {
  storyId: string;
  initialComments: StoryComment[];
  isLoggedIn: boolean;
  onLoginPrompt?: () => void;
  /** The reader's id when the page already knows it (the server does); undefined reads the session. */
  currentUserId?: string | null;
  /** When the page was rendered on the server; the comments count their "3h ago" from it. */
  now?: number;
}) {
  const [comments, setComments] = useState<StoryComment[]>(initialComments);
  const [currentUserId, setCurrentUserId] = useState<string | null>(knownUserId ?? null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

  // The page passes the reader's id and the comments from the server, so nothing is read again
  // on mount (the re-read used to re-sign every photo and make them all reload). A caller that
  // doesn't know the reader gets the id from the local session.
  useEffect(() => {
    if (knownUserId !== undefined) return;
    let active = true;
    getBrowserClient()
      .auth.getSession()
      .then(({ data }) => {
        if (active) setCurrentUserId(data.session?.user?.id ?? null);
      });
    return () => {
      active = false;
    };
  }, [knownUserId]);

  // A fresh read brings new signed photo URLs (a new URL is a new download and a visible blink),
  // so writers already on the page keep the photo they have.
  const refresh = async (supabase: SupabaseClient) => {
    const updated = await getStoryComments(supabase, storyId);
    setComments((prev) => {
      const kept = new Map(prev.map((c) => [c.id, c.author_avatar_url]));
      return updated.map((c) =>
        kept.has(c.id) ? { ...c, author_avatar_url: kept.get(c.id) ?? c.author_avatar_url } : c
      );
    });
  };

  // Resolves false when the comment did not go, so the input keeps the words.
  const handleSubmit = async (content: string): Promise<boolean> => {
    const supabase = getBrowserClient();
    const success = await addComment(supabase, storyId, content, replyingTo?.id);
    if (!success) {
      safeToast.error('Your comment could not be posted. Please try again.');
      return false;
    }

    await refresh(supabase);
    setReplyingTo(null);

    // Notify story author (in-app + email)
    fetch('/api/story-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ story_id: storyId, type: 'story_comment', comment_content: content }),
    }).catch(() => {});
    return true;
  };

  // RLS lets only the writer delete, and blocks silently (0 rows): the helper checks and says so.
  const handleDelete = async (commentId: string) => {
    const supabase = getBrowserClient();
    try {
      const deleted = await deleteWithOwnerCheck(supabase, 'story_comments', commentId, 'comment');
      if (deleted) {
        setComments((prev) => prev.filter((c) => c.id !== commentId && c.parent_id !== commentId));
      }
    } catch {
      safeToast.error('This comment could not be deleted. Please try again.');
    }
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
              now={now}
              isOwn={currentUserId === comment.user_id}
              onDelete={() => handleDelete(comment.id)}
              isTopLevel
              onReply={() => setReplyingTo({ id: comment.id, name: comment.author_name })}
              replies={repliesByParent.get(comment.id) || []}
              currentUserId={currentUserId}
              onDeleteReply={handleDelete}
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
