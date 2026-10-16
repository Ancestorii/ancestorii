"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/browser";
import AuthShell from "@/components/site/AuthShell";
import { SubmitButton } from "@/components/site/SiteBits";
import auth from "@/components/site/auth.module.css";
import site from "@/components/site/site.module.css";
import forms from "@/components/site/auth/authForms.module.css";

export default function LoginPage() {
  const supabase = getBrowserClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetSent, setResetSent] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ---------------------------
  // LOGIN
  // ---------------------------
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Login failed. Please try again.");
      }

      await new Promise((res) => setTimeout(res, 200));

      // Check onboarding status
      const { data: profile } = await supabase
        .from('Profiles')
        .select('onboarding_complete')
        .eq('id', session.user.id)
        .single();

      if (!profile?.onboarding_complete) {
        router.replace('/onboarding/first-memory');
      } else {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectTo = searchParams.get('redirect');
        router.replace(redirectTo || '/dashboard/our-family');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err?.message ?? "";

      if (message.toLowerCase().includes("invalid login credentials")) {
        setError(
          "We could not log you in.\n\nIf you signed up with Google, please continue with Google.\nOtherwise you may need to reset your password."
        );
      } else {
        setError(message || "Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  // ---------------------------
  // PASSWORD RESET
  // ---------------------------
  const sendReset = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    setResetBusy(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }

    setResetBusy(false);
  };

  // ---------------------------
  // GOOGLE LOGIN
  // ---------------------------
  const handleGoogleLogin = async () => {
    setError(null);

    const searchParams = new URLSearchParams(window.location.search);
    const redirectTo = searchParams.get('redirect');
    if (redirectTo) sessionStorage.setItem('post_login_redirect', redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <AuthShell variant="login">
      <h1 className={auth.title}>
        Welcome <span className={site.accentPink}>back.</span>
      </h1>
      <p className={auth.intro}>Your family&apos;s stories are right where you left them.</p>

      {/* Google */}
      <button type="button" onClick={handleGoogleLogin} className={`${auth.social} ${forms.formStart}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.6 2.4 29.7 0 24 0 14.6 0 6.4 5.8 2.6 14.2l7.5 5.8C12.1 13.2 17.6 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.6c-.3 2-1.6 5-4.4 7l6.8 5.3c4-3.7 7.1-9.2 7.1-15.9z"/>
          <path fill="#FBBC05" d="M10.1 28c-1-3-1-6.2 0-9.2l-7.5-5.8C.9 16.3 0 20 0 24c0 4 1 7.7 2.6 11l7.5-5.8z"/>
          <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-6.8-5.3c-1.9 1.3-4.5 2.2-9.2 2.2-6.4 0-11.9-3.7-13.9-8.5l-7.5 5.8C6.4 42.2 14.6 48 24 48z"/>
        </svg>
        Continue with Google
      </button>

      <div className={auth.divider}>or with email</div>

      {/* Form */}
      <form onSubmit={onSubmit}>
        <label htmlFor="login-email" className={site.label}>
          Email
        </label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={site.input}
          placeholder="you@family.com"
          autoComplete="email"
        />

        <div className={forms.labelRow}>
          <label htmlFor="login-password" className={site.label}>
            Password
          </label>
          <button
            type="button"
            onClick={sendReset}
            disabled={resetBusy}
            className={forms.linkButton}
          >
            {resetBusy ? "Sending…" : "Forgot password?"}
          </button>
        </div>
        <div className={forms.pwWrap}>
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={site.input}
            placeholder="Your password"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className={forms.toggle}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error && (
          <div role="alert" className={`${site.noticeError} ${forms.notice}`}>
            {error}
          </div>
        )}
        {resetSent && (
          <div role="status" className={`${site.notice} ${forms.notice}`}>
            Password reset email sent. Please check your inbox.
          </div>
        )}

        <SubmitButton disabled={busy} className={forms.submit}>
          {busy ? "Logging in…" : "Log In"}
        </SubmitButton>
      </form>

      {/* Footer links */}
      <p className={auth.switch}>
        New to Ancestorii?{" "}
        <Link href="/signup" prefetch className={forms.tapLink}>
          Create a free account
        </Link>
      </p>
    </AuthShell>
  );
}
