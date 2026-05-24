'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { toggleReaction } from '@/lib/stories/mutations';

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
      onClick={handleClick}
      disabled={loading}
      className="group flex items-center gap-2 text-[14px] lg:text-[15px] xl:text-[16px] font-medium transition-all duration-200"
    >
      <Heart
        size={18}
        strokeWidth={1.6}
        fill="#D94F4F"
        className={`text-[#D94F4F] transition-all duration-200 ${
          pulse ? 'scale-125' : 'scale-100'
        } ${
          reacted ? 'opacity-100' : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'
        }`}
      />
      <span className="text-[#1A1612]">{count}</span>
    </button>
  );
}