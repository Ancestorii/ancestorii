'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { EmailOtpType } from '@supabase/supabase-js';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeRedirect } from '@/lib/safeRedirect';
import AuthShell from '@/components/site/AuthShell';
import AuthLoader from '@/components/site/auth/AuthLoader';
import auth from '@/components/site/auth.module.css';
import site from '@/components/site/site.module.css';
import forms from '@/components/site/auth/authForms.module.css';

const OTP_TYPES: EmailOtpType[] = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'];

// Lands every Supabase email link. Two shapes arrive here:
//   ?token_hash=...&type=...   (templates using {{ .TokenHash }}; works on any device)
//   ?code=...                  (PKCE; the browser client exchanges it as the page loads)
// Errors come back as ?error_code=... or #error_code=... and used to drop people on /login
// with no explanation.
export default function AuthConfirmPage() {
  const supabase = getBrowserClient();
  const router = useRouter();
  const [failed, setFailed] = useState<'expired' | 'invalid' | null>(null);

  useEffect(() => {
    const confirmEmail = async () => {
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const get = (key: string) => query.get(key) || hash.get(key);

      const errorCode = get('error_code') || get('error');
      if (errorCode) {
        setFailed(errorCode === 'otp_expired' ? 'expired' : 'invalid');
        return;
      }

      const tokenHash = get('token_hash');
      const rawType = get('type');
      const type = OTP_TYPES.includes(rawType as EmailOtpType) ? (rawType as EmailOtpType) : null;
      const code = get('code');
      const next = safeRedirect(get('next'));
      const asFailure = (message: string) =>
        setFailed(/expired/i.test(message) ? 'expired' : 'invalid');

      let session = null;

      if (tokenHash && type) {
        const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (error) return asFailure(error.message);
        session = data.session;
      } else {
        // getSession waits for the client to finish exchanging a ?code= from the URL.
        session = (await supabase.auth.getSession()).data.session;
        if (!session && code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) return asFailure(error.message);
          session = data.session;
        }
      }

      if (!session) {
        setFailed('invalid');
        return;
      }

      if (type === 'recovery') {
        router.replace('/reset-password');
        return;
      }
      if (type === 'email_change') {
        router.replace('/dashboard/settings');
        return;
      }
      if (next) {
        router.replace(next);
        return;
      }

      const { data: profile } = await supabase
        .from('Profiles')
        .select('onboarding_complete')
        .eq('id', session.user.id)
        .maybeSingle();

      router.replace(profile?.onboarding_complete ? '/dashboard/our-family' : '/onboarding/first-memory');
    };

    confirmEmail();
    // Runs once: the browser client is a singleton and the app router instance never changes.
  }, [router, supabase]);

  if (failed) {
    return (
      <AuthShell>
        <h1 className={auth.title}>
          Link <span className={site.accentPink}>{failed === 'expired' ? 'expired.' : 'not valid.'}</span>
        </h1>
        <p className={auth.intro}>
          {failed === 'expired'
            ? 'This link has expired. Request a new one and try again.'
            : 'This link is not valid or has already been used. If you have already confirmed, just log in.'}
        </p>
        <Link href="/login" className={`${site.btnSubmit} ${forms.submit}`}>
          <span>Go to log in</span>
          <span className={site.btnSubmitTile} aria-hidden="true">
            →
          </span>
        </Link>
        <p className={auth.switch}>
          Need an account?{' '}
          <Link href="/signup" className={forms.tapLink}>
            Sign up
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className={forms.statusTitle}>
        Confirming your email
      </h1>

      <p className={auth.intro}>
        We’re preparing your legacy space.
      </p>

      <AuthLoader />
    </AuthShell>
  );
}
