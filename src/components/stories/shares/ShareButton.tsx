'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { logShare } from '@/lib/stories/mutations';
import styles from '@/components/stories/detail/storyPage.module.css';

export default function ShareButton({
  storyId,
  slug,
  title,
}: {
  storyId: string;
  slug: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  const storyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/stories/${slug}`;

  const handleShare = async () => {
    const supabase = getBrowserClient();

    // Mobile: native share sheet
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Read this family memory on Ancestorii: "${title}"`,
          url: storyUrl,
        });
        await logShare(supabase, storyId, 'native_share');
        fetch('/api/story-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ story_id: storyId, type: 'story_share' }),
        }).catch(() => {});
        return;
      } catch (err: unknown) {
        if ((err as { name?: string } | null)?.name === 'AbortError') return;
      }
    }

    // Desktop: copy to clipboard
    try {
      await navigator.clipboard.writeText(storyUrl);
      setCopied(true);
      await logShare(supabase, storyId, 'link_copy');
      fetch('/api/story-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_id: storyId, type: 'story_share' }),
      }).catch(() => {});
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`${styles.pill} ${copied ? styles.pillDone : styles.pillInk}`}
    >
      {copied ? (
        <>
          <Check size={18} strokeWidth={2.6} aria-hidden="true" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={18} strokeWidth={2.2} aria-hidden="true" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}