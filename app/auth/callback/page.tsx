'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';

export default function AuthCallback() {
  const supabase = getBrowserClient();
  const router = useRouter();

  useEffect(() => {
    const handleOAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace('/login');
        return;
      }

      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || null,
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url || null,
        onboarding_completed: true,
      });

      router.replace('/dashboard/home');
    };

    handleOAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Signing you in…</p>
    </div>
  );
}
