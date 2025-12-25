'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';

const supabase = getBrowserClient();

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState('Verifying your email…');

  useEffect(() => {
    if (!token) {
      setStatus('Invalid verification link');
      return;
    }

    (async () => {
      const { data } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('token', token)
        .is('used_at', null)
        .maybeSingle();

      if (!data) {
        setStatus('This link is invalid or expired.');
        return;
      }

      await supabase
        .from('email_verifications')
        .update({ used_at: new Date().toISOString() })
        .eq('id', data.id);

      setStatus('Your email has been verified successfully.');
    })();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-semibold">{status}</p>
    </div>
  );
}
