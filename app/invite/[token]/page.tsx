'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBrowserClient } from '@/lib/supabase/browser';
import AuthShell from '@/components/site/AuthShell';
import { Accent, ArrowLink, SubmitButton } from '@/components/site/SiteBits';
import { FAMILY_CARDS } from '@/components/site/utility/familyCards';
import landing from '@/components/landing/landing.module.css';
import auth from '@/components/site/auth.module.css';
import site from '@/components/site/site.module.css';
import styles from '@/components/site/utility/account.module.css';

interface InviteDetails {
  valid: boolean;
  email: string;
  role: string;
  familyName: string;
  inviterName: string;
}

export default function InvitePage() {
  const supabase = getBrowserClient();
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState('');

  // Someone already signed in accepts with their account instead of creating a second one.
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [accepting, setAccepting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const getStrength = (pwd: string) => {
    if (pwd.length < 6) return 'weak';
    if (/[A-Z]/.test(pwd) && /\d/.test(pwd) && pwd.length >= 8) return 'strong';
    return 'medium';
  };

  const strength = getStrength(password);

  // Fetch invite details on mount
  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invite/${token}`);
        const data = await res.json();

        if (!res.ok || !data.valid) {
          setInviteError(data.error || 'This invite is no longer valid.');
          return;
        }

        setInvite(data);
      } catch {
        setInviteError('Unable to load invite details.');
      } finally {
        setLoadingInvite(false);
      }
    }

    if (token) fetchInvite();
  }, [token]);

  // Local read of the session cookie: no round trip.
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSignedIn(!!session))
      .catch(() => setSignedIn(false));
  }, [supabase]);

  // Signed-in user: /api/accept-invite checks the email matches and moves them (and their
  // memories) out of the solo library the sign-up trigger gave them.
  const handleAccept = async () => {
    if (accepting) return;
    setAccepting(true);
    setError('');

    try {
      const res = await fetch('/api/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'We could not accept this invitation. Please try again.');
        setAccepting(false);
        return;
      }

      router.replace('/dashboard/our-family');
    } catch {
      setError('Something went wrong. Please try again.');
      setAccepting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');

    if (!agree) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: invite!.email,
        password,
        options: {
          data: {
            full_name: fullName,
            invite_token: token,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Redirect to dashboard (the session cookie is already written)
      router.replace('/dashboard/our-family');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- unchanged handler
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong');
      setLoading(false);
    }
  };

  // ── Loading state ──
  if (loadingInvite || signedIn === null) {
    return (
      <AuthShell variant="signup" cards={FAMILY_CARDS}>
        <div className={styles.loading} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          <p className={styles.loadingText}>Loading your invitation…</p>
        </div>
      </AuthShell>
    );
  }

  // ── Invalid/expired invite ──
  if (inviteError) {
    return (
      <AuthShell variant="signup" cards={FAMILY_CARDS}>
        <h1 className={`${auth.title} ${styles.title}`}>
          Invitation <Accent tone="pink">Unavailable</Accent>
        </h1>
        <p className={auth.intro}>{inviteError}</p>
        <ArrowLink href="/signup" className={`${landing.btnShadow} ${styles.blockLink}`}>
          Create your own account
        </ArrowLink>
      </AuthShell>
    );
  }

  // ── Signed in: accept with this account ──
  if (signedIn) {
    return (
      <AuthShell variant="signup" cards={FAMILY_CARDS}>
        <h2 className={`${auth.title} ${styles.title}`}>
          You&apos;re invited to join
          <br />
          <Accent tone="pink">{invite!.familyName}</Accent>
        </h2>
        <p className={auth.intro}>
          {invite!.inviterName} wants you to help preserve your family&apos;s memories.
        </p>

        <h1 className={styles.formTitle}>Accept the invitation</h1>
        <p className={styles.formLead}>
          This invitation was sent to <span className={styles.strong}>{invite!.email}</span>. You&apos;ll be
          able to view and contribute to everything in{' '}
          <span className={styles.strong}>{invite!.familyName}</span>.
        </p>

        {error && <p className={`${site.noticeError} ${styles.errorGap}`} role="alert">{error}</p>}

        <SubmitButton
          type="button"
          onClick={handleAccept}
          disabled={accepting}
          className={styles.action}
        >
          {accepting ? 'Joining family…' : `Join ${invite!.familyName}`}
        </SubmitButton>

        <p className={auth.switch}>
          Wrong account?{' '}
          <Link href={`/login?redirect=/invite/${token}`}>
            Switch account
          </Link>
        </p>
      </AuthShell>
    );
  }

  // ── Valid invite: show signup form ──
  return (
    <AuthShell variant="signup" cards={FAMILY_CARDS}>
      {/* Headline */}
      <h2 className={`${auth.title} ${styles.title}`}>
        You&apos;re invited to join
        <br />
        <Accent tone="pink">{invite!.familyName}</Accent>
      </h2>
      <p className={auth.intro}>
        {invite!.inviterName} wants you to help preserve your family&apos;s memories.
      </p>

      {/* Signup form */}
      <h1 className={styles.formTitle}>Create your account</h1>

      <form onSubmit={onSubmit} className={styles.form}>
        <div>
          <label htmlFor="invite-full-name" className={site.label}>
            Full Name
          </label>
          <input
            id="invite-full-name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={site.input}
          />
        </div>

        <div>
          <label htmlFor="invite-email" className={site.label}>
            Email
          </label>
          <input
            id="invite-email"
            type="email"
            value={invite!.email}
            disabled
            className={`${site.input} ${styles.locked}`}
          />
          <p className={styles.hint}>
            This is the email the invite was sent to
          </p>
        </div>

        <div>
          <label htmlFor="invite-password" className={site.label}>
            Password
          </label>
          <div className={styles.passwordWrap}>
            <input
              id="invite-password"
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${site.input} ${styles.passwordInput}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={styles.toggle}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {password && (
            <div className={styles.meter}>
              <div
                className={`${styles.meterBar} ${
                  strength === 'weak'
                    ? styles.meterWeak
                    : strength === 'medium'
                    ? styles.meterMedium
                    : styles.meterStrong
                }`}
              />
            </div>
          )}
        </div>

        <label className={`${site.check} ${styles.agree}`}>
          <input
            type="checkbox"
            checked={agree}
            onChange={() => setAgree(!agree)}
            required
          />
          <span>
            I agree to the{' '}
            <Link href="/terms">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy">
              Privacy Policy
            </Link>
          </span>
        </label>

        {error && <p className={site.noticeError} role="alert">{error}</p>}

        <SubmitButton disabled={loading}>
          {loading ? 'Joining family…' : `Join ${invite!.familyName}`}
        </SubmitButton>
      </form>

      <p className={auth.switch}>
        Already have an account?{' '}
        <Link href={`/login?redirect=/invite/${token}`}>
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}