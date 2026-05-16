'use client';

import { useState, useCallback } from 'react';

interface UseAssistanceOptions {
  onSuccess?: (suggestion: string) => void;
  onError?: (error: string) => void;
}

export function useAssistance(options?: UseAssistanceOptions) {
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assist = useCallback(async (
    type: string,
    context: Record<string, unknown>,
    familyId?: string
  ) => {
    setIsLoading(true);
    setError(null);
    setSuggestion('');

    try {
      const response = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, context, family_id: familyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        options?.onError?.(data.error);
        return null;
      }

      setSuggestion(data.suggestion);
      options?.onSuccess?.(data.suggestion);
      return data.suggestion;
    } catch (err: any) {
      const message = 'Something went wrong. Please try again.';
      setError(message);
      options?.onError?.(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const clear = useCallback(() => {
    setSuggestion('');
    setError(null);
  }, []);

  return {
    suggestion,
    isLoading,
    error,
    assist,
    clear,
  };
}