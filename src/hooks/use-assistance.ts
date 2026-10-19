'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';

interface UseAssistanceOptions {
  onSuccess?: (suggestion: string) => void;
  onError?: (error: string) => void;
}

const FALLBACK_ERROR = 'Something went wrong. Please try again.';

export function useAssistance(options?: UseAssistanceOptions) {
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only the latest request may write state: "Try another" twice in a row, or Back while a
  // suggestion is still loading, used to let the older answer land on top of the newer one.
  const seqRef = useRef(0);

  const assist = useCallback(async (
    type: string,
    context: Record<string, unknown>,
    familyId?: string,
    apiEndpoint?: string
  ) => {
    const seq = ++seqRef.current;
    setIsLoading(true);
    setError(null);
    setSuggestion('');

    try {
      const response = await fetch(apiEndpoint || '/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, context, family_id: familyId }),
      });

      // A gateway timeout answers with HTML, not JSON: treat it like any other failure
      const data = await response.json().catch(() => ({}));
      if (seq !== seqRef.current) return null;

      if (!response.ok) {
        const message = typeof data?.error === 'string' && data.error ? data.error : FALLBACK_ERROR;
        setError(message);
        options?.onError?.(message);
        return null;
      }

      const text = typeof data?.suggestion === 'string' ? data.suggestion : '';
      setSuggestion(text);
      options?.onSuccess?.(text);
      return text;
    } catch {
      if (seq !== seqRef.current) return null;
      setError(FALLBACK_ERROR);
      options?.onError?.(FALLBACK_ERROR);
      return null;
    } finally {
      if (seq === seqRef.current) setIsLoading(false);
    }
  }, [options]);

  const clear = useCallback(() => {
    seqRef.current += 1;
    setSuggestion('');
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    suggestion,
    isLoading,
    error,
    assist,
    clear,
  };
}

/**
 * Profiles.writing_assistance_enabled for the signed-in user, read once per mount.
 * `false` from the caller is final (nothing to check). `true` or nothing is still checked against
 * the profile, because the assist routes answer 403 when the flag is off, and a card that shows
 * anyway only produces an error on its first click. Returns null while the check runs.
 */
export function useWritingAssistanceEnabled(explicit?: boolean): boolean | null {
  const [enabled, setEnabled] = useState<boolean | null>(explicit === false ? false : null);

  useEffect(() => {
    if (explicit === false) {
      setEnabled(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const supabase = getBrowserClient();
        // The uid comes from the local session (no round trip); RLS still limits the read.
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        if (!uid) {
          if (!cancelled) setEnabled(false);
          return;
        }
        const { data } = await supabase
          .from('Profiles')
          .select('writing_assistance_enabled')
          .eq('id', uid)
          .maybeSingle();
        if (!cancelled) setEnabled(data?.writing_assistance_enabled !== false);
      } catch {
        // Could not read the profile: show the card as before; the route still gates every call.
        if (!cancelled) setEnabled(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [explicit]);

  return enabled;
}
