'use client';

import { useState } from 'react';
import site from '@/components/site/site.module.css';
import styles from '@/components/site/why-rewards/whyThisExists.module.css';

/* ─── Share button for the founder's letter (the only part of it that runs in the browser) ─── */
export default function ShareButton() {
  const [copied, setCopied] = useState(false);
  const url = 'https://www.ancestorii.com/why-this-exists';
  const text = 'The story behind Ancestorii: why one person decided to build a place where families can share the moments that matter.';

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Our Roots: Why Ancestorii Exists', text, url });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <button
      onClick={handleShare}
      className={`${site.btnLine} ${styles.share}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? 'Link copied' : 'Share this story'}
    </button>
  );
}
