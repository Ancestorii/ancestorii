'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function CommentInput({
  onSubmit,
  isLoggedIn,
  onLoginPrompt,
}: {
  onSubmit: (content: string) => Promise<void>;
  isLoggedIn: boolean;
  onLoginPrompt?: () => void;
}) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isLoggedIn) {
    return (
      <button
        onClick={onLoginPrompt}
        className="w-full rounded-[12px] border px-5 py-4 text-[14px] text-[#9B8E7D] text-left transition hover:bg-[#FAF4EA]"
        style={{ borderColor: '#DCC7A4' }}
      >
        Log in to share your thoughts…
      </button>
    );
  }

  const handleSubmit = async () => {
    if (!value.trim() || submitting) return;
    setSubmitting(true);
    await onSubmit(value.trim());
    setValue('');
    setSubmitting(false);
  };

  return (
    <div className="flex gap-3">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        placeholder="Share your thoughts…"
        className="flex-1 h-[48px] rounded-[12px] border bg-white px-4 text-[14px] text-[#2C241B] outline-none placeholder:text-[#9B8E7D] focus:border-[#C8A557] transition"
        style={{ borderColor: '#DCC7A4' }}
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim() || submitting}
        className="flex h-[48px] w-[48px] flex-shrink-0 items-center justify-center rounded-[12px] bg-[#C8A557] text-white transition hover:bg-[#B8924A] disabled:opacity-50"
      >
        {submitting ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <Send size={16} strokeWidth={1.8} />
        )}
      </button>
    </div>
  );
}