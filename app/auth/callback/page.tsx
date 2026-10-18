// app/auth/callback/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeRedirect } from '@/lib/safeRedirect';
import AuthShell from '@/components/site/AuthShell';
import AuthLoader from '@/components/site/auth/AuthLoader';
import auth from '@/components/site/auth.module.css';
import site from '@/components/site/site.module.css';
import forms from '@/components/site/auth/authForms.module.css';

export default function AuthCallback() {
  const supabase = getBrowserClient();
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const handleOAuth = async () => {
      // Google (or Supabase) reporting a problem: say so instead of bouncing to /login silently.
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      if (query.get('error') || hash.get('error')) {
        setFailed(true);
        return;
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setFailed(true);
        return;
      }

      // Create profile if it doesn't exist, never overwrite user's custom values.
      // onboarding_complete is read here too, so the redirect below needs no second lookup.
      const { data: existingProfile } = await supabase
        .from('Profiles')
        .select('id, onboarding_complete')
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
          // Non-critical: user ends up in their own family
        }
        sessionStorage.removeItem('invite_token');
      }

      // Update family name from sessionStorage (set during step 1 of signup). Only for an account
      // this sign-in has just created: an existing user who picks Google on Sign Up (or has a
      // leftover name in the tab) keeps their library's name.
      const familyName = sessionStorage.getItem('family_name');
      sessionStorage.removeItem('family_name');
      const isNewAccount =
        !!user.last_sign_in_at &&
        Date.parse(user.last_sign_in_at) - Date.parse(user.created_at) < 10 * 60 * 1000;
      if (familyName && !inviteToken && isNewAccount) {
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
      }

      // Clean up redirect
      const postLoginRedirect = sessionStorage.getItem('post_login_redirect');
      if (postLoginRedirect) sessionStorage.removeItem('post_login_redirect');

      if (inviteToken) {
        // Invited users skip onboarding, feed already has content
        router.replace('/dashboard/our-family');
      } else if (!existingProfile?.onboarding_complete) {
        // Everyone else: a brand new profile (or one created just above) has not onboarded yet
        router.replace('/onboarding/first-memory');
      } else {
        router.replace(safeRedirect(postLoginRedirect) || '/dashboard/our-family');
      }
    };

    handleOAuth();
    // Runs once: the browser client is a singleton and the app router instance never changes.
  }, [router, supabase]);

  if (failed) {
    return (
      <AuthShell>
        <h1 className={auth.title}>
          Sign in <span className={site.accentPink}>didn&apos;t finish.</span>
        </h1>
        <p className={auth.intro}>
          We couldn&apos;t complete signing you in. The link may have expired or already been used.
          Please try again.
        </p>
        <Link href="/login" className={`${site.btnSubmit} ${forms.submit}`}>
          <span>Back to log in</span>
          <span className={site.btnSubmitTile} aria-hidden="true">
            →
          </span>
        </Link>
        <p className={auth.switch}>
          New to Ancestorii?{' '}
          <Link href="/signup" className={forms.tapLink}>
            Create a free account
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className={forms.statusTitle}>Signing you in…</h1>
      <AuthLoader />
    </AuthShell>
  );
}
