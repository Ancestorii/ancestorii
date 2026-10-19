'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import styles from './storyComments.module.css';

// The public story page's copy of CommentInput (the dashboard keeps using CommentInput):
// the same props and behaviour, in the landing's look.
export default function StoryCommentInput({
  onSubmit,
  isLoggedIn,
  onLoginPrompt,
}: {
  /** Resolve false when the comment did not go: the words stay in the box. */
  onSubmit: (content: string) => Promise<boolean | void>;
  isLoggedIn: boolean;
  onLoginPrompt?: () => void;
}) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isLoggedIn) {
    return (
      <button onClick={onLoginPrompt} className={styles.loginPrompt}>
        Log in to share your thoughts…
      </button>
    );
  }

  const handleSubmit = async () => {
    if (!value.trim() || submitting) return;
    setSubmitting(true);
    try {
      const ok = await onSubmit(value.trim());
      if (ok !== false) setValue('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.inputRow}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        placeholder="Share your thoughts…"
        aria-label="Share your thoughts…"
        className={styles.input}
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim() || submitting}
        className={styles.send}
        aria-label="Send"
      >
        {submitting ? (
          <span className={styles.spinner} />
        ) : (
          <Send size={18} strokeWidth={2.2} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
