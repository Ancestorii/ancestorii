// app/auth/callback/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';
import AuthShell from '@/components/site/AuthShell';
import AuthLoader from '@/components/site/auth/AuthLoader';
import forms from '@/components/site/auth/authForms.module.css';

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

      // Create profile if it doesn't exist — never overwrite user's custom values
      const { data: existingProfile } = await supabase
        .from('Profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from('Profiles').insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || null,
        });
      }

      // Handle invite token (Google OAuth can't pass metadata to handle_new_user)
      const inviteToken = sessionStorage.getItem('invite_token');
      if (inviteToken) {
        try {
          await fetch('/api/accept-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: inviteToken }),
          });
        } catch {
          // Non-critical — user ends up in their own family
        }
        sessionStorage.removeItem('invite_token');
      }

      // Update family name from sessionStorage (set during step 1 of signup)
      const familyName = sessionStorage.getItem('family_name');
      if (familyName && !inviteToken) {
        try {
          const { data: membership } = await supabase
            .from('family_memberships')
            .select('family_id')
            .eq('user_id', user.id)
            .eq('role', 'owner')
            .single();

          if (membership) {
            await supabase
              .from('families')
              .update({ name: familyName })
              .eq('id', membership.family_id);
          }
        } catch {
          // Non-critical
        }
        sessionStorage.removeItem('family_name');
      }

      // Clean up redirect
      const postLoginRedirect = sessionStorage.getItem('post_login_redirect');
      if (postLoginRedirect) sessionStorage.removeItem('post_login_redirect');

      if (inviteToken) {
        // Invited users skip onboarding — feed already has content
        router.replace('/dashboard/our-family');
      } else {
        // Everyone else: check onboarding
        const { data: profile } = await supabase
          .from('Profiles')
          .select('onboarding_complete')
          .eq('id', user.id)
          .single();

        if (!profile?.onboarding_complete) {
          router.replace('/onboarding/first-memory');
        } else {
          router.replace(postLoginRedirect || '/dashboard/our-family');
        }
      }
    };

    handleOAuth();
  }, []);

  return (
    <AuthShell>
      <h1 className={forms.statusTitle}>Signing you in…</h1>
      <AuthLoader />
    </AuthShell>
  );
}
