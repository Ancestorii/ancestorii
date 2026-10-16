'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import AuthShell from '@/components/site/AuthShell';
import { SubmitButton } from '@/components/site/SiteBits';
import auth from '@/components/site/auth.module.css';
import site from '@/components/site/site.module.css';
import forms from '@/components/site/auth/authForms.module.css';

export default function ResetPasswordPage() {
  const supabase = getBrowserClient();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [linkExpired, setLinkExpired] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get('error_code');

    if (errorCode === 'otp_expired') {
      setLinkExpired(true);
      return;
    }

    (async () => {
      // first attempt
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setReady(true);
        return;
      }

      // recovery session can hydrate slightly late
      setTimeout(async () => {
        const { data: retry } = await supabase.auth.getSession();

        if (!retry.session) {
          setLinkExpired(true);
        } else {
          setReady(true);
        }
      }, 300);
    })();
  }, [supabase]);

  const updatePassword = async () => {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully.');
      window.location.href = '/login';
    }
  };

  /* 🔴 EXPIRED LINK UI */
  if (linkExpired) {
    return (
      <AuthShell>
        <h1 className={auth.title}>
          Link <span className={site.accentPink}>expired.</span>
        </h1>
        <p className={auth.intro}>
          This password reset link is invalid or has expired.
          Please request a new one.
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

      <label htmlFor="new-password" className={`${site.label} ${forms.formStart}`}>
        New password
      </label>
      <input
        id="new-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        className={site.input}
      />

      <SubmitButton
        type="button"
        onClick={updatePassword}
        disabled={loading || password.length < 6}
        className={forms.submit}
      >
        {loading ? 'Updating...' : 'Update Password'}
      </SubmitButton>
    </AuthShell>
  );
}
