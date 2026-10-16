"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/browser";
import { safeRedirect } from "@/lib/safeRedirect";
import AuthShell from "@/components/site/AuthShell";
import GoogleButton, { signInWithGoogle } from "@/components/site/auth/GoogleButton";
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
        router.replace(safeRedirect(searchParams.get('redirect')) || '/dashboard/our-family');
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

    const error = await signInWithGoogle();

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
      <GoogleButton onClick={handleGoogleLogin} className={forms.formStart} />

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
