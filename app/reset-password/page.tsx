'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import AuthShell from '@/components/site/AuthShell';
import { SubmitButton } from '@/components/site/SiteBits';
import auth from '@/components/site/auth.module.css';
import site from '@/components/site/site.module.css';
import forms from '@/components/site/auth/authForms.module.css';

export default function ResetPasswordPage() {
  const supabase = getBrowserClient();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  // 'expired': GoTrue said the link is dead. 'code': a ?code= link could not be exchanged, which
  // is either an old code or (most often) a link opened in a browser other than the one that
  // asked for it: PKCE keeps the other half of the handshake there, and the two cannot be told
  // apart once the client has made its own attempt.
  const [linkProblem, setLinkProblem] = useState<'expired' | 'code' | null>(null);

  useEffect(() => {
    // GoTrue reports a dead link in the query string (PKCE) or the hash (implicit flow).
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const get = (key: string) => query.get(key) || hash.get(key);

    if (get('error_code') || get('error')) {
      setLinkProblem('expired');
      return;
    }

    (async () => {
      // getSession waits for the client to finish exchanging a ?code= from the URL.
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setReady(true);
        return;
      }

      // No session: the client skips the exchange when its half of the handshake is missing,
      // so try it here once before giving up.
      const code = get('code');
      if (code) {
        const { data: exchanged } = await supabase.auth.exchangeCodeForSession(code);
        if (exchanged?.session) {
          setReady(true);
          return;
        }
        setLinkProblem('code');
        return;
      }

      // recovery session can hydrate slightly late
      setTimeout(async () => {
        const { data: retry } = await supabase.auth.getSession();

        if (!retry.session) {
          setLinkProblem('expired');
        } else {
          setReady(true);
        }
      }, 300);
    })();
  }, [supabase]);

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || password.length < 6) return;
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      // The recovery link already signed them in, so straight into the app. (The old full
      // reload to /login threw the toast away and left a signed-in user on the login form.)
      toast.success('Password updated successfully.');
      router.replace('/dashboard/our-family');
    }
  };

  /* 🔴 EXPIRED LINK UI */
  if (linkProblem) {
    return (
      <AuthShell>
        <h1 className={auth.title}>
          Link <span className={site.accentPink}>{linkProblem === 'code' ? "can't be used here." : 'expired.'}</span>
        </h1>
        <p className={auth.intro}>
          {linkProblem === 'code'
            ? 'This reset link has expired, or it was opened in a different browser from the one that asked for it (for your security it only works there). Please request a new one from this device.'
            : 'This password reset link is invalid or has expired. Please request a new one.'}
        </p>
        <a href="/login" className={`${site.btnSubmit} ${forms.submit}`}>
          <span>Back to login</span>
          <span className={site.btnSubmitTile} aria-hidden="true">
            →
          </span>
        </a>
      </AuthShell>
    );
  }

  /* While the recovery session is checked: the frame, with the form to follow. */
  if (!ready) return <AuthShell>{null}</AuthShell>;

  /* ✅ NORMAL RESET FLOW */
  return (
    <AuthShell>
      <h1 className={auth.title}>
        Set new <span className={site.accentPink}>password.</span>
      </h1>

      <form onSubmit={updatePassword}>
        <label htmlFor="new-password" className={`${site.label} ${forms.formStart}`}>
          New password
        </label>
        <input
          id="new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
          className={site.input}
        />

        <SubmitButton
          disabled={loading || password.length < 6}
          className={forms.submit}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
