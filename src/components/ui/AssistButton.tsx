'use client';

import { useState } from 'react';
import { Feather } from 'lucide-react';
import { useAssistance } from '@/hooks/use-assistance';

interface AssistButtonProps {
  type: string;
  context: Record<string, unknown>;
  familyId?: string;
  label?: string;
  onUseSuggestion?: (suggestion: string) => void;
  className?: string;
}

export default function AssistButton({
  type,
  context,
  familyId,
  label = 'Help me find the words',
  onUseSuggestion,
  className = '',
}: AssistButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { suggestion, isLoading, error, assist, clear } = useAssistance();

  const handleClick = async () => {
    if (isOpen && suggestion) {
      setIsOpen(false);
      clear();
      return;
    }

    setIsOpen(true);
    await assist(type, context, familyId);
  };

  const handleUseSuggestion = () => {
    if (suggestion && onUseSuggestion) {
      onUseSuggestion(suggestion);
      setIsOpen(false);
      clear();
    }
  };

  const handleRegenerate = async () => {
    clear();
    await assist(type, context, familyId);
  };

  const handleDismiss = () => {
    setIsOpen(false);
    clear();
  };

  return (
    <div className={className}>
      {/* Trigger */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="flex items-center gap-2 text-[13px] font-semibold text-[#B8924A] transition hover:text-[#A9782F] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Feather size={14} strokeWidth={1.7} />
        <span>{isLoading ? 'Finding the words...' : label}</span>
      </button>

      {/* Suggestion panel */}
      {isOpen && (
        <div
          className="mt-3 rounded-[12px] border px-5 py-4"
          style={{
            borderColor: '#EAD8B8',
            background: 'linear-gradient(160deg, #FFFDF9 0%, #FAF5EB 100%)',
          }}
        >
          {isLoading && (
            <div className="flex items-center gap-3 py-2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#EAD8B8] border-t-[#C8A557]" />
              <span className="text-[13px] text-[#9B8E7D] italic">
                Finding the right words...
              </span>
            </div>
          )}

          {error && (
            <div>
              <p className="text-[13px] text-[#9B8E7D]">{error}</p>
              <button
                onClick={handleRegenerate}
                className="mt-2 text-[12px] font-semibold text-[#B8924A] hover:text-[#A9782F] transition"
              >
                Try again
              </button>
            </div>
          )}

          {suggestion && !isLoading && (
            <>
              <p className="font-serif text-[15px] leading-[1.75] text-[#3d3830] whitespace-pre-line">
                {suggestion}
              </p>

              <div
                className="mt-4 pt-3 flex items-center gap-3"
                style={{ borderTop: '1px solid #EAD8B8' }}
              >
                <button
                  onClick={handleUseSuggestion}
                  className="flex h-[36px] items-center justify-center rounded-[10px] bg-[#C8A557] px-5 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(184,146,74,0.2)] transition hover:bg-[#B8924A]"
                >
                  Use this
                </button>
                <button
                  onClick={handleRegenerate}
                  className="text-[13px] font-semibold text-[#9B8E7D] transition hover:text-[#6F6255]"
                >
                  Try another
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-[13px] font-semibold text-[#9B8E7D] transition hover:text-[#6F6255]"
                >
                  Dismiss
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}