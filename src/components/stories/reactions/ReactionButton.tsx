'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { toggleReaction } from '@/lib/stories/mutations';
import styles from '@/components/stories/detail/storyPage.module.css';

export default function ReactionButton({
  storyId,
  initialCount,
  initialReacted,
  isLoggedIn,
  onLoginPrompt,
}: {
  storyId: string;
  initialCount: number;
  initialReacted: boolean;
  isLoggedIn: boolean;
  onLoginPrompt?: () => void;
}) {
  const [count, setCount] = useState(initialCount);
  const [reacted, setReacted] = useState(initialReacted);
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(false);

  const handleClick = async () => {
    if (!isLoggedIn) {
      onLoginPrompt?.();
      return;
    }

    if (loading) return;
    setLoading(true);

    // Trigger pulse animation
    setPulse(true);
    setTimeout(() => setPulse(false), 400);

    // Optimistic update
    setReacted(!reacted);
    setCount((c) => (reacted ? c - 1 : c + 1));

    const supabase = getBrowserClient();
    const result = await toggleReaction(supabase, storyId);

   // Correct if server disagrees
    setReacted(result.reacted);
    setCount((c) => {
      if (result.reacted && reacted) return c + 1;
      if (!result.reacted && !reacted) return c - 1;
      return c;
    });

    // Notify story author on like (not unlike)
    if (result.reacted) {
      fetch('/api/story-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_id: storyId, type: 'story_like' }),
      }).catch(() => {});
    }

    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-pressed={reacted}
      aria-label={`Like · ${count}`}
      className={`${styles.pill} ${styles.pillLike} ${reacted ? styles.liked : ''}`}
    >
      <Heart
        size={18}
        strokeWidth={2.2}
        fill="currentColor"
        aria-hidden="true"
        className={`${styles.heart} ${pulse ? styles.heartPulse : ''}`}
      />
      <span>{count}</span>
    </button>
  );
}