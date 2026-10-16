'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import GoogleButton, { signInWithGoogle } from '@/components/site/auth/GoogleButton';
import { SubmitButton } from '@/components/site/SiteBits';
import auth from '@/components/site/auth.module.css';
import site from '@/components/site/site.module.css';
import forms from '@/components/site/auth/authForms.module.css';
import styles from './signup.module.css';

// Words beside the four-bar password strength meter (display only).
const STRENGTH_LABELS = ['', 'Weak', 'Okay', 'Good', 'Strong'];

export default function SignupForm() {
  const supabase = getBrowserClient();
  const router = useRouter();

  // Capture invite token from URL (e.g. /signup?invite_token=xxx). Read here rather than with
  // useSearchParams so the form can render on the server instead of appearing after the script.
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('invite_token');
    if (token) sessionStorage.setItem('invite_token', token);
  }, []);

  // Step state
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [familyName, setFamilyName] = useState('');

  // Step 2 fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');

  // Shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength for the meter only (no effect on validation), scored as in the
  // Claude Design Sign Up file: 0 when empty, otherwise 1 (weak) to 4 (strong).
  const getStrength = (pwd: string) => {
    let n = 0;
    if (pwd.length >= 8) n++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) n++;
    if (/\d/.test(pwd)) n++;
    if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 14) n++;
    return pwd ? Math.max(1, n) : 0;
  };

  const strength = getStrength(password);

  // Step 1 → Step 2
  const handleContinue = () => {
    if (!familyName.trim()) {
      setError('Give your family library a name to continue.');
      return;
    }
    setError('');
    sessionStorage.setItem('family_name', familyName.trim());
    setStep(2);
  };

  // Google signup: the same flow as Log In. Google can't carry the form's metadata, so
  // /auth/callback names the library (or accepts the invite) from sessionStorage afterwards.
  const handleGoogle = async () => {
    setError('');
    sessionStorage.setItem('family_name', familyName.trim());

    const oauthError = await signInWithGoogle();

    if (oauthError) setError(oauthError.message);
  };

  // Email signup
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');

    if (!agree) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    setEmailSuggestion(null);

    // Validate email via Kickbox
    try {
      const validateRes = await fetch('/api/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const validation = await validateRes.json();

      if (!validation.allow) {
        if (validation.did_you_mean) {
          setEmailSuggestion(validation.did_you_mean);
          setError(`Did you mean ${validation.did_you_mean}?`);
        } else if (validation.disposable) {
          setError('Please use a permanent email address.');
        } else {
          setError('This email address appears to be invalid. Please check it.');
        }
        setLoading(false);
        return;
      }
    } catch {
      // Validation failed — proceed anyway (fail open)
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            family_name: familyName.trim(),
            invite_token: sessionStorage.getItem('invite_token') || null,
            promo_code: promoCode || null,
            newsletter_opt_in: newsletter,
          },
        },
      });

      if (signUpError) throw signUpError;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Send verification email (non-blocking)
      if (session?.user && !sessionStorage.getItem('verification_sent')) {
        sessionStorage.setItem('verification_sent', '1');
        supabase.functions.invoke('send-verification-email', {
          body: {
            userId: session.user.id,
            email: session.user.email,
          },
        });
      }

      // Check if this was an invite signup
      const hadInvite = !!sessionStorage.getItem('invite_token');

      // Clean up sessionStorage
      sessionStorage.removeItem('family_name');
      sessionStorage.removeItem('invite_token');

      // Allow auth cookies to persist
      await new Promise((res) => setTimeout(res, 200));

      // Invited users go straight to dashboard, new users write first memory
      router.replace(hadInvite ? '/dashboard/our-family' : '/onboarding/first-memory');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className={styles.flow}>
      {/* Progress */}
      <div className={styles.stepTop}>
        {step === 2 && (
          <button type="button" onClick={() => { setStep(1); setError(''); }} className={styles.back}>
            <ArrowLeft size={18} strokeWidth={2.5} aria-hidden="true" />
            Back
          </button>
        )}
        <div className={styles.steps} aria-hidden="true">
          <span className={`${styles.step} ${step === 1 ? styles.stepActive : ''}`} />
          <span className={`${styles.step} ${step === 2 ? styles.stepActive : ''}`} />
        </div>
      </div>

      {/* ── Step 1 ── */}
      {step === 1 && (
        <>
          <h2 className={styles.stepTitle}>
            Name your <span className={site.accentBlue}>Family Library.</span>
          </h2>
          <p className={styles.stepText}>
            You&apos;ll be the owner. Invite family members to contribute memories, photos, and stories together.
          </p>

          <div className={styles.firstField}>
            <label htmlFor="signup-family-name" className={site.label}>Family Library Name</label>
            <input id="signup-family-name" required value={familyName} onChange={(e) => { setFamilyName(e.target.value); setError(''); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleContinue(); } }} placeholder="e.g. The Smith Family" className={site.input} />
          </div>

          {familyName.trim() && (
            <div className={styles.preview}>
              <p className={`${site.tag} ${styles.previewLabel}`}>Your library</p>
              <p className={styles.previewName}>{familyName.trim()}</p>
            </div>
          )}

          {error && <div role="alert" className={`${site.noticeError} ${forms.notice}`}>{error}</div>}

          <SubmitButton type="button" onClick={handleContinue} className={forms.submit}>
            Continue
          </SubmitButton>
        </>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <>
          <h2 className={styles.stepTitle}>
            Create your <span className={site.accentBlue}>account.</span>
          </h2>
          <p className={styles.stepText}>Almost there — just need your details.</p>

          <GoogleButton onClick={handleGoogle} className={styles.firstField} />
          <p className={styles.googleNote}>
            By continuing with Google you agree to the{' '}
            <Link href="/terms">Terms</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.
          </p>

          <div className={auth.divider}>or with email</div>

          <form onSubmit={onSubmit} noValidate>
            <div>
              <label htmlFor="signup-full-name" className={site.label}>Full Name</label>
              <input id="signup-full-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" className={site.input} />
            </div>

            <div className={styles.field}>
              <label htmlFor="signup-email" className={site.label}>Email</label>
              <input id="signup-email" required type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailSuggestion(null); if (emailError) setEmailError(''); }} onBlur={() => { if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Please enter a valid email address.'); } else { setEmailError(''); } }} placeholder="you@family.com" autoComplete="email" aria-invalid={emailError ? true : undefined} aria-describedby={emailError ? 'signup-email-error' : undefined} className={`${site.input} ${emailError ? site.inputError : ''}`} />
              {emailError && <p id="signup-email-error" className={site.fieldError}>{emailError}</p>}
              {emailSuggestion && (
                <button type="button" onClick={() => { setEmail(emailSuggestion); setEmailSuggestion(null); setError(''); }} className={styles.suggest}>
                  Use {emailSuggestion} instead
                </button>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="signup-password" className={site.label}>Password</label>
              <div className={forms.pwWrap}>
                <input id="signup-password" required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className={site.input} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} className={forms.toggle}>{showPassword ? 'Hide' : 'Show'}</button>
              </div>
              <div className={styles.meter} data-score={strength}>
                <div className={styles.meterBars} aria-hidden="true">
                  <span className={styles.meterBar} />
                  <span className={styles.meterBar} />
                  <span className={styles.meterBar} />
                  <span className={styles.meterBar} />
                </div>
                <span className={styles.meterLabel} aria-live="polite">{STRENGTH_LABELS[strength]}</span>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="signup-promo-code" className={site.label}>
                Promo / Referral Code <span className={styles.optional}>(optional)</span>
              </label>
              <input id="signup-promo-code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className={site.input} />
            </div>

            <div className={styles.checks}>
              <label className={`${site.check} ${styles.check}`}>
                <input type="checkbox" checked={newsletter} onChange={() => setNewsletter(!newsletter)} />
                <span>Send me updates on preserving family memories</span>
              </label>

              <label className={`${site.check} ${styles.check}`}>
                <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} required />
                <span>
                  I agree to the{' '}
                  <Link href="/terms">Terms</Link>{' '}and{' '}
                  <Link href="/privacy-policy">Privacy Policy</Link>.
                </span>
              </label>
            </div>

            {error && <div role="alert" className={`${site.noticeError} ${forms.notice}`}>{error}</div>}

            <SubmitButton disabled={loading} className={forms.submit}>
              {loading ? 'Creating your account…' : 'Create free account'}
            </SubmitButton>
          </form>
        </>
      )}

      <p className={auth.switch}>
        Already have an account?{' '}
        <Link href="/login" className={forms.tapLink}>Log in</Link>
      </p>
    </div>
  );
}
