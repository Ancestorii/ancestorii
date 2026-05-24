'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { logShare } from '@/lib/stories/mutations';

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
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
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
      onClick={handleShare}
      className="flex items-center gap-2 rounded-[12px] border px-4 py-2.5 text-[14px] font-semibold text-[#6F6255] transition hover:bg-[#FAF4EA]"
      style={{ borderColor: '#DCC7A4' }}
    >
      {copied ? (
        <>
          <Check size={18} strokeWidth={1.8} className="text-emerald-600" />
          <span className="text-emerald-600">Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={18} strokeWidth={1.8} />
          <span>Share</span>
        </>
      )}
    </button>
  );
}