'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { ui, IconBtn, Spinner } from '@/components/dashboard/ui/AppBits';
import s from './memoryComments.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export default function CommentInput({
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
      <button type="button" onClick={onLoginPrompt} className={cx(ui.btn, ui.btnSoft, s.login)}>
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
    <div className={s.inputRow}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        placeholder="Share your thoughts…"
        aria-label="Share your thoughts…"
        className={cx(ui.input, s.input)}
      />
      <IconBtn
        label="Send"
        active
        onClick={handleSubmit}
        disabled={!value.trim() || submitting}
        className={s.send}
      >
        {submitting ? (
          <Spinner size={18} />
        ) : (
          <Send size={18} strokeWidth={2.4} aria-hidden="true" />
        )}
      </IconBtn>
    </div>
  );
}
